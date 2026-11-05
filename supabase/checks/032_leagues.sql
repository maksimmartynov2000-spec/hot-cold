-- Проверка миграции 032_leagues.txt.
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
  (5, 'закрытую иконку или цвет не поставить',
      exists (select 1 from fn where name = 'set_avatar' and src like '%avatar_locked%')
      and exists (select 1 from fn where name = 'set_avatar_color' and src like '%color_locked%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
