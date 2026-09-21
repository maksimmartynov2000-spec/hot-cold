-- Проверка: всё ли из миграций доехало до базы.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src, p.oid as oid,
         coalesce(array_to_string(p.proargnames, ','), '') as argnames
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
col as (
  select table_name as t, column_name as c
  from information_schema.columns where table_schema = 'public'
),
checks(nn, part, what, ok) as (values
  (1,  'рейтинг по режимам', 'таблица elo_ratings создана',
       to_regclass('public.elo_ratings') is not null),
  (2,  'рейтинг по режимам', 'старые колонки students.elo убраны',
       not exists (select 1 from col where t = 'students' and c in ('elo', 'elo_games'))),
  (3,  'рейтинг по режимам', 'у матча есть номер режима',
       exists (select 1 from col where t = 'matches' and c = 'ranked_mode')),
  (4,  'рейтинг по режимам', 'у очереди есть номер режима',
       exists (select 1 from col where t = 'ranked_queue' and c = 'mode')),
  (5,  'рейтинг по режимам', 'join_ranked_queue принимает режим',
       exists (select 1 from fn where name = 'join_ranked_queue' and nargs = 3)),
  (6,  'рейтинг по режимам', 'старая join_ranked_queue без режима удалена',
       not exists (select 1 from fn where name = 'join_ranked_queue' and nargs = 2)),
  (7,  'рейтинг по режимам', 'ranked_status принимает режим',
       exists (select 1 from fn where name = 'ranked_status' and nargs = 3)),
  (8,  'рейтинг по режимам', 'старая ranked_status без режима удалена',
       not exists (select 1 from fn where name = 'ranked_status' and nargs = 2)),
  (9,  'рейтинг по режимам', 'elo_leaderboard принимает режим',
       exists (select 1 from fn where name = 'elo_leaderboard' and nargs = 1)),
  (10, 'рейтинг по режимам', 'старая elo_leaderboard без режима удалена',
       not exists (select 1 from fn where name = 'elo_leaderboard' and nargs = 0)),
  (11, 'рейтинг по режимам', 'ranked_rules на месте',
       exists (select 1 from fn where name = 'ranked_rules')),
  (12, 'рейтинг по режимам', 'match_state отдаёт режим матча',
       exists (select 1 from fn where name = 'match_state' and src like '%rankedMode%')),
  (13, 'рейтинг по режимам', 'список игр различает рейтинг и вызов',
       exists (select 1 from fn where name = 'list_matches' and argnames like '%ranked%')),
  (14, 'жетон на пропуске', 'пропуск с жетоном оставляет ход игроку',
       exists (select 1 from fn where name = 'do_forced_turn'
               and src like '%Пропуск засчитан первым ходом%')),
  (15, 'рейтинг (первая миграция)', 'у матча есть изменение рейтинга',
       exists (select 1 from col where t = 'matches' and c = 'elo_delta')),
  (16, 'рейтинг (первая миграция)', 'у матча есть счётчик молчания и сдача',
       exists (select 1 from col where t = 'matches' and c = 'timeouts')
       and exists (select 1 from col where t = 'matches' and c = 'forfeit_by')),
  -- to_regprocedure вместо строки с подписью: на базе без миграции строка
  -- уронила бы весь отчёт, а так недостающая функция просто даст ✘
  (17, 'безопасность', 'anon может звать join_ranked_queue',
       coalesce(has_function_privilege('anon',
         to_regprocedure('public.join_ranked_queue(text,text,int)'), 'execute'), false)),
  (18, 'безопасность', 'anon может звать ranked_status и elo_leaderboard',
       coalesce(has_function_privilege('anon',
         to_regprocedure('public.ranked_status(text,text,int)'), 'execute'), false)
       and coalesce(has_function_privilege('anon',
         to_regprocedure('public.elo_leaderboard(int)'), 'execute'), false)),
  (19, 'безопасность', 'anon НЕ может начислять рейтинг сам',
       coalesce(has_function_privilege('anon',
         to_regprocedure('public.apply_elo(bigint,int)'), 'execute'), false) = false),
  (20, 'безопасность', 'RLS включена на elo_ratings и ranked_queue',
       (select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname in ('elo_ratings', 'ranked_queue'))),
  (21, 'безопасность', 'политик на этих таблицах нет — только через функции',
       not exists (select 1 from pg_policies
                   where schemaname = 'public' and tablename in ('elo_ratings', 'ranked_queue')))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       part as "миграция", what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ ВСЁ НА МЕСТЕ' else '✘ ЕСТЬ ПРОБЕЛЫ' end,
       'итого', 'строк рейтинга перенесено: ' ||
       -- Имя таблицы здесь строкой: иначе запрос не разберётся на базе,
       -- где миграция ещё не применена, и упадёт целиком вместо отчёта
       case when to_regclass('public.elo_ratings') is null then 'таблицы нет'
            else coalesce((xpath('/row/c/text()', query_to_xml(
                   'select count(*) as c from public.elo_ratings where mode = 0',
                   false, true, '')))[1]::text, '0')
       end
order by 1;
