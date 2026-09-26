-- Проверка миграции migration_bots.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у игроков и партий есть место под ботов',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'students' and column_name = 'is_bot')
      and exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'matches' and column_name = 'bot_seat')
      and exists (select 1 from information_schema.tables
                  where table_schema = 'public' and table_name = 'bot_skill')),
  (2, 'пять ботов на месте',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'students' and column_name = 'is_bot')
      and (select count(*) from students where username like '@bot:%') = 5),
  (3, 'бот сам ходит, когда игра спрашивает о партии',
      exists (select 1 from fn where name = 'match_state' and src like '%bot_act(p_match_id)%')
      and exists (select 1 from fn where name = 'bot_act')),
  (4, 'у бота время не кончается',
      exists (select 1 from fn where name = 'apply_turn_timeout' and src like '%m.cur = m.bot_seat%')),
  (5, 'через 15 секунд ожидания — бот',
      exists (select 1 from fn where name = 'ranked_pair' and src like '%bot_wait_seconds()%')
      and exists (select 1 from fn where name = 'ranked_status' and src like '%ranked_pair(me, p_mode)%')),
  (6, 'рейтинг за бота вдвое меньше, сила бота подстраивается',
      exists (select 1 from fn where name = 'apply_elo' and src like '%bot_skill_after%')),
  (7, 'имя бота не занять, в поиске ботов нет',
      exists (select 1 from fn where name = 'check_new_username' and src like '%@bot:%')
      and exists (select 1 from fn where name = 'find_students' and src like '%is_bot%')),
  (8, 'реванш с ботом начинается сразу',
      exists (select 1 from fn where name = 'rematch' and src like '%bot_seat%')),
  (9, 'anon НЕ может ходить за бота без PIN',
      to_regprocedure('public.match_guess_core(bigint,int,int)') is not null
      and coalesce(has_function_privilege('anon', to_regprocedure('public.match_guess_core(bigint,int,int)'), 'execute'), false) = false
      and to_regprocedure('public.bot_act(bigint)') is not null
      and coalesce(has_function_privilege('anon', to_regprocedure('public.bot_act(bigint)'), 'execute'), false) = false),
  (10, 'anon по-прежнему ходит и смотрит партию по PIN',
      coalesce(has_function_privilege('anon', to_regprocedure('public.match_guess(text,text,bigint,int)'), 'execute'), false)
      and coalesce(has_function_privilege('anon', to_regprocedure('public.match_state(text,text,bigint)'), 'execute'), false))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
