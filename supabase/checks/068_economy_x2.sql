-- Проверка миграции 068_economy_x2.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'монеты за игру вдвое: предел 600 в день, партия с другом и Испытание ×2',
      wallet_cap() = 600 and exists (select 1 from fn where name = 'wallet_earn' and src like '%p_coins * 2%')),
  (2, 'Приключение: 10 🪙 за звезду, 3 💎 за босса, 5 💎 за мир на ★★★',
      exists (select 1 from fn where name = 'adventure_wallet' and src like '%10 * (cur - paid)%' and src like '%g := g + 3;%' and src like '%g := g + 5;%')),
  (3, 'серия дней: 20, 30, 40, 50 🪙; 5-й — 3 💎; 10-й — 5 💎',
      (select array_agg(x.coins order by d) from generate_series(1, 4) d cross join lateral streak_day_pay(d) x) = array[20, 30, 40, 50]
      and (select gems from streak_day_pay(5)) = 3 and (select gems from streak_day_pay(10)) = 5),
  (4, 'подарок-перерасчёт выдан и показывается в игре один раз',
      to_regclass('public.gifts') is not null and exists (select 1 from fn where name = 'econ2_gift')
      and has_function_privilege('anon', 'my_gift(text,text)', 'execute')
      and has_function_privilege('anon', 'gift_seen(text,text,text)', 'execute')
      and not has_function_privilege('anon', 'econ2_gift()', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
