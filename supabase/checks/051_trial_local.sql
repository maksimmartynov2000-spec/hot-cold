-- Проверка миграции 051_trial_local.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'игра может прислать итог Испытания',
      exists (select 1 from fn where name = 'run_report')),
  (2, 'итог записывается как раньше: рекорд, задания, достижения',
      exists (select 1 from fn where name = 'run_report' and src like '%run_finish(me)%')),
  (3, 'игра без пароля прислать итог не может',
      exists (select 1 from fn where name = 'run_report' and src like '%check_student_pin%')),
  (4, 'вызов открыт игре',
      coalesce(has_function_privilege('anon', to_regprocedure('public.run_report(text,text,int,int)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
