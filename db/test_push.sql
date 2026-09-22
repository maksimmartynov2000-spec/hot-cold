\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$ begin
  delete from push_outbox; delete from push_subscriptions;
  delete from friend_chat; delete from friend_chat_read;
  delete from matches; delete from friendships;
  update game_config set vapid_public = null where id = 1;
  update students set created_at = now() - interval '2 hours';
end $$;
\echo ok

\echo === 1. пока ключа нет, клиенту нечего показывать
do $$ begin
  if push_config() is not null then raise exception 'ОШИБКА: ключ взялся из ниоткуда'; end if;
  update game_config set vapid_public = 'BKtest' where id = 1;
  if push_config() is distinct from 'BKtest' then raise exception 'ОШИБКА: ключ не отдаётся'; end if;
end $$;
\echo ok

\echo === 2. подписка сохраняется и заменяется, а не плодится
do $$
declare n int;
begin
  perform save_push_subscription('Лев','1234','https://push.example/abc','p1','a1','ru');
  perform save_push_subscription('Лев','1234','https://push.example/abc','p2','a2','fr');
  select count(*) into n from push_subscriptions where username = 'Лев';
  if n is distinct from 1 then raise exception 'ОШИБКА: подписок %, ждали одну', n; end if;
  if (select p256dh from push_subscriptions where endpoint = 'https://push.example/abc')
     is distinct from 'p2' then
    raise exception 'ОШИБКА: ключи подписки не обновились';
  end if;
  if (select lang from push_subscriptions where endpoint = 'https://push.example/abc')
     is distinct from 'fr' then
    raise exception 'ОШИБКА: язык подписки не обновился';
  end if;

  -- Одно устройство — одна строка, но устройств может быть несколько
  perform save_push_subscription('Лев','1234','https://push.example/two','p3','a3','en');
  select count(*) into n from push_subscriptions where username = 'Лев';
  if n is distinct from 2 then raise exception 'ОШИБКА: второе устройство не записалось'; end if;
end $$;
\echo ok

\echo === 3. чужую подписку не отписать, свою — можно
do $$
declare n int;
begin
  perform drop_push_subscription('Кира','4321','https://push.example/abc');
  select count(*) into n from push_subscriptions where endpoint = 'https://push.example/abc';
  if n is distinct from 1 then raise exception 'ОШИБКА: отписали чужое устройство'; end if;
  perform drop_push_subscription('Лев','1234','https://push.example/abc');
  select count(*) into n from push_subscriptions where endpoint = 'https://push.example/abc';
  if n is distinct from 0 then raise exception 'ОШИБКА: своё устройство не отписалось'; end if;
end $$;
\echo ok

\echo === 4. заявка в друзья кладёт строку в очередь тому, кому написали
do $$
declare r push_outbox;
begin
  delete from push_outbox; delete from friendships;
  perform send_friend_request('Лев','1234','Кира');
  select * into r from push_outbox order by id desc limit 1;
  if r.username is distinct from 'Кира' then raise exception 'ОШИБКА: уведомление не тому'; end if;
  if r.kind is distinct from 'friend_request' then raise exception 'ОШИБКА: не тот повод'; end if;
  if r.who is distinct from 'Лев' then raise exception 'ОШИБКА: не сказано, от кого'; end if;
  if r.sent_at is not null then raise exception 'ОШИБКА: помечено отправленным заранее'; end if;
  -- Ответ на заявку новых уведомлений не плодит
  perform respond_friend_request('Кира','4321','Лев',true);
  if (select count(*) from push_outbox) is distinct from 1 then
    raise exception 'ОШИБКА: ответ на заявку тоже уведомил';
  end if;
end $$;
\echo ok

\echo === 5. вызов на игру уведомляет приглашённого
do $$
declare mid bigint; r push_outbox;
begin
  delete from push_outbox; delete from matches;
  mid := challenge_friend('Лев','1234','Кира',100,false,3,false,null);
  select * into r from push_outbox order by id desc limit 1;
  if (r.username, r.kind, r.who) is distinct from ('Кира', 'challenge', 'Лев') then
    raise exception 'ОШИБКА: вызов уведомил неправильно: % % %', r.username, r.kind, r.who;
  end if;
  perform respond_challenge('Кира','4321', mid, true);
  if (select count(*) from push_outbox) is distinct from 1 then
    raise exception 'ОШИБКА: принятый вызов уведомил ещё раз';
  end if;

  -- Рейтинговая игра из подбора никого не дёргает: оба и так у экрана
  delete from matches; delete from push_outbox; delete from ranked_queue;
  perform join_ranked_queue('Лев','1234', 0);
  perform join_ranked_queue('Кира','4321', 0);
  if (select count(*) from push_outbox) is distinct from 0 then
    raise exception 'ОШИБКА: подбор разослал уведомления';
  end if;
end $$;
\echo ok

\echo === 6. фраза другу уведомляет собеседника, а не себя
do $$
declare r push_outbox;
begin
  delete from push_outbox; delete from friend_chat; delete from matches;
  perform send_friend_phrase('Лев','1234','Кира','play');
  select * into r from push_outbox order by id desc limit 1;
  if (r.username, r.kind, r.who) is distinct from ('Кира', 'talk', 'Лев') then
    raise exception 'ОШИБКА: фраза уведомила неправильно: % % %', r.username, r.kind, r.who;
  end if;
  perform send_friend_phrase('Кира','4321','Лев','yes');
  select * into r from push_outbox order by id desc limit 1;
  if r.username is distinct from 'Лев' then raise exception 'ОШИБКА: ответ уведомил не того'; end if;
  if (select count(*) from push_outbox) is distinct from 2 then
    raise exception 'ОШИБКА: строк в очереди не две';
  end if;
end $$;
\echo ok

\echo === 7. удаление аккаунта уносит подписки и очередь
do $$
declare gone text;
begin
  delete from push_outbox; delete from push_subscriptions; delete from matches;
  delete from students where username like 'Уходящий%';
  perform register_student('Уходящий','5555');
  perform save_push_subscription('Уходящий','5555','https://push.example/x','p','a','ru');
  perform send_friend_request('Уходящий','5555','Лев');
  gone := delete_account('Уходящий','5555');
  if (select count(*) from push_subscriptions) is distinct from 0 then
    raise exception 'ОШИБКА: подписка осталась';
  end if;
  if exists (select 1 from push_outbox where username = gone or who = 'Уходящий') then
    raise exception 'ОШИБКА: очередь помнит удалённого';
  end if;
end $$;
\echo ok

\echo === 8. anon не читает подписки и очередь напрямую
begin;
set local role anon;
do $$ begin
  if (select count(*) from push_subscriptions) is distinct from 0 then
    raise exception 'ОШИБКА: anon читает подписки';
  end if;
  if (select count(*) from push_outbox) is distinct from 0 then
    raise exception 'ОШИБКА: anon читает очередь';
  end if;
  begin
    insert into push_subscriptions(endpoint, username, p256dh, auth)
    values ('https://push.example/hack','Лев','p','a');
    raise exception 'ОШИБКА: anon пишет подписку';
  exception when insufficient_privilege then null;
  end;
  -- А открытый ключ читать можно: он затем и открытый
  if push_config() is null then raise exception 'ОШИБКА: anon не получил открытый ключ'; end if;
end $$;
rollback;
\echo ok

\echo === 9. чужим PIN подписку не завести
do $$ begin
  begin
    perform save_push_subscription('Лев','9999','https://push.example/z','p','a','ru');
    raise exception 'ОШИБКА: подписались с чужим PIN';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

\echo === уборка
do $$ begin
  delete from push_outbox; delete from push_subscriptions;
  delete from friend_chat; delete from matches; delete from ranked_queue;
  update game_config set vapid_public = null where id = 1;
  delete from students where username like '#%';
end $$;
\echo ok
