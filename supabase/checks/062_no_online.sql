-- Проверка миграции 062_no_online.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'очереди, рейтинга, ботов и турнира больше нет (таблицы)',
      to_regclass('public.ranked_queue') is null and to_regclass('public.elo_ratings') is null
      and to_regclass('public.ladder') is null and to_regclass('public.weekend_cup') is null
      and to_regclass('public.bot_people') is null and to_regclass('public.rivalry') is null),
  (2, 'и функций для них нет',
      not exists (select 1 from fn where name in ('join_ranked_queue', 'play_join', 'play_status', 'ladder_status',
                  'ladder_top', 'elo_leaderboard', 'apply_elo', 'cup_top', 'daily_variant', 'bot_act',
                  'challenge_friend_ranked', 'season_summary_seen'))),
  (3, 'соперников-ботов и рейтинговых партий нет',
      not exists (select 1 from students where is_bot)
      and not exists (select 1 from matches where ranked or bot_seat is not null)),
  (4, 'путь, сундук и серия — за любую игру',
      exists (select 1 from fn where name = 'play_done' and src like '%play_xp_cap%')
      and exists (select 1 from fn where name = 'adventure_result' and src like '%play_done%')
      and exists (select 1 from fn where name = 'run_report' and src like '%play_done%')
      and exists (select 1 from fn where name = 'matches_pass' and src like '%play_done%')
      and exists (select 1 from fn where name = 'local_game_done')),
  (5, '«Испытание выходных» вместо турнира',
      to_regclass('public.weekend_goal') is not null
      and exists (select 1 from fn where name = 'weekend_claim' and src like '%weekend_goal%')
      and exists (select 1 from fn where name = 'my_online' and src like '%weekend_goal%')),
  (6, 'задания дня без онлайна',
      not exists (select 1 from quest_pool() q where q.code in ('ladder2', 'daily2', 'daily_win1'))
      and not exists (select 1 from daily_quests where code in ('ladder2', 'daily2', 'daily_win1'))),
  (7, 'награды лиг надеваются из коллекции',
      exists (select 1 from fn where name = 'set_avatar' and src like '%reward_icons()%' and src not like '%from ladder%')
      and exists (select 1 from fn where name = 'set_avatar_color' and src like '%reward_colors()%')),
  (8, 'из игры: игра и награды выходных — можно, начислить себе — нельзя',
      has_function_privilege('anon', 'local_game_done(text,text,text)', 'execute')
      and has_function_privilege('anon', 'weekend_claim(text,text,int)', 'execute')
      and not has_function_privilege('anon', 'play_done(text,int)', 'execute')
      and not has_function_privilege('anon', 'weekend_point(text)', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
