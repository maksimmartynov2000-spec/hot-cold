-- Проверка миграции 053_online_pass.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'награды хранятся: рамки, титулы, фразы, иконки, цвета',
      to_regclass('public.cosmetics') is not null
      and exists (select 1 from information_schema.columns where table_name = 'students' and column_name = 'frame')
      and exists (select 1 from information_schema.columns where table_name = 'students' and column_name = 'title')),
  (2, 'сезонный путь: 30 ступеней по 100 очков, 11 наград',
      to_regclass('public.season_pass') is not null and pass_max_level() = 30 and pass_level_xp() = 100
      and (select count(*) from season_rewards()) = 11),
  (3, 'очки за партию и задание считает база',
      exists (select 1 from pg_trigger where tgname = 'matches_pass')
      and exists (select 1 from pg_trigger where tgname = 'daily_quests_pass')),
  (4, 'сундук дня и серия с заморозкой',
      exists (select 1 from fn where name = 'open_chest' and src like '%freeze_week%')
      and to_regclass('public.online_streak') is not null),
  (5, 'игра узнаёт всё одним запросом',
      exists (select 1 from fn where name = 'my_online') and exists (select 1 from fn where name = 'faces_for')),
  (6, 'надеть можно только своё',
      exists (select 1 from fn where name = 'set_frame' and src like '%frame_locked%')
      and exists (select 1 from fn where name = 'set_title' and src like '%title_locked%')
      and exists (select 1 from fn where name = 'send_phrase' and src like '%phrase_locked%')
      and exists (select 1 from fn where name = 'set_avatar_color' and src like '%pass_colors%')
      and exists (select 1 from fn where name = 'set_avatar' and src like '%pass_icons%')),
  (7, 'выдать награду в обход нельзя',
      coalesce(has_function_privilege('anon', to_regprocedure('public.cosmetic_grant(text,text,text,text)'), 'execute'), true) = false
      and coalesce(has_function_privilege('anon', to_regprocedure('public.season_xp(text,int)'), 'execute'), true) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
