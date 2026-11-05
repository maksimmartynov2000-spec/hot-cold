-- Проверка миграции 050_human_bots_adventure_stars.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.
-- Миграция 062 убрала онлайн со случайными соперниками (очередь, рейтинг,
-- ботов, турнир): проверки этого отсюда убраны

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (4, 'бот заходит в партию и жмёт «Готов» не сразу',
      exists (select 1 from fn where name = 'match_flow_tick' and src like '%match_side_here%')
      and exists (select 1 from fn where name = 'next_match_round' and src like '%match_side_ready%')),
  (9, 'звёзды Приключения хранятся в базе',
      exists (select 1 from information_schema.columns where table_name = 'students' and column_name = 'adventure_stars')
      and exists (select 1 from fn where name = 'adventure_sync')
      and exists (select 1 from fn where name = 'adventure_result')
      and exists (select 1 from fn where name = 'friend_adventure')),
  (10, 'достижений 58: + звёзды и миры Приключения',
      coalesce(array_length(achievement_codes(), 1), 0) >= 58 and achievement_codes() @> array['adv_stars_150', 'adv_worlds_5']),
  (11, 'задания дня про Приключение',
      exists (select 1 from quest_pool() q where q.code = 'adv_win2')
      and exists (select 1 from quest_pool() q where q.code = 'adv_stars3')),
  (12, 'профиль знает звёзды Приключения',
      exists (select 1 from fn where name = 'my_progress' and src like '%advStars%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
