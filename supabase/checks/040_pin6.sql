-- Проверка миграции 040_pin6.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src, p.pronargs as nargs
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'регистрация — только PIN из 6 цифр',
      exists (select 1 from fn where name = 'register_student' and nargs = 3 and src like '%{6}%')
      and not exists (select 1 from fn where name = 'register_student' and nargs = 3 and src like '%{4}%')),
  (2, 'смена PIN — только на 6 цифр',
      exists (select 1 from fn where name = 'change_pin' and src like '%{6}%')
      and not exists (select 1 from fn where name = 'change_pin' and src like '%{4}%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
