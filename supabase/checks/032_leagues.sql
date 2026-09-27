-- Проверка миграции 032_leagues.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'есть лестница и значки сезонов',
      exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'ladder')
      and exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'season_badges')),
  (2, 'партия из очереди отмечается как партия на звёзды',
      exists (select 1 from pg_trigger where tgname = 'matches_ladder_flag')),
  (3, 'звёзды начисляются вместе с рейтингом',
      exists (select 1 from pg_trigger where tgname = 'matches_ladder_result')
      and exists (select 1 from fn where name = 'ladder_after' and src like '%r.stars % 15 = 0%')),
  (4, 'новый сезон: значок и спуск на лигу',
      exists (select 1 from fn where name = 'ladder_touch' and src like '%season_badges%')),
  (5, 'закрытую иконку или цвет не поставить',
      exists (select 1 from fn where name = 'set_avatar' and src like '%avatar_locked%')
      and exists (select 1 from fn where name = 'set_avatar_color' and src like '%color_locked%')),
  (6, 'разбор партии отдаёт звёзды',
      exists (select 1 from fn where name = 'match_review' and src like '%star_delta%')),
  (7, 'anon видит свою лестницу и топ сезона',
      coalesce(has_function_privilege('anon', to_regprocedure('public.ladder_status(text,text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.ladder_top()'), 'execute'), false)),
  (8, 'anon НЕ может начислить себе звёзды',
      to_regprocedure('public.ladder_after(text,boolean)') is not null
      and coalesce(has_function_privilege('anon', to_regprocedure('public.ladder_after(text,boolean)'), 'execute'), false) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
