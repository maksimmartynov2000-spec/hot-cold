-- Проверка миграции 045_icons_more_achievements.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'новый набор иконок: 🐊 🦙 🐹 🐥 вместо 🐲 🐮 🐷 🐔',
      avatar_choices() @> array['🐊','🦙','🐹','🐥'] and not (avatar_choices() && array['🐲','🐮','🐷','🐔'])),
  (2, 'ни у кого не осталось убранной иконки',
      not exists (select 1 from students where avatar in ('🐲', '🐮', '🐷', '🐔'))),
  (3, 'база проверяет иконку по новому набору',
      exists (select 1 from pg_constraint where conname = 'student_avatar_allowed')),
  (4, 'достижений 50',
      coalesce(array_length(achievement_codes(), 1), 0) = 50),
  (5, 'новые лестницы считаются: первая попытка, режимы, друзья',
      exists (select 1 from fn where name = 'achievements_sync' and src like '%ach_first_try%'
                                 and src like '%ach_modes%' and src like '%ach_friends_beaten%')),
  (6, 'игра видит счётчики новых лестниц',
      exists (select 1 from fn where name = 'my_progress' and src like '%firstTry%' and src like '%rivals%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
