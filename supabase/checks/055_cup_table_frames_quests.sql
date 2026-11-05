-- Проверка миграции 055_cup_table_frames_quests.txt.
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
  (1, 'рамка турнира — своя у каждого месяца (12 штук)',
      array_length(pass_frames(), 1) = 18 and 'cup-12' = any (pass_frames())
      and exists (select 1 from fn where name = 'weekend_claim' and src like '%cup_frame_code()%')),
  (5, 'игра видит рамку этих выходных',
      exists (select 1 from fn where name = 'my_online' and src like '%cup_frame_code()%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
