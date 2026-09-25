-- Проверка миграции migration_profile.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1,  'у игрока есть место под иконку',
       exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'students' and column_name = 'avatar')),
  (2,  'иконки — только из набора (проверяет сама база)',
       exists (select 1 from pg_constraint where conname = 'student_avatar_allowed')),
  (3,  'в наборе 24 иконки',
       to_regprocedure('public.avatar_choices()') is not null
       and exists (select 1 from fn where name = 'avatar_choices' and src like '%🦈%')),
  (4,  'иконку можно выбрать и увидеть у других',
       exists (select 1 from fn where name = 'set_avatar' and nargs = 3)
       and exists (select 1 from fn where name = 'avatars_for' and nargs = 3)),
  (5,  'имя можно сменить, но не чаще раза в сутки',
       exists (select 1 from fn where name = 'rename_student' and src like '%24 hours%')),
  (6,  'при смене имени переписка и лесенка перекладываются по алфавиту',
       exists (select 1 from fn where name = 'rename_student'
               and src like '%overriding system value%' and src like '%insert into rivalry%')),
  (7,  'переписка переезжает молча, без уведомлений',
       exists (select 1 from fn where name = 'push_on_talk' and src like '%quiet_chat%')),
  (8,  'PIN можно сменить, старая подсказка стирается',
       exists (select 1 from fn where name = 'change_pin' and nargs = 4 and src like '%pin_hint%')),
  (9,  'устройство узнаёт, что имя занял другой (дата создания)',
       exists (select 1 from fn where name = 'my_profile' and src like '%since%')),
  (10, 'регистрация с подсказкой больше не пускает имена на «#»',
       exists (select 1 from fn where name = 'register_student' and nargs = 3
               and src like '%check_new_username%')),
  (11, 'anon может всё это вызвать',
       coalesce(has_function_privilege('anon', to_regprocedure('public.rename_student(text,text,text)'), 'execute'), false)
       and coalesce(has_function_privilege('anon', to_regprocedure('public.change_pin(text,text,text,text)'), 'execute'), false)
       and coalesce(has_function_privilege('anon', to_regprocedure('public.my_profile(text,text)'), 'execute'), false)),
  (12, 'anon НЕ может звать служебную проверку имени сам',
       to_regprocedure('public.check_new_username(text)') is not null
       and coalesce(has_function_privilege('anon', to_regprocedure('public.check_new_username(text)'), 'execute'), false) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
