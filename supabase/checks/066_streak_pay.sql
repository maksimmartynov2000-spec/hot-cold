-- Проверка миграции 066_streak_pay.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'дни серии 1–4: 10, 15, 20, 25 🪙; 5-й: 3 💎; 10-й: 5 💎 и иконка; дальше по кругу',
      (select array_agg(x.coins order by d) from generate_series(1, 4) d cross join lateral streak_day_pay(d) x) = array[10, 15, 20, 25]
      and (select gems from streak_day_pay(5)) = 3 and (select coins from streak_day_pay(5)) = 0 and not (select chest from streak_day_pay(5))
      and (select gems from streak_day_pay(10)) = 5 and (select chest from streak_day_pay(10))
      and (select coins from streak_day_pay(11)) = 10 and (select gems from streak_day_pay(15)) = 3 and (select chest from streak_day_pay(20))),
  (2, 'сундук дня начисляет награду за день серии раз в день',
      exists (select 1 from fn where name = 'open_chest' and src like '%streak_day_pay%' and src like '%''streak:''%')),
  (3, 'из игры сундук открыть можно',
      has_function_privilege('anon', 'open_chest(text,text)', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
