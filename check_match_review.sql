-- Проверка миграции migration_match_review.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у ходов есть пометки «без выбора» и «под помехой»',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'match_moves' and column_name = 'forced')
      and exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'match_moves' and column_name = 'limited')),
  (2, 'ход под туманом, слепотой, памятью помечается',
      exists (select 1 from fn where name = 'match_guess_core' and src like '%m.short_memory[seat + 1]);%')),
  (3, 'бросок в лаву помечается',
      exists (select 1 from fn where name = 'forced_turn_core' and src like '%set forced = true%')),
  (4, 'все ходы отдаются только после конца партии',
      exists (select 1 from fn where name = 'match_review' and src like '%match_not_over%')),
  (5, 'anon может смотреть разбор по PIN',
      coalesce(has_function_privilege('anon', to_regprocedure('public.match_review(text,text,bigint)'), 'execute'), false)),
  (6, 'anon по-прежнему НЕ ходит без PIN',
      to_regprocedure('public.match_guess_core(bigint,int,int)') is not null
      and coalesce(has_function_privilege('anon', to_regprocedure('public.match_guess_core(bigint,int,int)'), 'execute'), false) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
