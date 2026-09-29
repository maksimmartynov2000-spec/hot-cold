-- Проверка миграции 039_invite_link.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with col as (
  select table_name as t, column_name as c
  from information_schema.columns where table_schema = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у игрока есть код приглашения, коды не повторяются',
      exists (select 1 from col where t = 'students' and c = 'invite_code')
      and exists (select 1 from pg_indexes where indexname = 'students_invite_code_idx' and indexdef like '%UNIQUE%')),
  (2, 'игра может узнать свой код, хозяина кода и принять приглашение',
      coalesce(has_function_privilege('anon', to_regprocedure('public.my_invite_code(text,text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.invite_owner(text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.accept_invite(text,text,text)'), 'execute'), false)),
  (3, 'коды снаружи не выдумать',
      not coalesce(has_function_privilege('anon', to_regprocedure('public.new_invite_code()'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
