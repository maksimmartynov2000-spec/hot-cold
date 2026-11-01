-- Проверка миграции 056_play_rules.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'правила игры: диапазон, бонусы, до скольки побед, блиц, правила дня',
      play_rules('{}') = '{"range":"100","bonuses":true,"wins":3,"blitz":false}'::jsonb
      and play_rules('{"daily":true}') = '{"daily":true}'::jsonb),
  (2, 'очередь по правилам: «Играть» и «Своя игра»',
      exists (select 1 from information_schema.columns where table_name = 'ranked_queue' and column_name = 'rkey')
      and exists (select 1 from fn where name = 'play_join')
      and exists (select 1 from fn where name = 'play_pair' and src like '%bot_people%')),
  (3, 'видно, кто ждёт с другими правилами',
      exists (select 1 from fn where name = 'play_status' and src like '%''offers''%')),
  (4, 'рейтинг один на всё, прежние четыре слиты в лучший',
      exists (select 1 from fn where name = 'apply_elo' and src like '%md int := 0%')
      and exists (select 1 from hc_flags where key = 'elo_merged_056')),
  (5, 'достижение «разные режимы» считается по правилам партии',
      exists (select 1 from fn where name = 'ach_modes' and src like '%m.bonuses_on%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
