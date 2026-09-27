-- Проверка миграции migration_token_anytime.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'жетон можно взвести и первым ходом раунда',
      exists (select 1 from fn where name = 'use_match_token')
      and not exists (select 1 from fn where name = 'use_match_token' and src like '%not_first_move%')),
  (2, 'anon взводит жетон по PIN',
      coalesce(has_function_privilege('anon', to_regprocedure('public.use_match_token(text,text,bigint,boolean)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
