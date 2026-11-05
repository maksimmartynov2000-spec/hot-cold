-- Проверка миграций 018_ranked.txt, 019_ranked_modes.txt и 020_forced_token.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.
-- Миграция 062 убрала онлайн со случайными соперниками (очередь, рейтинг,
-- ботов, турнир): проверки этого отсюда убраны

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
  (2,  'рейтинг по режимам', 'старые колонки students.elo убраны',
       not exists (select 1 from col where t = 'students' and c in ('elo', 'elo_games'))),
  (3,  'рейтинг по режимам', 'у матча есть номер режима',
       exists (select 1 from col where t = 'matches' and c = 'ranked_mode')),
  (13, 'рейтинг по режимам', 'список игр различает рейтинг и вызов',
       exists (select 1 from fn where name = 'list_matches' and argnames like '%ranked%')),
  (14, 'жетон на пропуске', 'пропуск с жетоном оставляет ход игроку',
       -- с миграции ботов этот код живёт в forced_turn_core, раньше — в do_forced_turn
       exists (select 1 from fn where name in ('do_forced_turn', 'forced_turn_core')
               and src like '%Пропуск засчитан первым ходом%')),
  (15, 'рейтинг (первая миграция)', 'у матча есть изменение рейтинга',
       exists (select 1 from col where t = 'matches' and c = 'elo_delta')),
  (16, 'рейтинг (первая миграция)', 'у матча есть счётчик молчания и сдача',
       exists (select 1 from col where t = 'matches' and c = 'timeouts')
       and exists (select 1 from col where t = 'matches' and c = 'forfeit_by'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       part as "миграция", what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ ВСЁ НА МЕСТЕ' else '✘ ЕСТЬ ПРОБЕЛЫ' end,
       'итого', ''
order by 1;
