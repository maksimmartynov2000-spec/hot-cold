-- Проверка миграции 037_onboarding.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.
-- Миграция 062 убрала онлайн со случайными соперниками (очередь, рейтинг,
-- ботов, турнир): проверки этого отсюда убраны

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
col as (
  select table_name as t, column_name as c, is_nullable as nul
  from information_schema.columns where table_schema = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у игрока есть отметка «обучение пройдено»',
      exists (select 1 from col where t = 'students' and c = 'tutorial_done')),
  (2, 'игра может отметить обучение',
      coalesce(has_function_privilege('anon', to_regprocedure('public.tutorial_finished(text,text)'), 'execute'), false)),
  (3, 'иконка 🎓 — только прошедшему обучение',
      exists (select 1 from fn where name = 'set_avatar' and src like '%tutorial_icon()%')
      and exists (select 1 from pg_constraint where conname = 'student_avatar_allowed'
                  and pg_get_constraintdef(oid) like '%tutorial_icon()%')),
  (6, 'профиль знает про обучение',
      exists (select 1 from fn where name = 'my_profile' and src like '%tutorialDone%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
