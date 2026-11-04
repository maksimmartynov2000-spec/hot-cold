-- Проверка миграции 059_adventure_50_worlds.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'прогресс и звёзды — до 500 соперников',
      exists (select 1 from pg_constraint where conname = 'student_adventure_range'
              and pg_get_constraintdef(oid) like '%500%')
      and exists (select 1 from pg_constraint where conname = 'student_adventure_stars'
                  and pg_get_constraintdef(oid) like '%<= 500%')),
  (2, 'иконки боссов 50 миров: первые пять прежние, дальше портреты',
      coalesce(array_length(adventure_icons(), 1), 0) = 50
      and (adventure_icons())[1:5] = array['🧙','🦍','🦑','🐲','🛸']
      and (adventure_icons())[6] = 'adv-60' and (adventure_icons())[50] = 'adv-500'),
  (3, 'портреты соперников adv-01 … adv-500',
      coalesce(array_length(adventure_char_icons(), 1), 0) = 500 and (adventure_char_icons())[500] = 'adv-500'),
  (4, 'миры считаются до 50',
      adventure_worlds(500) = 50 and adventure_gold_worlds(repeat('3', 500)) = 50),
  (5, 'сохранение и победа принимают соперников до 500',
      exists (select 1 from fn where name = 'adventure_save' and src like '%least(500%')
      and exists (select 1 from fn where name = 'adventure_sync' and src like '%length(p_stars) > 500%')
      and exists (select 1 from fn where name = 'adventure_result' and src like '%p_n > 499%')),
  (6, 'достижения за 10, 25 и 50 миров и до 1500 звёзд',
      coalesce(array_length(achievement_codes(), 1), 0) = 71
      and achievement_codes() @> array['adv_stars_1500', 'adv_worlds_50', 'adv_gold_50'])
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
