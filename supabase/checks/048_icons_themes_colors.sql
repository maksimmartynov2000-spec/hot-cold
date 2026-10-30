-- Проверка миграции 048_icons_themes_colors.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with checks(nn, what, ok) as (values
  (1, 'иконок 40, среди них новые 🦔 🐘 🦀 👽',
      coalesce(array_length(avatar_choices(), 1), 0) = 40 and avatar_choices() @> array['🦔','🐘','🦀','👽']),
  (2, 'все 24 прежние иконки остались',
      avatar_choices() @> array['🦊','🐼','🐯','🦁','🐨','🐸','🐵','🐧','🦉','🐙','🦄','🐊',
                                '🐶','🐱','🐰','🐻','🦙','🐹','🐥','🐢','🦋','🐝','🐬','🦈']),
  (3, 'цветов 20, среди них градиенты',
      coalesce(array_length(avatar_colors(), 1), 0) = 20 and avatar_colors() @> array['grad-sunset','grad-forest']),
  (4, 'база проверяет иконку и цвет по новому набору',
      (select count(*) from pg_constraint where conname in ('student_avatar_allowed', 'student_avatar_color_allowed')) = 2),
  (5, 'ни у кого нет иконки или цвета вне набора',
      not exists (select 1 from students
                  where (avatar is not null and not avatar = any (avatar_choices() || reward_icons() || tutorial_icon() || quest_icons() || adventure_icons())
                         and avatar not like 'adv-__')
                     or (avatar_color is not null and not avatar_color = any (avatar_colors() || reward_colors()))))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
