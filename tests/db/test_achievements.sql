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
  if array_length(achievement_codes(), 1) <> 50 then raise exception 'ОШИБКА: достижений %', array_length(achievement_codes(), 1); end if;
end $$;
\echo ok

\echo === 5. с первой попытки: первый настоящий ход раунда угадал число
do $$
declare mid bigint;
begin
  insert into matches(p0, p1, status, wins, wins_needed) values ('Лев', 'Кира', 'finished', array[3, 1], 3) returning id into mid;
  insert into match_moves(match_id, round, seat, guess, tier) values
    (mid, 1, 0, 50, 8),                    -- сразу угадал
    (mid, 2, 1, 10, 3), (mid, 2, 0, 20, 8), -- соперник промахнулся, свой первый ход — в точку
    (mid, 3, 0, 5, 2), (mid, 3, 0, 6, 8);   -- угадал со второй — не считается
  insert into match_moves(match_id, round, seat, guess, tier, kind) values (mid, 4, 0, null, null, 'timeout');
  insert into match_moves(match_id, round, seat, guess, tier) values (mid, 4, 0, 7, 8); -- истёкшее время — не попытка
  insert into match_moves(match_id, round, seat, guess, tier) values (mid, 5, 1, 9, 8);  -- угадала Кира, не Лев
  if ach_first_try('Лев') <> 3 then raise exception 'ОШИБКА: с первой попытки у Льва %', ach_first_try('Лев'); end if;
  if ach_first_try('Кира') <> 1 then raise exception 'ОШИБКА: с первой попытки у Киры %', ach_first_try('Кира'); end if;
  perform achievements_sync('Лев');
  if (select count(*) from achievements where username = 'Лев' and code in ('first_try_1', 'first_try_3')) <> 2
     or exists (select 1 from achievements where username = 'Лев' and code = 'first_try_10')
  then raise exception 'ОШИБКА: ступени «с первой попытки»'; end if;
end $$;
\echo ok

\echo === 6. режимы: считаются только победы на звёзды, каждый режим один раз
do $$ begin
  -- Победа над Кирой из шага 5 — не на звёзды, режима у неё нет
  insert into matches(p0, p1, status, wins, wins_needed, ranked, ranked_mode) values
    ('Лев', 'Максим', 'finished', array[3, 0], 3, true, 1),
    ('Максим', 'Лев', 'finished', array[1, 3], 3, true, 1),
    ('Лев', 'Максим', 'finished', array[3, 2], 3, true, 2),
    ('Лев', 'Максим', 'finished', array[0, 3], 3, true, 3),   -- проиграл
    ('Лев', 'Максим', 'active', array[2, 0], 3, true, 0);     -- не доиграна
  if ach_modes('Лев') <> 2 then raise exception 'ОШИБКА: режимов %', ach_modes('Лев'); end if;
  perform achievements_sync('Лев');
  if not exists (select 1 from achievements where username = 'Лев' and code = 'modes_2')
     or exists (select 1 from achievements where username = 'Лев' and code = 'modes_3')
  then raise exception 'ОШИБКА: ступени режимов'; end if;
end $$;
\echo ok

\echo === 7. победы над друзьями: разные друзья, не просто игроки
do $$ begin
  -- Кира — друг (из шага 4), её Лев обыграл в шаге 5; Максима обыгрывал, но он не друг
  if ach_friends_beaten('Лев') <> 1 then raise exception 'ОШИБКА: друзей обыграно %', ach_friends_beaten('Лев'); end if;
  if ach_friends_beaten('Кира') <> 0 then raise exception 'ОШИБКА: Кира никого не обыгрывала'; end if;
  insert into friendships(requester, addressee, status) values ('Максим', 'Лев', 'accepted');
  if ach_friends_beaten('Лев') <> 2 then raise exception 'ОШИБКА: Максим стал другом — должно быть 2'; end if;
  perform achievements_sync('Лев');
  if not exists (select 1 from achievements where username = 'Лев' and code = 'rivals_1') then raise exception 'ОШИБКА: нет «победы над другом»'; end if;
end $$;
\echo ok

\echo === 8. игра видит счётчики новых лестниц
do $$
declare s jsonb;
begin
  s := my_progress('Лев', '1234', null)->'stats';
  if (s->>'firstTry')::int <> 3 or (s->>'modes')::int <> 2 or (s->>'rivals')::int <> 2
  then raise exception 'ОШИБКА: счётчики %', s; end if;
end $$;
\echo ok

\echo === 9. новые ступени старых лестниц открываются
do $$ begin
  update player_stats set online_wins = 1000, online_games = 1000, quest_best = 100, run_best = 30, best_win_streak = 20
  where username = 'Лев';
  perform achievements_sync('Лев');
  if (select count(*) from achievements where username = 'Лев'
      and code in ('wins_250','wins_500','wins_1000','games_500','games_1000','streak_15','streak_20',
                   'quests_60','quests_100','run_25','run_30')) <> 11
  then raise exception 'ОШИБКА: верхние ступени'; end if;
end $$;
\echo ok

\echo === 10. иконки: новые звери выбираются, убранные — нет
do $$ begin
  if set_avatar('Лев', '1234', '🐊') is distinct from '🐊' then raise exception 'ОШИБКА: 🐊 не встал'; end if;
  begin
    perform set_avatar('Лев', '1234', '🐲');
    raise exception 'ОШИБКА: убранная иконка принята';
  exception when sqlstate 'P0001' then if sqlerrm not like '%invalid_avatar%' then raise; end if;
  end;
  if array_length(avatar_choices(), 1) <> 24 or avatar_choices() && array['🐲','🐮','🐷','🐔'] then
    raise exception 'ОШИБКА: набор %', avatar_choices();
  end if;
end $$;
\echo ok

rollback;
