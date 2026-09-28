-- Проверка миграции 036_block_report.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'таблицы блокировок и жалоб созданы, снаружи закрыты',
      to_regclass('public.player_blocks') is not null and to_regclass('public.player_reports') is not null
      and (select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace
           where n.nspname = 'public' and c.relname in ('player_blocks', 'player_reports'))
      and not exists (select 1 from pg_policies where schemaname = 'public'
                      and tablename in ('player_blocks', 'player_reports'))),
  (2, 'игра может заблокировать, разблокировать и пожаловаться',
      coalesce(has_function_privilege('anon', to_regprocedure('public.block_player(text,text,text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.unblock_player(text,text,text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.blocked_players(text,text)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.report_player(text,text,text,text,text)'), 'execute'), false)),
  (3, 'заявка, поиск и подсказки обходят заблокированных',
      exists (select 1 from fn where name = 'send_friend_request' and src like '%players_blocked%')
      and exists (select 1 from fn where name = 'find_students' and src like '%players_blocked%')
      and exists (select 1 from fn where name = 'suggest_students' and src like '%players_blocked%')),
  (4, 'очередь не сводит заблокированных',
      exists (select 1 from fn where name = 'ranked_pair' and src like '%players_blocked%')),
  (5, 'реванш между заблокированными не создаётся',
      exists (select 1 from pg_trigger g join pg_class c on c.oid = g.tgrelid
              where c.relname = 'matches' and g.tgname = 'matches_no_blocked' and g.tgenabled = 'O')),
  (6, 'чужие блокировки anon не проверить',
      not coalesce(has_function_privilege('anon', to_regprocedure('public.players_blocked(text,text)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
