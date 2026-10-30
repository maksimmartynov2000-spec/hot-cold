\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Режим дня и турнир выходных (миграция 054). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null;
  update matches set status = 'finished' where status in ('invited', 'active');
  delete from ranked_queue;
  delete from weekend_cup where username in ('Лев', 'Кира');
  delete from cosmetics where username in ('Лев', 'Кира');
  delete from season_pass where username in ('Лев', 'Кира');
  delete from daily_quests where username in ('Лев', 'Кира');
  insert into daily_quests(username, day, slot, code, goal, progress)
  select u, player_day(u), 1, 'play2', 2, 2 from unnest(array['Лев', 'Кира']) u;
end $$;
\echo ok

\echo === 1. режим дня по кругу: Блиц, Хаос, Мини-матч — у всех один
do $$ begin
  if daily_variant(date '1970-01-01') <> 'blitz' or daily_variant(date '1970-01-02') <> 'chaos'
     or daily_variant(date '1970-01-03') <> 'mini' or daily_variant(date '1970-01-04') <> 'blitz' then
    raise exception 'ОШИБКА: порядок режимов дня';
  end if;
end $$;
\echo ok

\echo === 2. партия режима дня получает правила своего дня
do $$
declare d date; m matches; mid bigint;
begin
  -- Ищем в ближайших днях каждый из трёх
  for d in select generate_series(date '2026-11-02', date '2026-11-04', interval '1 day')::date loop
    perform set_config('hc.now', (d + time '12:00')::text || '+00', true);
    insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max, wins_needed)
    values ('Лев', 'Кира', 'active', true, 4, -100, 100, 3) returning id into mid;
    select * into m from matches where id = mid;
    if m.variant <> daily_variant(d) then raise exception 'ОШИБКА: режим партии %', m.variant; end if;
    if m.variant = 'blitz' and (turn_seconds(m) <> 10 or m.bonuses_on or m.range_max <> 100 or m.wins_needed <> 3) then
      raise exception 'ОШИБКА: Блиц %', row_to_json(m);
    end if;
    if m.variant = 'chaos' and (not m.bonuses_on or m.bonus_count <> 3 * auto_bonus_count(100) or turn_seconds(m) <> 30) then
      raise exception 'ОШИБКА: Хаос %', row_to_json(m);
    end if;
    if m.variant = 'mini' and (m.range_min <> 1 or m.range_max <> 50 or m.wins_needed <> 1 or m.bonuses_on or m.frost) then
      raise exception 'ОШИБКА: Мини-матч %', row_to_json(m);
    end if;
    if not m.ladder then raise exception 'ОШИБКА: режим дня без звёзд'; end if;
    update matches set status = 'finished' where id = mid;
  end loop;
  -- Обычный режим не трогается
  insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max) values ('Лев', 'Кира', 'active', true, 1, -100, 100)
  returning id into mid;
  select * into m from matches where id = mid;
  if m.variant is not null or m.range_min <> -100 then raise exception 'ОШИБКА: обычный режим изменился'; end if;
  update matches set status = 'finished' where id = mid;
  perform set_config('hc.now', '', true);
end $$;
\echo ok

\echo === 3. очередь режима дня — своя, бот подбирается
do $$
declare r jsonb; mid bigint; m matches;
begin
  r := join_ranked_queue('Лев', '1234', 4);
  if r->>'matchId' is not null then raise exception 'ОШИБКА: партия сразу %', r; end if;
  r := join_ranked_queue('Кира', '4321', 0);
  if r->>'matchId' is not null then raise exception 'ОШИБКА: свели режим дня с обычным'; end if;
  update ranked_queue set joined_at = now() - interval '1 minute' where username = 'Лев';
  r := ranked_status('Лев', '1234', 4);
  mid := (r->>'matchId')::bigint;
  if mid is null then raise exception 'ОШИБКА: бот не нашёлся %', r; end if;
  select * into m from matches where id = mid;
  if m.ranked_mode <> 4 or m.variant is null or m.bot_seat is null then raise exception 'ОШИБКА: партия с ботом %', row_to_json(m); end if;
  update matches set status = 'finished' where id = mid;
  delete from ranked_queue;
  begin
    perform join_ranked_queue('Лев', '1234', 5);
    raise exception 'ОШИБКА: режим 5';
  exception when others then if sqlerrm not like '%bad_mode%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 4. Блиц: пропуск хода, партия кончается на третьем пропуске подряд
do $$
declare mid bigint; m matches;
begin
  perform set_config('hc.now', '2026-11-02 12:00+00', true);
  if daily_variant() <> 'blitz' then
    perform set_config('hc.now', '2026-11-03 12:00+00', true);
  end if;
  if daily_variant() <> 'blitz' then
    perform set_config('hc.now', '2026-11-04 12:00+00', true);
  end if;
  insert into matches(p0, p1, status, ranked, ranked_mode) values ('Лев', 'Кира', 'active', true, 4) returning id into mid;
  perform set_config('hc.now', '', true);
  perform start_match_round(mid);
  update matches set start_at = null, lobby = false where id = mid;
  update matches set turn_deadline = now() - interval '1 second' where id = mid;
  perform apply_turn_timeout(mid);
  select * into m from matches where id = mid;
  if m.status <> 'active' or m.cur <> 1 then raise exception 'ОШИБКА: после 1-го пропуска %', row_to_json(m); end if;
  -- Отвечает только второй — первый молчит
  for i in 1..2 loop
    update matches set cur = 0, turn_deadline = now() - interval '1 second' where id = mid;
    perform apply_turn_timeout(mid);
  end loop;
  select * into m from matches where id = mid;
  if m.status <> 'finished' or m.forfeit_by <> 0 then raise exception 'ОШИБКА: после 3-го пропуска %', m.status; end if;
end $$;
\echo ok

\echo === 5. режим дня — очки сезона вдвое
do $$
declare mid bigint; a int;
begin
  delete from season_pass where username in ('Лев', 'Кира');
  insert into matches(p0, p1, status, ranked, ranked_mode) values ('Лев', 'Кира', 'active', true, 4) returning id into mid;
  update matches set wins = array[wins_needed, 0], match_over = true, status = 'finished' where id = mid;
  select xp into a from season_pass where username = 'Лев' and season = ladder_season();
  if a is distinct from 40 then raise exception 'ОШИБКА: очки за победу в режиме дня %', a; end if;
end $$;
\echo ok

\echo === 6. выходные: звёзды вдвое, победы в счёт турнира; в будни — как обычно
do $$
declare mid bigint; s0 int; s1 int;
begin
  perform set_config('hc.now', '2026-11-04 12:00+00', true);  -- среда
  if weekend_on() then raise exception 'ОШИБКА: среда — выходной'; end if;
  perform ladder_touch('Лев');
  update ladder set stars = 20, streak = 0, career = 50 where username = 'Лев';
  insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max) values ('Лев', 'Кира', 'active', true, 0, 1, 100)
  returning id into mid;
  update matches set wins = array[3, 0], round_winner = 0, match_over = true, status = 'finished' where id = mid;
  perform apply_elo(mid, 0);
  select stars into s0 from ladder where username = 'Лев';
  if s0 <> 21 then raise exception 'ОШИБКА: звёзды в будни %', s0; end if;
  if exists (select 1 from weekend_cup where username = 'Лев') then raise exception 'ОШИБКА: турнир в будни'; end if;

  perform set_config('hc.now', '2026-11-07 12:00+00', true);  -- суббота
  if not weekend_on() then raise exception 'ОШИБКА: суббота — не выходной'; end if;
  update ladder set streak = 0 where username = 'Лев';
  for i in 1..5 loop
    insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max) values ('Лев', 'Кира', 'active', true, 0, 1, 100)
    returning id into mid;
    update matches set wins = array[3, 0], round_winner = 0, match_over = true, status = 'finished' where id = mid;
    perform apply_elo(mid, 0);
    if i = 1 then
      select stars into s1 from ladder where username = 'Лев';
      if s1 <> s0 + 2 then raise exception 'ОШИБКА: звёзды на выходных % → %', s0, s1; end if;
    end if;
  end loop;
  if (select wins from weekend_cup where username = 'Лев' and week = weekend_key()) <> 5 then
    raise exception 'ОШИБКА: побед в турнире %', (select wins from weekend_cup where username = 'Лев');
  end if;
  if exists (select 1 from weekend_cup where username = 'Кира' and wins > 0) then raise exception 'ОШИБКА: проигравшему победа'; end if;
end $$;
\echo ok

\echo === 7. награды турнира: сундук за 3, рамка за 5, потом — большой сундук
do $$
declare r jsonb; o jsonb;
begin
  perform set_config('hc.now', '2026-11-08 20:00+00', true);  -- воскресенье
  o := my_online('Лев', '1234');
  if not (o->'weekend'->>'on')::boolean or (o->'weekend'->>'wins')::int <> 5 then raise exception 'ОШИБКА: my_online %', o->'weekend'; end if;
  if (o->'weekend'->>'endsIn')::int <> 4 * 3600 then raise exception 'ОШИБКА: до конца выходных %', o->'weekend'; end if;
  r := weekend_claim('Лев', '1234', 3);
  if (r->>'xp')::int <> 50 or r->'surprise' is null or r->'surprise' = 'null'::jsonb then raise exception 'ОШИБКА: сундук за 3 %', r; end if;
  if not (weekend_claim('Лев', '1234', 3)->>'already')::boolean then raise exception 'ОШИБКА: сундук дважды'; end if;
  r := weekend_claim('Лев', '1234', 5);
  if r->>'frame' <> 'tourney' or not cosmetic_has('Лев', 'frame', 'tourney') then raise exception 'ОШИБКА: рамка %', r; end if;
  if set_frame('Лев', '1234', 'tourney') <> 'tourney' then raise exception 'ОШИБКА: рамку не надеть'; end if;
  begin
    perform weekend_claim('Кира', '4321', 3);
    raise exception 'ОШИБКА: награда без побед';
  exception when others then if sqlerrm not like '%cup_locked%' then raise; end if;
  end;

  -- В понедельник награду ещё можно забрать, а победы уже не идут
  perform set_config('hc.now', '2026-11-09 09:00+00', true);
  o := my_online('Лев', '1234');
  if (o->'weekend'->>'on')::boolean or (o->'weekend'->>'wins')::int <> 5 or o->'weekend'->'claim5' is null then
    raise exception 'ОШИБКА: понедельник %', o->'weekend';
  end if;
  if (o->'weekend'->>'startsIn')::int <> 4 * 86400 + 15 * 3600 then raise exception 'ОШИБКА: до субботы %', o->'weekend'; end if;
  if (o->'daily'->>'variant') <> daily_variant(date '2026-11-09') or (o->'daily'->>'next') <> daily_variant(date '2026-11-10') then
    raise exception 'ОШИБКА: режим дня в my_online %', o->'daily';
  end if;

  -- Следующие выходные: рамка уже есть — большой сундук
  perform set_config('hc.now', '2026-11-14 10:00+00', true);
  insert into weekend_cup(username, week, wins) values ('Лев', weekend_key(), 5);
  r := weekend_claim('Лев', '1234', 5);
  if (r->>'xp')::int <> 100 or r->>'frame' is not null then raise exception 'ОШИБКА: большой сундук %', r; end if;
  perform set_config('hc.now', '', true);
end $$;
\echo ok

\echo === 8. наборы в игре и в базе одинаковые: режимы дня по порядку, рамки
create temp table js_sets(kind text, n int, code text);
\copy js_sets from 'pass_sets_js.csv' with (format csv, header true)
do $$ begin
  if (select array_agg(code order by n) from js_sets where kind = 'daily') is distinct from daily_variants() then
    raise exception 'ОШИБКА: режимы дня в игре и в базе разные';
  end if;
  if (select array_agg(code order by n) from js_sets where kind = 'frame') is distinct from pass_frames() then
    raise exception 'ОШИБКА: рамки в игре и в базе разные';
  end if;
end $$;
\echo ok

\echo === 9. anon не начисляет звёзды и победы сам
set local role anon;
do $$ begin
  if has_function_privilege('anon', 'ladder_after(text,boolean)', 'execute')
     or has_function_privilege('anon', 'matches_weekend()', 'execute') then
    raise exception 'ОШИБКА: anon начисляет';
  end if;
end $$;
reset role;
\echo ok

rollback;
