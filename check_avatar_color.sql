-- Проверка миграции migration_avatar_color.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у игрока есть место под цвет',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'students' and column_name = 'avatar_color')),
  (2, 'цвета — только из набора (проверяет сама база)',
      exists (select 1 from pg_constraint where conname = 'student_avatar_color_allowed')),
  (3, 'в наборе 10 цветов',
      exists (select 1 from fn where name = 'avatar_colors' and src like '%#e2e8f0%' and src like '%#fbbf24%')),
  (4, 'цвет можно выбрать',
      exists (select 1 from fn where name = 'set_avatar_color' and nargs = 3)),
  (5, 'профиль отдаёт цвет',
      exists (select 1 from fn where name = 'my_profile' and src like '%avatar_color%')),
  (6, 'другие видят цвет',
      exists (select 1 from fn where name = 'avatars_for' and src like '%avatar_color%')),
  (7, 'anon может выбрать цвет и увидеть чужие',
      coalesce(has_function_privilege('anon', to_regprocedure('public.set_avatar_color(text,text,text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.avatars_for(text,text,text[])'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
