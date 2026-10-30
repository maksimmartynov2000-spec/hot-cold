-- Проверка миграции 052_adventure_char_icons.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, '50 иконок соперников: adv-01 … adv-50',
      exists (select 1 from fn where name = 'adventure_char_icons')
      and coalesce(array_length(adventure_char_icons(), 1), 0) = 50 and (adventure_char_icons())[50] = 'adv-50'),
  (2, 'база пускает их в кружок',
      exists (select 1 from pg_constraint where conname = 'student_avatar_allowed'
              and pg_get_constraintdef(oid) like '%adventure_char_icons%')),
  (3, 'иконку не поставить без мира на 3★',
      exists (select 1 from fn where name = 'set_avatar' and src like '%3333333333%')),
  (4, 'достижения «миры на 3★»: всего 61',
      coalesce(array_length(achievement_codes(), 1), 0) = 61 and achievement_codes() @> array['adv_gold_5']),
  (5, 'профиль знает, сколько миров на 3★',
      exists (select 1 from fn where name = 'my_progress' and src like '%advGold%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
