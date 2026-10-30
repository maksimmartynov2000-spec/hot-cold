\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Таблица турнира, рамка месяца, задания про режим дня, уведомления турнира
-- (миграция 055). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, tz = 'Europe/Moscow' where username = 'Лев';
  update students set tz = 'Asia/Makassar' where username = 'Кира';
  update matches set status = 'finished' where status in ('invited', 'active');
  delete from weekend_cup; delete from cup_notices;
  delete from cosmetics where username in ('Лев', 'Кира');
  delete from push_outbox;
  delete from friendships where 'Лев' in (requester, addressee) or 'Кира' in (requester, addressee);
  insert into friendships(requester, addressee, status) values ('Лев', 'Кира', 'accepted');
end $$;
\echo ok

\echo === 1. рамка за 5 побед — по месяцу субботы, коллекция растёт
do $$
declare r jsonb;
begin
  perform set_config('hc.now', '2026-10-31 12:00+00', true);  -- суббота, октябрь
  if cup_frame_code() <> 'cup-10' then raise exception 'ОШИБКА: рамка октября %', cup_frame_code(); end if;
  insert into weekend_cup(username, week, wins) values ('Лев', weekend_key(), 5);
  r := weekend_claim('Лев', '1234', 5);
  if r->>'frame' <> 'cup-10' or not cosmetic_has('Лев', 'frame', 'cup-10') then raise exception 'ОШИБКА: %', r; end if;
  if set_frame('Лев', '1234', 'cup-10') <> 'cup-10' then raise exception 'ОШИБКА: не надеть'; end if;
  -- В понедельник 2 ноября — всё ещё рамка тех (октябрьских) выходных
  perform set_config('hc.now', '2026-11-02 09:00+00', true);
  if cup_frame_code() <> 'cup-10' then raise exception 'ОШИБКА: понедельник %', cup_frame_code(); end if;
  if (my_online('Лев', '1234')->'weekend'->>'frame') <> 'cup-10' then raise exception 'ОШИБКА: my_online без рамки'; end if;
  -- Ноябрь: новая рамка
  perform set_config('hc.now', '2026-11-07 12:00+00', true);
  insert into weekend_cup(username, week, wins) values ('Лев', weekend_key(), 5);
  r := weekend_claim('Лев', '1234', 5);
  if r->>'frame' <> 'cup-11' then raise exception 'ОШИБКА: ноябрь %', r; end if;
  -- Ещё одни выходные ноября — рамка уже есть, большой сундук
  perform set_config('hc.now', '2026-11-14 12:00+00', true);
  insert into weekend_cup(username, week, wins) values ('Лев', weekend_key(), 5);
  r := weekend_claim('Лев', '1234', 5);
  if r->>'frame' is not null or (r->>'xp')::int <> 100 then raise exception 'ОШИБКА: второй раз в ноябре %', r; end if;
  if array_length(pass_frames(), 1) <> 18 then raise exception 'ОШИБКА: рамок %', array_length(pass_frames(), 1); end if;
  perform set_config('hc.now', '', true);
end $$;
\echo ok

\echo === 2. таблица: десятка с «людьми», друзья с нулём, к концу выходных побед больше
do $$
declare r jsonb; early int; late int;
begin
  perform set_config('hc.now', '2026-11-21 01:00+00', true);  -- суббота, начало
  insert into weekend_cup(username, week, wins) values ('Лев', weekend_key(), 2);
  r := cup_top('Лев', '1234');
  if jsonb_array_length(r->'friends') <> 2 then raise exception 'ОШИБКА: друзья %', r->'friends'; end if;
  if (r->'friends'->0->>'username') <> 'Лев' or (r->'friends'->1->>'wins')::int <> 0 then raise exception 'ОШИБКА: порядок друзей %', r->'friends'; end if;
  select coalesce(sum((x->>'wins')::int), 0) into early from jsonb_array_elements(r->'top') x;
  perform set_config('hc.now', '2026-11-22 23:00+00', true);  -- воскресенье, конец
  r := cup_top('Лев', '1234');
  select coalesce(sum((x->>'wins')::int), 0) into late from jsonb_array_elements(r->'top') x;
  if jsonb_array_length(r->'top') < 5 or jsonb_array_length(r->'top') > 10 then raise exception 'ОШИБКА: десятка %', r->'top'; end if;
  if not exists (select 1 from jsonb_array_elements(r->'top') x join bot_people b on b.username = x->>'username') then
    raise exception 'ОШИБКА: в таблице нет «людей»';
  end if;
  if late <= early then raise exception 'ОШИБКА: к концу не прибавилось % → %', early, late; end if;
  if exists (select 1 from jsonb_array_elements(r->'top') x where (x->>'wins')::int <= 0) then raise exception 'ОШИБКА: ноль в десятке'; end if;
  perform set_config('hc.now', '', true);
end $$;
\echo ok

\echo === 3. задания: партия и победа в режиме дня
do $$
declare mid bigint; d date;
begin
  d := quest_ensure('Лев');
  delete from daily_quests where username = 'Лев' and day = d;
  insert into daily_quests(username, day, slot, code, goal) values ('Лев', d, 1, 'daily2', 2), ('Лев', d, 2, 'daily_win1', 1);
  insert into matches(p0, p1, status, ranked, ranked_mode) values ('Лев', 'Кира', 'active', true, 4) returning id into mid;
  update matches set wins = array[wins_needed, 0], match_over = true, status = 'finished' where id = mid;
  if (select progress from daily_quests where username = 'Лев' and day = d and code = 'daily2') <> 1
     or (select progress from daily_quests where username = 'Лев' and day = d and code = 'daily_win1') <> 1 then
    raise exception 'ОШИБКА: задания режима дня';
  end if;
  -- Обычный режим в счёт не идёт
  insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max) values ('Лев', 'Кира', 'active', true, 0, 1, 100) returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  if (select progress from daily_quests where username = 'Лев' and day = d and code = 'daily2') <> 1 then
    raise exception 'ОШИБКА: обычная партия засчитана';
  end if;
end $$;
\echo ok

\echo === 4. уведомления: по местному времени, раз за выходные, только играющим
do $$
declare n int;
begin
  insert into push_subscriptions(username, endpoint, p256dh, auth, lang) values ('Лев', 'https://e/1', 'k', 'a', 'ru'), ('Кира', 'https://e/2', 'k', 'a', 'ru')
  on conflict do nothing;
  delete from online_days where username in ('Лев', 'Кира');
  insert into online_days(username, day, played) values ('Лев', date '2026-11-27', true);  -- Кира давно не играла
  perform set_config('hc.now', '2026-11-27 12:00+00', true);  -- пятница
  if push_tick() <> 0 then raise exception 'ОШИБКА: пуш в будни'; end if;
  perform set_config('hc.now', '2026-11-28 05:00+00', true);  -- суббота, в Москве 08:00 — рано
  if push_tick() <> 0 then raise exception 'ОШИБКА: пуш в 8 утра'; end if;
  perform set_config('hc.now', '2026-11-28 09:00+00', true);  -- в Москве 12:00
  n := push_tick();
  if n <> 1 or not exists (select 1 from push_outbox where username = 'Лев' and kind = 'cup_start') then raise exception 'ОШИБКА: начало турнира %', n; end if;
  if exists (select 1 from push_outbox where username = 'Кира') then raise exception 'ОШИБКА: пуш тому, кто не играл'; end if;
  if push_tick() <> 0 then raise exception 'ОШИБКА: второй раз'; end if;
  -- Воскресенье вечером: 4 победы — до рамки одна
  insert into weekend_cup(username, week, wins) values ('Лев', weekend_key(), 4) on conflict (username, week) do update set wins = 4;
  perform set_config('hc.now', '2026-11-29 15:00+00', true);  -- в Москве 18:00
  n := push_tick();
  if n <> 1 or (select who from push_outbox where username = 'Лев' and kind = 'cup_left') <> '1|5' then
    raise exception 'ОШИБКА: «до награды» %', (select who from push_outbox where kind = 'cup_left');
  end if;
  if push_tick() <> 0 then raise exception 'ОШИБКА: «до награды» дважды'; end if;
  perform set_config('hc.now', '', true);
end $$;
\echo ok

\echo === 5. anon не ставит уведомления и не видит чужие победы напрямую
set local role anon;
do $$ begin
  if has_function_privilege('anon', 'push_tick()', 'execute') then raise exception 'ОШИБКА: anon ставит уведомления'; end if;
  if has_table_privilege('anon', 'weekend_cup', 'select') and exists (select 1 from weekend_cup) then
    raise exception 'ОШИБКА: anon читает турнир';
  end if;
end $$;
reset role;
\echo ok

rollback;
