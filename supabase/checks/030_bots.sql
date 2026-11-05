-- Проверка миграции 030_bots.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.
-- Миграция 062 убрала онлайн со случайными соперниками (очередь, рейтинг,
-- ботов, турнир): проверки этого отсюда убраны

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (7, 'имя бота не занять, в поиске ботов нет',
      exists (select 1 from fn where name = 'check_new_username' and src like '%@bot:%')
      and exists (select 1 from fn where name = 'find_students' and src like '%is_bot%')),
  (10, 'anon по-прежнему ходит и смотрит партию по PIN',
      coalesce(has_function_privilege('anon', to_regprocedure('public.match_guess(text,text,bigint,int)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.match_state(text,text,bigint)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
