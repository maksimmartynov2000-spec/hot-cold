-- Проверка миграции 049_adventure.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у ученика есть счётчик Приключения',
      exists (select 1 from information_schema.columns where table_name = 'students' and column_name = 'adventure')),
  (2, 'иконки боссов: 🧙 🦍 🦑 🐲 🛸',
      exists (select 1 from fn where name = 'adventure_icons') and adventure_icons() = array['🧙','🦍','🦑','🐲','🛸']),
  (3, 'есть функция записи прогресса',
      exists (select 1 from fn where name = 'adventure_save')),
  (4, 'иконку босса нельзя поставить, не пройдя мир',
      exists (select 1 from fn where name = 'set_avatar' and src like '%adventure_icons%')),
  (5, 'база пускает иконки боссов в кружок',
      exists (select 1 from pg_constraint where conname = 'student_avatar_allowed'
              and pg_get_constraintdef(oid) like '%adventure_icons%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
