-- Проверка миграции 044_fog_all_achievements.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'туман и слепота закрывают все ходы раунда',
      exists (select 1 from fn where name = 'matches_hide_from' and src like '%fog_from[i] := 0%')),
  (2, 'лучшая серия побед запоминается',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'player_stats' and column_name = 'best_win_streak')),
  (3, 'достижений не меньше 29, лестницами',
      coalesce(array_length(achievement_codes(), 1), 0) >= 29),
  (4, 'игра видит, сколько до следующей ступени',
      exists (select 1 from fn where name = 'my_progress' and src like '%winStreak%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
