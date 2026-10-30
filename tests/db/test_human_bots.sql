\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Соперники-«люди» (миграция 050) и звёзды Приключения. Всё в одной
-- транзакции и откатывается: партии меняют рейтинг и задания
begin;
-- run.sh выключает правило старта для остальных сценариев — здесь оно нужно
alter table matches enable trigger matches_flow;

\echo === подготовка
do $$ begin
  delete from ranked_queue;
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
end $$;
\echo ok

\echo === 1. аккаунты-«люди»: обычные ники, войти нельзя, в поиске и друзьях их нет
do $$
declare n int; who text;
begin
  select count(*) into n from bot_people b join students s on s.username = b.username
  where s.is_bot and s.username not like '@bot:%';
  if n < 35 then raise exception 'ОШИБКА: «людей» %', n; end if;
  select username into who from bot_people order by username limit 1;
  if check_student_pin(who, '1234') is not null then raise exception 'ОШИБКА: вход под ботом'; end if;
  update students set failed_logins = 0, locked_until = null where username = who;
  if exists (select 1 from find_students('Лев', '1234', left(who, 3)) f where f.username = who) then
    raise exception 'ОШИБКА: бот в поиске';
  end if;
  begin
    perform send_friend_request('Лев', '1234', who);
    raise exception 'ОШИБКА: заявка боту';
  exception when others then if sqlerrm not like '%no_such_student%' then raise; end if;
  end;
  -- Повторный посев ничего не ломает и чужие аккаунты не трогает
  perform bot_people_seed();
  if (select count(*) from bot_people) <> n then raise exception 'ОШИБКА: посев дважды'; end if;
end $$;
\echo ok

\echo === 2. из очереди — партия с «человеком»: он заходит не сразу, botSeat не видно
do $$
declare r jsonb; mid bigint; st jsonb; m matches;
begin
  perform join_ranked_queue('Лев', '1234', 0);
  update ranked_queue set joined_at = now() - interval '26 seconds' where username = 'Лев';
  r := ranked_status('Лев', '1234', 0);
  mid := (r->>'matchId')::bigint;
  if mid is null then raise exception 'ОШИБКА: соперника нет'; end if;
  perform set_config('t.m', mid::text, false);
  select * into m from matches where id = mid;
  if not m.lobby or m.bot_seat <> 1 then raise exception 'ОШИБКА: без ожидания: %', row_to_json(m); end if;
  st := match_state('Лев', '1234', mid);
  if st->>'botSeat' is not null then raise exception 'ОШИБКА: игра видит бота'; end if;
  if st->'names'->>1 <> m.p1 then raise exception 'ОШИБКА: имя %', st->'names'; end if;
  if not (st->>'lobby')::boolean or (st->'present'->>1)::boolean then
    raise exception 'ОШИБКА: бот на месте мгновенно: %', st->'present';
  end if;
  update matches set accepted_at = now() - interval '5 seconds' where id = mid;
  st := match_state('Лев', '1234', mid);
  if (st->>'lobby')::boolean or (st->>'startsIn')::int not between 1 and 3 then
    raise exception 'ОШИБКА: не стартовали: lobby %, startsIn %', st->>'lobby', st->>'startsIn';
  end if;
end $$;
\echo ok

\echo === 3. ход «человека»: не мгновенно, но и не дольше хода
do $$
declare mid bigint := current_setting('t.m')::bigint; n int;
begin
  update matches set start_at = now() - interval '1 second', cur = 1,
                     turn_deadline = now() + interval '29.8 seconds' where id = mid;
  perform match_state('Лев', '1234', mid);
  select count(*) into n from match_moves where match_id = mid;
  if n <> 0 then raise exception 'ОШИБКА: бот походил мгновенно'; end if;
  update matches set turn_deadline = now() + interval '3 seconds' where id = mid;
  perform match_state('Лев', '1234', mid);
  select count(*) into n from match_moves where match_id = mid and seat = 1;
  if n <> 1 then raise exception 'ОШИБКА: за 27 секунд бот не походил (%)', n; end if;
end $$;
\echo ok

\echo === 4. «Готов» у «человека» — через несколько секунд после итога раунда
do $$
declare mid bigint := current_setting('t.m')::bigint; st jsonb; r0 int; started boolean;
begin
  update matches set round_over = true, round_winner = 0 where id = mid;
  select round into r0 from matches where id = mid;
  started := next_match_round('Лев', '1234', mid);
  if started then raise exception 'ОШИБКА: бот готов мгновенно'; end if;
  st := match_state('Лев', '1234', mid);
  if (st->'ready'->>1)::boolean or not (st->'ready'->>0)::boolean then
    raise exception 'ОШИБКА: готовность %', st->'ready';
  end if;
  update matches set round_ended_at = now() - interval '7.5 seconds' where id = mid;
  st := match_state('Лев', '1234', mid);
  if (st->>'round')::int <> r0 + 1 then raise exception 'ОШИБКА: раунд не начался: %', st->>'round'; end if;
end $$;
\echo ok

\echo === 5. реванш «человеку» — приглашение, ответ через несколько секунд
do $$
declare mid bigint := current_setting('t.m')::bigint; nid bigint; st jsonb; m matches;
begin
  update matches set status = 'finished', match_over = true, updated_at = now() - interval '100 seconds' where id = mid;
  nid := rematch('Лев', '1234', mid);
  select * into m from matches where id = nid;
  if m.status <> 'invited' or m.bot_seat <> 1 or m.bot_level is null then
    raise exception 'ОШИБКА: реванш %', row_to_json(m);
  end if;
  st := match_state('Лев', '1234', mid);
  if (st->'rematch'->>'id')::bigint <> nid or st->'rematch'->>'status' <> 'invited'
     or not (st->'rematch'->>'mine')::boolean then
    raise exception 'ОШИБКА: игра не видит реванш: %', st->'rematch';
  end if;
  update matches set created_at = now() - interval '10 seconds' where id = nid;
  st := match_state('Лев', '1234', mid);
  select * into m from matches where id = nid;
  if m.status not in ('active', 'declined') then raise exception 'ОШИБКА: бот не ответил: %', m.status; end if;
  if m.status = 'active' and not m.lobby then raise exception 'ОШИБКА: реванш без ожидания'; end if;
  if st->'rematch'->>'status' <> m.status then raise exception 'ОШИБКА: ответ не виден: %', st->'rematch'; end if;
  update matches set status = 'finished' where id = nid;
end $$;
\echo ok

\echo === 6. «человек» сам зовёт на реванш, а «Реванш» игрока это приглашение принимает
do $$
declare mid bigint; i int := 0; who text; st jsonb; x matches; nid bigint;
begin
  select username into who from bot_people order by username desc limit 1;
  loop
    i := i + 1;
    insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, match_over)
    values ('Кира', who, true, 0, 'finished', 1, 100, 1, 0.4, true) returning id into mid;
    exit when bot_u(mid || ':offer') < 0.35 or i > 60;
  end loop;
  if bot_u(mid || ':offer') >= 0.35 then raise exception 'ОШИБКА: не нашли партию для проверки'; end if;
  update matches set updated_at = now() - interval '12 seconds', seen_at = array[now(), null]::timestamptz[] where id = mid;
  st := match_state('Кира', '4321', mid);
  select * into x from matches where id > mid and p0 = who and p1 = 'Кира';
  if x.id is null or x.status <> 'invited' or x.bot_seat <> 0 then raise exception 'ОШИБКА: бот не позвал: %', row_to_json(x); end if;
  if not exists (select 1 from match_chat where match_id = mid and seat = 1 and code = 'again') then
    raise exception 'ОШИБКА: без фразы «ещё раз»';
  end if;
  st := match_state('Кира', '4321', mid);
  if (st->'rematch'->>'mine')::boolean or st->'rematch'->>'status' <> 'invited' then
    raise exception 'ОШИБКА: приглашение не видно: %', st->'rematch';
  end if;
  -- Зовёт один раз
  update matches set status = 'declined' where id = x.id;
  perform match_state('Кира', '4321', mid);
  if (select count(*) from matches where id > mid and p0 = who and p1 = 'Кира') <> 1 then
    raise exception 'ОШИБКА: бот зовёт снова';
  end if;
  update matches set status = 'invited' where id = x.id;
  nid := rematch('Кира', '4321', mid);
  if nid <> x.id or (select status from matches where id = nid) <> 'active' then
    raise exception 'ОШИБКА: «Реванш» не принял приглашение';
  end if;
  update matches set status = 'finished' where id = nid;
end $$;
\echo ok

\echo === 7. у «людей» нет ни заданий, ни достижений, ни лестницы
do $$ begin
  if exists (select 1 from achievements a join bot_people b on b.username = a.username) then
    raise exception 'ОШИБКА: у бота достижения';
  end if;
  if exists (select 1 from daily_quests q join bot_people b on b.username = q.username) then
    raise exception 'ОШИБКА: у бота задания';
  end if;
  if exists (select 1 from ladder l join bot_people b on b.username = l.username) then
    raise exception 'ОШИБКА: бот в лестнице';
  end if;
  if exists (select 1 from elo_ratings e join bot_people b on b.username = e.username) then
    raise exception 'ОШИБКА: у бота рейтинг';
  end if;
end $$;
\echo ok

\echo === 8. звёзды Приключения: лучший результат, слияние с телефоном
do $$
declare r jsonb;
begin
  update students set adventure = 0, adventure_stars = '' where username = 'Лев';
  begin
    perform adventure_result('Лев', '1234', 3, 2);
    raise exception 'ОШИБКА: звёзды за закрытого соперника';
  exception when others then if sqlerrm not like '%not_open%' then raise; end if;
  end;
  r := adventure_result('Лев', '1234', 0, 1);
  if r->>'stars' <> '1' or (r->>'done')::int <> 1 or (r->>'new')::int <> 1 then raise exception 'ОШИБКА: %', r; end if;
  r := adventure_result('Лев', '1234', 0, 3);
  if r->>'stars' <> '3' or (r->>'new')::int <> 2 then raise exception 'ОШИБКА: улучшение %', r; end if;
  r := adventure_result('Лев', '1234', 0, 1);
  if r->>'stars' <> '3' or (r->>'new')::int <> 0 then raise exception 'ОШИБКА: хуже лучшего: %', r; end if;
  r := adventure_sync('Лев', '1234', 12, '012222222223');
  if r->>'stars' <> '312222222223' or (r->>'done')::int <> 12 or (r->>'total')::int <> 25 then
    raise exception 'ОШИБКА: слияние %', r;
  end if;
  begin
    perform adventure_sync('Лев', '1234', 1, '9');
    raise exception 'ОШИБКА: звёзды 9';
  exception when others then if sqlerrm not like '%bad_stars%' then raise; end if;
  end;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'adv_worlds_1') then
    raise exception 'ОШИБКА: мир пройден, а достижения нет';
  end if;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'adv_stars_10') then
    raise exception 'ОШИБКА: 25 звёзд, а достижения нет';
  end if;
  r := my_progress('Лев', '1234', null);
  if (r->'stats'->>'advStars')::int <> 25 or (r->'stats'->>'advWorlds')::int <> 1 then
    raise exception 'ОШИБКА: счётчики %', r->'stats';
  end if;
end $$;
\echo ok

\echo === 9. задания дня про Приключение
do $$
declare d date; p int;
begin
  d := quest_ensure('Лев');
  delete from daily_quests where username = 'Лев' and day = d;
  insert into daily_quests(username, day, slot, code, goal) values
    ('Лев', d, 1, 'adv_win2', 2), ('Лев', d, 2, 'win1', 1), ('Лев', d, 3, 'adv_stars3', 3);
  perform adventure_result('Лев', '1234', 1, 2);
  perform adventure_result('Лев', '1234', 1, 3);
  select progress into p from daily_quests where username = 'Лев' and day = d and code = 'adv_win2';
  if p <> 2 then raise exception 'ОШИБКА: побед %', p; end if;
  -- Было 1, стало 2, потом 3: новых звёзд две
  select progress into p from daily_quests where username = 'Лев' and day = d and code = 'adv_stars3';
  if p <> 2 then raise exception 'ОШИБКА: новых звёзд %', p; end if;
end $$;
\echo ok

\echo === 10. звёзды друга — только другу
do $$
declare r jsonb;
begin
  if friend_status('Лев', 'Кира') is distinct from 'friend' then
    perform send_friend_request('Лев', '1234', 'Кира');
    if friend_status('Лев', 'Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира', '4321', 'Лев', true);
    end if;
  end if;
  r := friend_adventure('Кира', '4321', 'Лев');
  if (r->>'total')::int <> 27 then raise exception 'ОШИБКА: у друга %', r; end if;
  delete from friendships where (requester = 'Максим' and addressee = 'Лев') or (requester = 'Лев' and addressee = 'Максим');
  begin
    perform friend_adventure('Максим', '1111', 'Лев');
    raise exception 'ОШИБКА: чужие звёзды';
  exception when others then if sqlerrm not like '%not_friends%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 11. служебное anon недоступно
set local role anon;
do $$
declare f text;
begin
  foreach f in array array['bot_after_match(bigint)', 'bot_people_seed()', 'match_side_here(matches,int)',
                           'match_side_ready(matches,int)', 'bot_act(bigint)', 'ranked_pair(text,int)'] loop
    if has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon может %', f; end if;
  end loop;
  foreach f in array array['adventure_sync(text,text,int,text)', 'adventure_result(text,text,int,int)',
                           'friend_adventure(text,text,text)', 'match_state(text,text,bigint)'] loop
    if not has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon не может %', f; end if;
  end loop;
end $$;
reset role;
\echo ok

rollback;
