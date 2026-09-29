-- Проверка миграции 043_presence.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with checks(nn, what, ok) as (values
  (1, 'у игрока есть отметка «был в игре»',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'students' and column_name = 'last_seen')),
  (2, 'игра может отметиться «я здесь»',
      coalesce(has_function_privilege('anon', to_regprocedure('public.mark_seen(text,text)'), 'execute'), false)),
  (3, 'игра видит, кто из друзей сейчас в игре',
      coalesce(has_function_privilege('anon', to_regprocedure('public.friends_online(text,text)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
