\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Без онлайна со случайными соперниками (миграция 062): партии только с
-- друзьями, путь и сундук — за любую игру, «Испытание выходных», награды лиг
-- в коллекции. Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null, frame = null, title = null, avatar = null,
                      avatar_color = null, adventure = 0, adventure_stars = '', tz = null
   where username in ('Лев', 'Кира', 'Максим');
  delete from wallet_log where username in ('Лев', 'Кира', 'Максим');
  delete from wallet where username in ('Лев', 'Кира', 'Максим');
  delete from cosmetics where username in ('Лев', 'Кира', 'Максим');
  delete from season_pass where username in ('Лев', 'Кира', 'Максим');
  delete from online_days where username in ('Лев', 'Кира', 'Максим');
  delete from online_streak where username in ('Лев', 'Кира', 'Максим');
  delete from weekend_goal where username in ('Лев', 'Кира', 'Максим');
  delete from run_sessions where username in ('Лев', 'Кира', 'Максим');
  delete from achievements where username in ('Лев', 'Кира', 'Максим');
  delete from player_stats where username in ('Лев', 'Кира', 'Максим');
  delete from daily_quests where username in ('Лев', 'Кира', 'Максим');
  -- Задания на сегодня уже выполнены: их очки и монеты сюда не примешаются
  insert into daily_quests(username, day, slot, code, goal, progress)
  select u, player_day(u), 1, 'play2', 2, 2 from unnest(array['Лев', 'Кира', 'Максим']) u;
  delete from friendships where 'Лев' in (requester, addressee) or 'Кира' in (requester, addressee);
  insert into friendships(requester, addressee, status) values ('Лев', 'Кира', 'accepted');
end $$;
\echo ok

\echo === 1. очереди, рейтинга, ботов и турнира нет
do $$
declare f text; t text;
begin
  foreach f in array array['join_ranked_queue', 'play_join', 'play_status', 'ranked_status', 'ladder_status', 'ladder_top',
                           'elo_leaderboard', 'apply_elo', 'cup_top', 'daily_variant', 'bot_act', 'bot_personas',
                           'challenge_friend_ranked', 'season_summary_seen', 'ladder_season'] loop
    if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
               where n.nspname = 'public' and p.proname = f) then
      raise exception 'ОШИБКА: функция % осталась', f;
    end if;
  end loop;
  foreach t in array array['ranked_queue', 'elo_ratings', 'ladder', 'season_badges', 'season_notices', 'weekend_cup',
                           'cup_notices', 'bot_people', 'bot_skill', 'rivalry'] loop
    if to_regclass('public.' || t) is not null then raise exception 'ОШИБКА: таблица % осталась', t; end if;
  end loop;
  if exists (select 1 from students where is_bot) then raise exception 'ОШИБКА: боты остались'; end if;
  if exists (select 1 from pg_trigger where tgname in ('matches_ladder_flag', 'matches_ladder_result', 'matches_weekend',
                                                      'matches_daily_rules', 'matches_daily_quests', 'friendships_no_bots')) then
    raise exception 'ОШИБКА: триггер остался';
  end if;
end $$;
\echo ok

\echo === 2. партия с другом: один пропуск — ход переходит, реальный ход обнуляет счётчик
do $$
declare mid bigint; m matches; was int; mover text; pin text;
begin
  mid := challenge_friend('Лев', '1234', 'Кира', 100, false, 3, false, null);
  if respond_challenge('Кира', '4321', mid, true) is distinct from 'active' then raise exception 'ОШИБКА: вызов не принят'; end if;
  perform set_config('t.m', mid::text, false);
  select * into m from matches where id = mid;
  if m.ranked then raise exception 'ОШИБКА: партия с другом на рейтинг'; end if;
  was := m.cur;
  update matches set turn_deadline = now() - interval '1 second' where id = mid;
  if apply_turn_timeout(mid) is distinct from true then raise exception 'ОШИБКА: просрочка не сработала'; end if;
  select * into m from matches where id = mid;
  if m.match_over or m.cur is distinct from 1 - was or m.timeouts[was + 1] is distinct from 1 then
    raise exception 'ОШИБКА: первый пропуск % / ход % / молчание %', m.match_over, m.cur, m.timeouts;
  end if;
  mover := case when m.cur = 0 then m.p0 else m.p1 end;
  pin := case when mover = 'Лев' then '1234' else '4321' end;
  update matches set timeouts[m.cur + 1] = 1, turn_deadline = now() + interval '1 minute' where id = mid;
  perform match_guess(mover, pin, mid, case when m.secret = m.range_min then m.range_max else m.range_min end);
  if (select timeouts[m.cur + 1] from matches where id = mid) is distinct from 0 then
    raise exception 'ОШИБКА: счётчик не обнулился';
  end if;
end $$;
\echo ok

\echo === 3. два пропуска подряд — поражение; ушедшему 0 🪙, оставшемуся 15; состояние без рейтинга
do $$
declare mid bigint := current_setting('t.m')::bigint; m matches; gone int; rival int; st jsonb; leaver text; stay text;
begin
  select * into m from matches where id = mid;
  gone := m.cur; rival := 1 - m.cur;
  leaver := case when gone = 0 then m.p0 else m.p1 end;
  stay := case when gone = 0 then m.p1 else m.p0 end;
  update matches set turn_deadline = now() - interval '1 second', timeouts[m.cur + 1] = 1 where id = mid;
  perform apply_turn_timeout(mid);
  select * into m from matches where id = mid;
  if not m.match_over or m.status <> 'finished' or m.forfeit_by is distinct from gone or m.round_winner is distinct from rival then
    raise exception 'ОШИБКА: конец партии %', row_to_json(m);
  end if;
  if coalesce((select sum(coins) from wallet_log where username = leaver and reason = 'online'), 0) <> 0
     or (select sum(coins) from wallet_log where username = stay and reason = 'online') <> 15 then
    raise exception 'ОШИБКА: монеты за сдачу';
  end if;
  st := match_state(leaver, case when leaver = 'Лев' then '1234' else '4321' end, mid);
  if (st->>'forfeitBy')::int is distinct from gone then raise exception 'ОШИБКА: не видно ухода'; end if;
  if st ?| array['ranked', 'rankedMode', 'botSeat', 'elo', 'eloDelta', 'ladder'] then
    raise exception 'ОШИБКА: в состоянии остался рейтинг: %', st;
  end if;
end $$;
\echo ok

\echo === 4. выйти из партии с другом — без сдачи и без результата; список игр — дружеские
do $$
declare mid bigint; m matches; n int;
begin
  mid := challenge_friend('Лев', '1234', 'Кира', 100, false, 3, false, null);
  select count(*) into n from list_matches('Лев', '1234') where id = mid and not ranked;
  if n <> 1 then raise exception 'ОШИБКА: вызова нет в списке'; end if;
  perform respond_challenge('Кира', '4321', mid, true);
  perform leave_match('Лев', '1234', mid);
  select * into m from matches where id = mid;
  if m.forfeit_by is not null or match_winner(m) is not null or m.status <> 'finished' then
    raise exception 'ОШИБКА: выход из дружеской партии %', row_to_json(m);
  end if;
end $$;
\echo ok

\echo === 5. любая игра открывает сундук дня: Тренировка; слишком часто и чушь — отказ
do $$
declare r jsonb;
begin
  begin
    perform open_chest('Максим', '1111');
    raise exception 'ОШИБКА: сундук без игры';
  exception when others then if sqlerrm not like '%chest_locked%' then raise; end if;
  end;
  if (my_online('Максим', '1111')->>'played')::boolean then raise exception 'ОШИБКА: «играл» без игры'; end if;
  r := local_game_done('Максим', '1111', 'solo');
  if (r->>'xp')::int <> 10 then raise exception 'ОШИБКА: очки за Тренировку %', r; end if;
  if not (my_online('Максим', '1111')->>'played')::boolean then raise exception 'ОШИБКА: день не отмечен'; end if;
  begin
    perform local_game_done('Максим', '1111', 'duel');
    raise exception 'ОШИБКА: две игры за секунду';
  exception when others then if sqlerrm not like '%too_fast%' then raise; end if;
  end;
  begin
    perform local_game_done('Максим', '1111', 'online');
    raise exception 'ОШИБКА: игра непонятного вида';
  exception when others then if sqlerrm not like '%bad_kind%' then raise; end if;
  end;
  begin
    perform local_game_done('Максим', '0000', 'solo');
    raise exception 'ОШИБКА: чужим PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Максим';
  r := open_chest('Максим', '1111');
  if (r->>'xp')::int < 30 or (r->>'streak')::int <> 1 then raise exception 'ОШИБКА: сундук %', r; end if;
end $$;
\echo ok

\echo === 6. очки пути: Приключение 10 + 5 за новую звезду, Испытание 15, с другом 10/20 — до 150 в день
do $$
declare x0 int; x int; mid bigint; r jsonb;
begin
  update online_days set local_at = null where username = 'Максим';
  select coalesce(sum(xp), 0) into x0 from season_pass where username = 'Максим';
  perform adventure_result('Максим', '1111', 0, 2);
  select sum(xp) into x from season_pass where username = 'Максим';
  if x - x0 <> 20 then raise exception 'ОШИБКА: Приключение дало % очков', x - x0; end if;
  r := run_report('Максим', '1111', 3, 900);
  select sum(xp) into x0 from season_pass where username = 'Максим';
  if x0 - x <> 15 then raise exception 'ОШИБКА: Испытание дало % очков', x0 - x; end if;
  -- Предел дня: осталось 5 — дадут 5, потом ничего
  update online_days set play_xp = play_xp_cap() - 5 where username = 'Максим' and day = player_day('Максим');
  perform adventure_result('Максим', '1111', 1, 3);
  select sum(xp) into x from season_pass where username = 'Максим';
  if x - x0 <> 5 then raise exception 'ОШИБКА: до предела дало % очков', x - x0; end if;
  update online_days set local_at = null where username = 'Максим';
  r := local_game_done('Максим', '1111', 'solo');
  if (r->>'xp')::int <> 0 or (select sum(xp) from season_pass where username = 'Максим') <> x then
    raise exception 'ОШИБКА: сверх предела %', r;
  end if;
  if (my_online('Максим', '1111')->>'playXp')::int <> play_xp_cap() then raise exception 'ОШИБКА: playXp'; end if;
  -- Задание дня — сверху предела: 20 очков
  insert into daily_quests(username, day, slot, code, goal, progress) values ('Максим', player_day('Максим'), 2, 'win1', 1, 0);
  update daily_quests set progress = 1 where username = 'Максим' and day = player_day('Максим') and slot = 2;
  if (select sum(xp) from season_pass where username = 'Максим') <> x + 20 then raise exception 'ОШИБКА: задание сверх предела'; end if;
  -- Партия с другом: Лев выиграл — 20, Кира — 10
  select coalesce(sum(xp), 0) into x0 from season_pass where username = 'Кира';
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100) returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  if (select sum(xp) from season_pass where username = 'Кира') - x0 <> 10 then raise exception 'ОШИБКА: очки за поражение'; end if;
end $$;
\echo ok

\echo === 7. задания дня: «сыграйте» — любая игра, «победите» — Приключение и друг
do $$
declare d date; mid bigint;
begin
  d := player_day('Кира');
  delete from daily_quests where username = 'Кира' and day = d;
  insert into daily_quests(username, day, slot, code, goal) values ('Кира', d, 1, 'play3', 3), ('Кира', d, 2, 'win2', 2);
  update online_days set local_at = null where username = 'Кира';
  perform local_game_done('Кира', '4321', 'duel');                 -- игра
  perform adventure_result('Кира', '4321', 0, 1);                   -- игра и победа
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100) returning id into mid;
  update matches set wins = array[0, 3], match_over = true, status = 'finished' where id = mid;  -- игра и победа
  if (select progress from daily_quests where username = 'Кира' and day = d and slot = 1) <> 3
     or (select progress from daily_quests where username = 'Кира' and day = d and slot = 2) <> 2 then
    raise exception 'ОШИБКА: задания %', (select json_agg(q) from daily_quests q where username = 'Кира' and day = d);
  end if;
  if (select array_agg(distinct code order by code) from quest_pool())
     <> array['adv_stars3', 'adv_win2', 'play2', 'play3', 'run1', 'run_best3', 'run_rounds5', 'win1', 'win2'] then
    raise exception 'ОШИБКА: набор заданий';
  end if;
end $$;
\echo ok

\echo === 8. достижения: победы в Приключении считаются, серия побед и её обрыв, разные правила
do $$
declare i int; mid bigint;
begin
  delete from achievements where username = 'Лев';
  delete from player_stats where username = 'Лев';
  for i in 0 .. 2 loop perform adventure_result('Лев', '1234', i, 1); end loop;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'first_win')
     or not exists (select 1 from achievements where username = 'Лев' and code = 'streak_3') then
    raise exception 'ОШИБКА: достижения за победы в Приключении';
  end if;
  update online_days set local_at = null where username = 'Лев';
  perform local_game_done('Лев', '1234', 'adv');                    -- проигранный бой
  if (select win_streak from player_stats where username = 'Лев') <> 0
     or (select best_win_streak from player_stats where username = 'Лев') <> 3 then
    raise exception 'ОШИБКА: серия после поражения';
  end if;
  -- Победы над другом по разным правилам: без всего, мороз, мороз с бонусами
  insert into matches(p0, p1, status, range_min, range_max, frost, bonuses_on) values
    ('Лев', 'Кира', 'active', 1, 100, false, false), ('Лев', 'Кира', 'active', -50, 50, true, false),
    ('Лев', 'Кира', 'active', -50, 50, true, true);
  update matches set wins = array[3, 0], match_over = true, status = 'finished'
   where status = 'active' and p0 = 'Лев' and p1 = 'Кира';
  if ach_modes('Лев') <> 3 or not exists (select 1 from achievements where username = 'Лев' and code = 'modes_3') then
    raise exception 'ОШИБКА: правила % ', ach_modes('Лев');
  end if;
  if exists (select 1 from achievements where username = 'Лев' and code like 'league%') then
    raise exception 'ОШИБКА: достижение лиги без лиги';
  end if;
end $$;
\echo ok

\echo === 9. «Испытание выходных»: очки за Испытание 5+ раундов и ★★★ в Приключении, награды 3 и 5
do $$
declare r jsonb; g0 int; i int;
begin
  -- В будни очков нет
  perform set_config('hc.now', '2026-11-04 12:00+00', true);
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  perform run_report('Кира', '4321', 6, 1000);
  if exists (select 1 from weekend_goal where username = 'Кира') then raise exception 'ОШИБКА: очко в будни'; end if;
  -- Суббота
  perform set_config('hc.now', '2026-11-07 12:00+00', true);
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  perform run_report('Кира', '4321', 4, 1000);                       -- 4 раунда — мало
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  perform run_report('Кира', '4321', 5, 1000);                       -- очко
  perform adventure_result('Кира', '4321', 1, 2);                    -- ★★ — мало
  perform adventure_result('Кира', '4321', 1, 3);                    -- очко
  perform adventure_result('Кира', '4321', 0, 3);                    -- очко
  r := my_online('Кира', '4321');
  if (r->'weekend'->>'points')::int <> 3 or not (r->'weekend'->>'on')::boolean or r->'weekend'->>'frame' <> 'cup-11' then
    raise exception 'ОШИБКА: выходные %', r->'weekend';
  end if;
  begin
    perform weekend_claim('Кира', '4321', 5);
    raise exception 'ОШИБКА: награда за 5 при 3';
  exception when others then if sqlerrm not like '%cup_locked%' then raise; end if;
  end;
  g0 := coalesce((select gems from wallet where username = 'Кира'), 0);
  r := weekend_claim('Кира', '4321', 3);
  if (r->>'gems')::int <> 1 or (r->>'xp')::int <> 50 or (select gems from wallet where username = 'Кира') <> g0 + 1 then
    raise exception 'ОШИБКА: награда за 3 %', r;
  end if;
  r := weekend_claim('Кира', '4321', 3);
  if not (r->>'already')::boolean or (select gems from wallet where username = 'Кира') <> g0 + 1 then
    raise exception 'ОШИБКА: награда дважды %', r;
  end if;
  for i in 2 .. 3 loop perform adventure_result('Кира', '4321', i, 3); end loop;
  r := weekend_claim('Кира', '4321', 5);
  if r->>'frame' <> 'cup-11' or (r->>'gems')::int <> 2 or not cosmetic_has('Кира', 'frame', 'cup-11') then
    raise exception 'ОШИБКА: рамка месяца %', r;
  end if;
  -- В понедельник — те же выходные: забрать ещё можно, новых очков нет
  perform set_config('hc.now', '2026-11-09 09:00+00', true);
  r := my_online('Кира', '4321');
  if (r->'weekend'->>'points')::int <> 5 or (r->'weekend'->>'on')::boolean or r->'weekend'->'claim5' is null then
    raise exception 'ОШИБКА: понедельник %', r->'weekend';
  end if;
  perform set_config('hc.now', '2026-11-04 12:00+00', true);  -- обычная среда, как во всех сценариях
end $$;
\echo ok

\echo === 10. награды лиг — из коллекции: нет — не надеть, есть — надеть
do $$
declare r record;
begin
  begin
    perform set_avatar('Лев', '1234', '🦅');
    raise exception 'ОШИБКА: иконка лиги без неё';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  begin
    perform set_avatar_color('Лев', '1234', '#eab308');
    raise exception 'ОШИБКА: фон лиги без него';
  exception when others then if sqlerrm not like '%color_locked%' then raise; end if;
  end;
  perform cosmetic_grant('Лев', 'icon', '🦅', 'league');
  perform cosmetic_grant('Лев', 'color', '#eab308', 'league');
  perform cosmetic_grant('Лев', 'frame', 'gold', 'league');
  if set_avatar('Лев', '1234', '🦅') <> '🦅' or set_avatar_color('Лев', '1234', '#eab308') <> '#eab308'
     or set_frame('Лев', '1234', 'gold') <> 'gold' then
    raise exception 'ОШИБКА: своё из лиги не надевается';
  end if;
  select * into r from faces_for('Кира', '4321', array['Лев']);
  if r.frame <> 'gold' or r.league is not null then raise exception 'ОШИБКА: кружок %', row_to_json(r); end if;
  insert into achievements(username, code) values ('Лев', 'league_gold') on conflict do nothing;
  if (my_progress('Лев', '1234', null)->'stats'->>'peak')::int <> 2 then raise exception 'ОШИБКА: высшая лига в профиле'; end if;
end $$;
\echo ok

\echo === 11. наборы в игре и в базе одинаковые: награды лиг, рамки пути
create temp table js_rewards(league int, kind text, value text);
\copy js_rewards from 'rewards_js.csv' with (format csv, header true)
create temp table js_sets(kind text, n int, code text);
\copy js_sets from 'pass_sets_js.csv' with (format csv, header true)
do $$
declare js text; db text;
begin
  select string_agg(league || kind || value, ',' order by league, kind, value) into js from js_rewards;
  select string_agg(league || kind || value, ',' order by league, kind, value) into db from league_rewards();
  if js is distinct from db then raise exception 'ОШИБКА: награды лиг разошлись: игра % / база %', js, db; end if;
  if (select array_agg(code order by n) from js_sets where kind = 'frame') is distinct from pass_frames() then
    raise exception 'ОШИБКА: рамки в игре и в базе разные';
  end if;
end $$;
\echo ok

\echo === 12. anon: игра, сундук и выходные — да; начислить себе очки и очко выходных — нет
set local role anon;
do $$ begin
  if not has_function_privilege('anon', 'local_game_done(text,text,text)', 'execute')
     or not has_function_privilege('anon', 'weekend_claim(text,text,int)', 'execute')
     or not has_function_privilege('anon', 'my_online(text,text)', 'execute') then
    raise exception 'ОШИБКА: anon не может играть';
  end if;
  if has_function_privilege('anon', 'play_done(text,int)', 'execute')
     or has_function_privilege('anon', 'stats_game(text,boolean)', 'execute')
     or has_function_privilege('anon', 'weekend_point(text)', 'execute') then
    raise exception 'ОШИБКА: anon начисляет себе';
  end if;
  if has_table_privilege('anon', 'weekend_goal', 'select') and exists (select 1 from weekend_goal) then
    raise exception 'ОШИБКА: очки выходных видно';
  end if;
end $$;
reset role;
\echo ok

rollback;
