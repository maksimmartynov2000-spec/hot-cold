\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка: Лев и Кира друзья, Максим сам по себе
do $$ begin
  delete from friend_chat; delete from friend_chat_read;
  delete from matches; delete from rivalry;
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

\echo === 6. вызов друга на рейтинг идёт по правилам режима
do $$
declare mid bigint; m matches; r record;
begin
  delete from matches;
  mid := challenge_friend_ranked('Лев','1234','Кира', 3);
  select * into m from matches where id = mid;
  select * into r from ranked_rules(3);
  if m.status is distinct from 'invited' then raise exception 'ОШИБКА: начался без согласия'; end if;
  if not m.ranked or m.ranked_mode is distinct from 3 then
    raise exception 'ОШИБКА: матч не рейтинговый или не тот режим';
  end if;
  if (m.range_min, m.range_max, m.frost, m.bonuses_on)
     is distinct from (r.range_min, r.range_max, r.frost, r.bonuses) then
    raise exception 'ОШИБКА: условия разъехались с режимом';
  end if;
  if m.wins_needed is distinct from 3 then raise exception 'ОШИБКА: не три победы'; end if;
  if respond_challenge('Кира','4321', mid, true) is distinct from 'active' then
    raise exception 'ОШИБКА: вызов не принимается';
  end if;
end $$;
\echo ok

\echo === 7. рейтинг за игру с другом начисляется, но по лесенке
do $$
declare mid bigint; m matches; lev int;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  mid := challenge_friend_ranked('Лев','1234','Кира', 0);
  perform respond_challenge('Кира','4321', mid, true);
  select * into m from matches where id = mid;
  update matches set wins[match_seat(m,'Лев') + 1] = 2, cur = match_seat(m, 'Лев'),
      turn_deadline = now() + interval '1 minute' where id = mid;
  select * into m from matches where id = mid;
  perform match_guess('Лев','1234', mid, m.secret);
  select elo into lev from elo_ratings where username = 'Лев' and mode = 0;
  if lev is distinct from 1020 then raise exception 'ОШИБКА: первая победа дала %', lev; end if;
  if (select streak from rivalry) is distinct from 1 then
    raise exception 'ОШИБКА: серия не посчитана';
  end if;
end $$;
\echo ok

\echo === 8. на рейтинг зовут только друга и только в существующий режим
do $$ begin
  delete from matches;
  begin
    perform challenge_friend_ranked('Лев','1234','Максим', 0);
    raise exception 'ОШИБКА: позвал не друга';
  exception when others then
    if sqlerrm is distinct from 'not_a_friend' then raise; end if;
  end;
  begin
    perform challenge_friend_ranked('Лев','1234','Кира', 9);
    raise exception 'ОШИБКА: принял несуществующий режим';
  exception when others then
    if sqlerrm is distinct from 'bad_mode' then raise; end if;
  end;
  perform challenge_friend_ranked('Лев','1234','Кира', 0);
  begin
    perform challenge_friend_ranked('Лев','1234','Кира', 1);
    raise exception 'ОШИБКА: создалось два вызова разом';
  exception when others then
    if sqlerrm is distinct from 'match_already_live' then raise; end if;
  end;
end $$;
\echo ok

\echo === 9. удаление аккаунта уносит переписку
do $$
declare gone text; n int;
begin
  delete from matches; delete from friend_chat; delete from friend_chat_read;
  delete from students where username like 'Прохожий%';
  perform register_student('Прохожий','5555');
  perform send_friend_request('Прохожий','5555','Лев');
  perform respond_friend_request('Лев','1234','Прохожий',true);
  perform send_friend_phrase('Прохожий','5555','Лев','hi');
  perform friend_thread('Лев','1234','Прохожий');

  gone := delete_account('Прохожий','5555');
  select count(*) into n from friend_chat;
  if n is distinct from 0 then raise exception 'ОШИБКА: переписка осталась (% строк)', n; end if;
  select count(*) into n from friend_chat_read;
  if n is distinct from 0 then raise exception 'ОШИБКА: отметки о прочтении остались'; end if;
  if exists (select 1 from students where username = 'Прохожий') then
    raise exception 'ОШИБКА: имя не освободилось';
  end if;
end $$;
\echo ok

\echo === 10. фразы переводятся кодом, а не текстом
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

\echo === 11. anon не читает чужую переписку напрямую
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
  delete from matches; delete from elo_ratings; delete from rivalry;
  delete from students where username like '#%';
end $$;
\echo ok
