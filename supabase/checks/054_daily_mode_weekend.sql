-- Проверка миграции 054_daily_mode_weekend.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'режим дня по кругу: Блиц, Хаос, Мини-матч',
      exists (select 1 from fn where name = 'daily_variant')
      and daily_variants() = array['blitz', 'chaos', 'mini']),
  (2, 'партия режима дня получает правила дня',
      exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'variant')
      and exists (select 1 from pg_trigger where tgname = 'matches_daily_rules')),
  (3, 'Блиц — 10 секунд на ход, конец партии на 3-м пропуске',
      exists (select 1 from fn where name = 'turn_seconds' and src like '%blitz%')
      and exists (select 1 from fn where name = 'apply_turn_timeout' and src like '%blitz%')),
  (4, 'очередь режима дня (режим 4) открыта',
      exists (select 1 from fn where name = 'join_ranked_queue' and src like '%p_mode > 4%')
      and exists (select 1 from fn where name = 'ranked_status' and src like '%p_mode > 4%')
      and exists (select 1 from pg_constraint where conname = 'elo_mode_range' and pg_get_constraintdef(oid) like '%4%')),
  (5, 'режим дня — очки сезона вдвое',
      exists (select 1 from fn where name = 'matches_pass' and src like '%ranked_mode = 4%')),
  (6, 'выходные — звёзды вдвое',
      exists (select 1 from fn where name = 'ladder_after' and src like '%weekend_on()%')),
  (7, 'победы выходных считаются для турнира',
      to_regclass('public.weekend_cup') is not null
      and exists (select 1 from pg_trigger where tgname = 'matches_weekend')),
  (8, 'награды турнира: сундук за 3, рамка «Турнир» за 5',
      exists (select 1 from fn where name = 'weekend_claim')
      and 'tourney' = any (pass_frames())),
  (9, 'игра видит режим дня и турнир',
      exists (select 1 from fn where name = 'my_online' and src like '%''weekend''%' and src like '%''daily''%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
