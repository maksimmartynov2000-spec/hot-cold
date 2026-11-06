-- Проверка миграции 063_shop2_pets.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'в магазине 75 товаров, у каждого редкость и одна цена: монеты или кристаллы',
      (select count(*) from shop_catalog()) = 75
      and not exists (select 1 from shop_catalog() c where c.rarity not in ('common', 'rare', 'epic', 'legend'))
      and not exists (select 1 from shop_catalog() c where (c.coins > 0) = (c.gems > 0))
      and (select count(*) from shop_items()) = 75),
  (2, 'новые разделы: питомцы, вещи для них, градусник, эффект победы',
      (select count(*) from shop_catalog() where kind = 'pet') = 3
      and (select count(*) from shop_catalog() where kind = 'gear') = 10
      and (select count(*) from shop_catalog() where kind = 'thermo') = 4
      and (select count(*) from shop_catalog() where kind = 'winfx') = 4
      and exists (select 1 from pg_constraint where conname = 'cosmetic_kind' and pg_get_constraintdef(oid) like '%winfx%')),
  (3, 'у игрока есть питомец, вещи на нём, градусник и эффект победы',
      (select count(*) from information_schema.columns
        where table_schema = 'public' and table_name = 'students'
          and column_name in ('pet', 'pet_gear', 'thermo', 'winfx')) = 4),
  (4, 'опыт питомцев: таблица и предел за день',
      to_regclass('public.pet_xp') is not null
      and exists (select 1 from information_schema.columns
                   where table_schema = 'public' and table_name = 'online_days' and column_name = 'pet_xp')
      and exists (select 1 from fn where name = 'play_done' and src like '%pet_gain%')
      and exists (select 1 from fn where name = 'pet_gain' and src like '%200%')),
  (5, 'наборы со скидкой: 4 набора, в каждом одна валюта',
      (select count(*) from shop_bundles()) = 4
      and not exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
                        left join shop_catalog() c on c.kind || ':' || c.code = it.item
                       where c.kind is null or (b.currency = 'coins' and c.coins = 0) or (b.currency = 'gems' and c.gems = 0))),
  (6, 'товары дня: таблица и скидка при покупке',
      to_regclass('public.shop_deals') is not null
      and exists (select 1 from fn where name = 'shop_buy' and src like '%shop_price%')
      and exists (select 1 from fn where name = 'my_look' and src like '%shop_deals_today%')),
  (7, 'из игры: купить и надеть — можно, цену и опыт прислать — нельзя',
      has_function_privilege('anon', 'shop_buy(text,text,text,text)', 'execute')
      and has_function_privilege('anon', 'shop_buy_bundle(text,text,text)', 'execute')
      and has_function_privilege('anon', 'set_pet(text,text,text)', 'execute')
      and has_function_privilege('anon', 'set_pet_gear(text,text,text,text)', 'execute')
      and has_function_privilege('anon', 'set_thermo(text,text,text)', 'execute')
      and has_function_privilege('anon', 'set_winfx(text,text,text)', 'execute')
      and has_function_privilege('anon', 'my_look(text,text)', 'execute')
      and not has_function_privilege('anon', 'pet_gain(text,int)', 'execute')
      and not has_function_privilege('anon', 'play_done(text,int)', 'execute')
      and not has_function_privilege('anon', 'shop_deals_today(text)', 'execute')
      and not has_function_privilege('anon', 'shop_price(text,text,text)', 'execute')
      and not has_function_privilege('anon', 'shop_bundle_price(text,text)', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
