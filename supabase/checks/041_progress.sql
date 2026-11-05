-- Проверка миграции 041_progress.txt.
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
  select table_name as t, column_name as c
  from information_schema.columns where table_schema = 'public'
),
trg as (
  select tgname as name from pg_trigger where not tgisinternal
),
checks(nn, what, ok) as (values
  (1, 'у игрока есть часовой пояс — день заданий кончается в его полночь',
      exists (select 1 from col where t = 'students' and c = 'tz')),
  (2, 'задания дня и счётчики на месте',
      to_regclass('public.daily_quests') is not null and to_regclass('public.player_stats') is not null),
  (3, 'игра видит задания и достижения',
      coalesce(has_function_privilege('anon', to_regprocedure('public.my_progress(text,text,text)'), 'execute'), false)),
  (4, 'достижения друга — только другу',
      coalesce(has_function_privilege('anon', to_regprocedure('public.friend_achievements(text,text,text)'), 'execute'), false)
      and exists (select 1 from fn where name = 'friend_achievements' and src like '%not_friends%')),
  (6, 'из игры прогресс не прислать',
      not coalesce(has_function_privilege('anon', to_regprocedure('public.quest_event(text,text,integer)'), 'execute'), true)
      and not coalesce(has_function_privilege('anon', to_regprocedure('public.achievements_sync(text)'), 'execute'), true)),
  (7, 'иконки за серию заданий — только заслужившему',
      exists (select 1 from fn where name = 'set_avatar' and src like '%quest_icons()%')
      and exists (select 1 from pg_constraint where conname = 'student_avatar_allowed'
                  and pg_get_constraintdef(oid) like '%quest_icons()%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
