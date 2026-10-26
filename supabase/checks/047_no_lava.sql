-- Проверка миграции 047_no_lava.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'новые бонусы — без «Броска в лаву»',
      exists (select 1 from fn where name = 'place_match_bonuses' and src not like '%''lava''%')),
  (2, 'в идущих партиях не взятой лавы не осталось',
      not exists (select 1 from match_bonuses b join matches m on m.id = b.match_id
                  where m.status in ('active', 'invited') and b.type = 'lava' and not b.taken))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
