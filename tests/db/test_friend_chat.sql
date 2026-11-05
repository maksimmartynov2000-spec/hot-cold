\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка: Лев и Кира друзья, Максим сам по себе
do $$ begin
  delete from friend_chat; delete from friend_chat_read;
  delete from matches;
  update students set created_at = now() - interval '2 hours';
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  if friend_status('Лев','Максим') = 'friend' then
    perform remove_friend('Лев','1234','Максим');
  end if;
end $$;
\echo ok

\echo === 1. фраза доходит до друга и подписана верно
do $$
declare th jsonb; m jsonb;
begin
  perform send_friend_phrase('Лев','1234','Кира','play');
  th := friend_thread('Кира','4321','Лев');
  if th->>'other' is distinct from 'Лев' then raise exception 'ОШИБКА: не тот собеседник'; end if;
  if jsonb_array_length(th->'messages') is distinct from 1 then
    raise exception 'ОШИБКА: сообщений % вместо одного', jsonb_array_length(th->'messages');
  end if;
  m := th->'messages'->0;
  if m->>'code' is distinct from 'play' then raise exception 'ОШИБКА: код фразы'; end if;
  if (m->>'mine')::boolean is distinct from false then
    raise exception 'ОШИБКА: чужая фраза помечена своей';
  end if;
  -- У отправителя та же фраза помечена своей
  th := friend_thread('Лев','1234','Кира');
  if (th->'messages'->0->>'mine')::boolean is distinct from true then
    raise exception 'ОШИБКА: своя фраза помечена чужой';
  end if;
end $$;
\echo ok

\echo === 2. непрочитанное видно в списке друзей и гаснет после чтения
do $$
declare n int;
begin
  delete from friend_chat; delete from friend_chat_read;
  perform send_friend_phrase('Лев','1234','Кира','hi');
  perform send_friend_phrase('Лев','1234','Кира','play');
  select unread into n from list_friends('Кира','4321') where username = 'Лев';
  if n is distinct from 2 then raise exception 'ОШИБКА: непрочитанных % вместо двух', n; end if;
  -- Свои сообщения непрочитанными не считаются
  select unread into n from list_friends('Лев','1234') where username = 'Кира';
  if n is distinct from 0 then raise exception 'ОШИБКА: свои фразы попали в непрочитанные'; end if;

  perform friend_thread('Кира','4321','Лев');
  select unread into n from list_friends('Кира','4321') where username = 'Лев';
  if n is distinct from 0 then raise exception 'ОШИБКА: после чтения осталось %', n; end if;

  -- Новая фраза снова считается
  perform send_friend_phrase('Лев','1234','Кира','hour');
  select unread into n from list_friends('Кира','4321') where username = 'Лев';
  if n is distinct from 1 then raise exception 'ОШИБКА: новая фраза не посчиталась'; end if;
end $$;
\echo ok

\echo === 3. писать можно только другу и только известной фразой
do $$ begin
  begin
    perform send_friend_phrase('Лев','1234','Максим','hi');
    raise exception 'ОШИБКА: написал не другу';
  exception when others then
    if sqlerrm is distinct from 'not_a_friend' then raise; end if;
  end;
  begin
    perform send_friend_phrase('Лев','1234','Кира','сам придумал');
    raise exception 'ОШИБКА: приняли свободный текст';
  exception when others then
    if sqlerrm is distinct from 'bad_phrase' then raise; end if;
  end;
  begin
    perform friend_thread('Лев','1234','Максим');
    raise exception 'ОШИБКА: прочитал переписку с не-другом';
  exception when others then
    if sqlerrm is distinct from 'not_a_friend' then raise; end if;
  end;
end $$;
\echo ok

\echo === 4. фразами не закидать
do $$
declare i int;
begin
  delete from friend_chat;
  for i in 1..10 loop perform send_friend_phrase('Лев','1234','Кира','hi'); end loop;
  begin
    perform send_friend_phrase('Лев','1234','Кира','hi');
    raise exception 'ОШИБКА: одиннадцатая фраза за минуту прошла';
  exception when others then
    if sqlerrm is distinct from 'too_fast' then raise; end if;
  end;
  -- Ответить собеседнику это не мешает
  if send_friend_phrase('Кира','4321','Лев','no') is null then
    raise exception 'ОШИБКА: ограничение задело собеседника';
  end if;
end $$;
\echo ok

\echo === 5. хранятся только полсотни последних
do $$
declare i int; n int; th jsonb;
begin
  delete from friend_chat;
  -- Старые сообщения кладём задним числом, иначе на них сработает защита
  -- от потока фраз, которую проверяет предыдущий сценарий
  for i in 1..60 loop
    insert into friend_chat(a, b, sender, code, created_at)
    values (least('Лев','Кира'), greatest('Лев','Кира'), 'Лев', 'hi',
            now() - interval '10 minutes');
  end loop;
  perform send_friend_phrase('Лев','1234','Кира','bye');
  select count(*) into n from friend_chat;
  if n > 50 then raise exception 'ОШИБКА: осталось % сообщений', n; end if;
  th := friend_thread('Кира','4321','Лев');
  if (th->'messages'->-1->>'code') is distinct from 'bye' then
    raise exception 'ОШИБКА: последнее сообщение потерялось';
  end if;
end $$;
\echo ok

\echo === 6. на рейтинг друга не позвать: рейтинга нет (миграция 062)
do $$ begin
  if exists (select 1 from pg_proc where proname = 'challenge_friend_ranked') then
    raise exception 'ОШИБКА: вызов на рейтинг остался';
  end if;
end $$;
\echo ok

\echo === 7. удаление аккаунта уносит переписку
do $$
declare gone text; n int;
begin
  delete from matches; delete from friend_chat; delete from friend_chat_read;
  delete from students where username like 'Прохожий%';
  perform register_student('Прохожий','555555');
  perform send_friend_request('Прохожий','555555','Лев');
  perform respond_friend_request('Лев','1234','Прохожий',true);
  perform send_friend_phrase('Прохожий','555555','Лев','hi');
  perform friend_thread('Лев','1234','Прохожий');

  gone := delete_account('Прохожий','555555');
  select count(*) into n from friend_chat;
  if n is distinct from 0 then raise exception 'ОШИБКА: переписка осталась (% строк)', n; end if;
  select count(*) into n from friend_chat_read;
  if n is distinct from 0 then raise exception 'ОШИБКА: отметки о прочтении остались'; end if;
  if exists (select 1 from students where username = 'Прохожий') then
    raise exception 'ОШИБКА: имя не освободилось';
  end if;
end $$;
\echo ok

\echo === 8. фразы переводятся кодом, а не текстом
do $$
declare codes text[];
begin
  codes := friend_phrases();
  if array_length(codes, 1) is distinct from 16 then
    raise exception 'ОШИБКА: фраз %, ждали шестнадцать', array_length(codes, 1);
  end if;
  if array_length(array(select distinct unnest(codes)), 1) is distinct from 16 then
    raise exception 'ОШИБКА: среди фраз есть повторы';
  end if;
  if not ('playranked' = any(codes)) then
    raise exception 'ОШИБКА: нечем позвать на рейтинг';
  end if;
end $$;
\echo ok

\echo === 9. anon не читает чужую переписку напрямую
begin;
set local role anon;
do $$ begin
  if (select count(*) from friend_chat) is distinct from 0 then
    raise exception 'ОШИБКА: anon читает переписку';
  end if;
  begin
    insert into friend_chat(a, b, sender, code) values ('Кира','Лев','Кира','hi');
    raise exception 'ОШИБКА: anon пишет в переписку';
  exception when insufficient_privilege then null;
  end;
  begin
    perform friend_phrases();
    raise exception 'ОШИБКА: anon зовёт служебную функцию';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
\echo ok

\echo === уборка
do $$ begin
  delete from friend_chat; delete from friend_chat_read;
  delete from matches;
  delete from students where username like '#%';
end $$;
\echo ok
