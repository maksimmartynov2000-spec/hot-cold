-- Проверка миграции 034_fog_whole_round.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
col as (
  select table_name as t, column_name as c
  from information_schema.columns where table_schema = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у партии есть отметки, с какого хода действуют туман и слепота',
      exists (select 1 from col where t = 'matches' and c = 'fog_from')
      and exists (select 1 from col where t = 'matches' and c = 'blind_from')),
  (2, 'отметку ставит сама база, когда помеха ложится',
      exists (select 1 from pg_trigger g join pg_class c on c.oid = g.tgrelid
              where c.relname = 'matches' and g.tgname = 'matches_hide_from' and not g.tgisinternal)),
  (3, 'игрок под помехой не видит ходы и на чужом ходу',
      exists (select 1 from fn where name = 'match_state' and src like '%fog_from%')
      and not exists (select 1 from fn where name = 'match_state' and src like '%m.fog[my_seat + 1] and m.cur = my_seat%')),
  (4, 'бот под помехой видит то же, что человек',
      exists (select 1 from fn where name = 'bot_candidates' and src like '%fog_from%')),
  (5, 'anon смотрит партию через функцию, отметку сам не ставит',
      coalesce(has_function_privilege('anon', to_regprocedure('public.match_state(text,text,bigint)'), 'execute'), false)
      and not coalesce(has_function_privilege('anon', to_regprocedure('public.matches_hide_from()'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
