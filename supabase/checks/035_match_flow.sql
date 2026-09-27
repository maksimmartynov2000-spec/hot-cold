-- Проверка миграции 035_match_flow.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
col as (
  select table_name as t, column_name as c
  from information_schema.columns where table_schema = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у партии есть ожидание, старт, присутствие и «Готов»',
      (select count(*) from col where t = 'matches'
         and c in ('lobby', 'accepted_at', 'start_at', 'seen_at', 'ready', 'round_ended_at')) = 6),
  (2, 'правило «ждём обоих» включено',
      exists (select 1 from pg_trigger g join pg_class c on c.oid = g.tgrelid
              where c.relname = 'matches' and g.tgname = 'matches_flow' and g.tgenabled = 'O')),
  (3, 'ходить до старта нельзя',
      exists (select 1 from fn where name = 'match_guess_core' and src like '%not_started%')),
  (4, 'между раундами — «Готов» и 10 секунд',
      exists (select 1 from fn where name = 'next_match_round' and src like '%ready%')
      and exists (select 1 from fn where name = 'match_flow_tick' and src like '%10 seconds%')),
  (5, 'не пришёл за 5 минут — отмена',
      exists (select 1 from fn where name = 'expire_stale_matches' and src like '%5 minutes%')),
  (6, 'уход до старта — без поражения',
      exists (select 1 from fn where name = 'leave_match' and src like '%m.lobby%')),
  (7, 'игра узнаёт об ожидании и перерыве',
      exists (select 1 from fn where name = 'match_state' and src like '%match_flow_tick%' and src like '%nextIn%')),
  (8, 'служебное anon не вызвать, «Готов» — можно',
      not coalesce(has_function_privilege('anon', to_regprocedure('public.match_flow_tick(bigint,int)'), 'execute'), false)
      and not coalesce(has_function_privilege('anon', to_regprocedure('public.match_start_next(bigint)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.next_match_round(text,text,bigint)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
