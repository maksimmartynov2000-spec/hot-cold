\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: счётчики и достижения откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, tutorial_done = false;
  delete from achievements; delete from player_stats; delete from ladder;
  delete from friendships where 'Лев' in (requester, addressee) or 'Кира' in (requester, addressee) or 'Максим' in (requester, addressee);
end $$;
\echo ok

\echo === 1. ступени открываются по счётчикам — и только достигнутые
do $$
declare got text[];
begin
  insert into player_stats(username, online_wins, online_games, run_best, quest_best)
  values ('Лев', 12, 55, 15, 7);
  perform achievements_sync('Лев');
  select array_agg(code order by code) into got from achievements where username = 'Лев';
  if got is distinct from array['first_win','games_10','games_50','quests_3','quests_7','run_10','run_15','run_5','wins_10','wins_5']
  then raise exception 'ОШИБКА: открыто %', got; end if;
end $$;
\echo ok

\echo === 2. лучшая серия запоминается: поражение её не отнимает
do $$ begin
  perform ladder_touch('Лев');
  update ladder set streak = 5 where username = 'Лев';
  update ladder set streak = 0 where username = 'Лев';
  if (select best_win_streak from player_stats where username = 'Лев') <> 5 then raise exception 'ОШИБКА: рекорд серии не запомнен'; end if;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'streak_5') then raise exception 'ОШИБКА: нет «5 подряд»'; end if;
  if exists (select 1 from achievements where username = 'Лев' and code = 'streak_10') then raise exception 'ОШИБКА: «10 подряд» за 5'; end if;
end $$;
\echo ok

\echo === 3. лиги: каждая — своей ступенью
do $$ begin
  update ladder set peak = 3 where username = 'Лев';
  if (select count(*) from achievements where username = 'Лев' and code in ('league_silver','league_gold','league_platinum')) <> 3
  then raise exception 'ОШИБКА: лиги до Платины'; end if;
  if exists (select 1 from achievements where username = 'Лев' and code in ('league_diamond','legend')) then raise exception 'ОШИБКА: Алмаз раньше времени'; end if;
end $$;
\echo ok

\echo === 4. игра видит счётчики — сколько до следующей ступени
do $$
declare s jsonb;
begin
  insert into friendships(requester, addressee, status) values ('Лев', 'Кира', 'accepted');
  s := my_progress('Лев', '1234', null)->'stats';
  if (s->>'wins')::int <> 12 or (s->>'games')::int <> 55 or (s->>'winStreak')::int <> 5 or (s->>'peak')::int <> 3
     or (s->>'runBest')::int <> 15 or (s->>'questBest')::int <> 7 or (s->>'friends')::int <> 1 or (s->>'tutorial')::boolean
  then raise exception 'ОШИБКА: счётчики %', s; end if;
  if not exists (select 1 from achievements where username = 'Лев' and code = 'friends_1') then raise exception 'ОШИБКА: нет первого друга'; end if;
  if exists (select 1 from achievements where not (code = any (achievement_codes()))) then raise exception 'ОШИБКА: код не из списка'; end if;
  if array_length(achievement_codes(), 1) <> 29 then raise exception 'ОШИБКА: достижений %', array_length(achievement_codes(), 1); end if;
end $$;
\echo ok

rollback;
