-- Проверка миграции 054_daily_mode_weekend.txt.
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
  (3, 'Блиц — 10 секунд на ход, конец партии на 3-м пропуске',
      exists (select 1 from fn where name = 'turn_seconds' and src like '%blitz%')
      and exists (select 1 from fn where name = 'apply_turn_timeout' and src like '%blitz%')),
  (8, 'награды турнира: сундук за 3, рамка «Турнир» за 5',
      exists (select 1 from fn where name = 'weekend_claim')
      and 'tourney' = any (pass_frames()))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
