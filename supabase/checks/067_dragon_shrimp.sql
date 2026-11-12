-- Проверка миграции 067_dragon_shrimp.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with checks(nn, what, ok) as (values
  (1, 'в магазине 130 товаров: 8 питомцев, 40 обликов, 20 аур',
      (select count(*) from shop_catalog()) = 130
      and (select count(*) from shop_catalog() where kind = 'pet') = 8
      and (select count(*) from shop_catalog() where kind = 'skin') = 40
      and (select count(*) from shop_catalog() where kind = 'gear') = 20),
  (2, 'дракон и креветка: по пять обликов за кристаллы и по две свои ауры',
      (select count(*) from shop_catalog() c where c.kind = 'skin' and pet_item_for(c.kind, c.code) = 'dragon' and c.gems > 0) = 5
      and (select count(*) from shop_catalog() c where c.kind = 'skin' and pet_item_for(c.kind, c.code) = 'shrimp' and c.gems > 0) = 5
      and pet_item_for('gear', 'aura_embers') = 'dragon' and pet_item_for('gear', 'aura_jelly') = 'shrimp'
      and pet_gear_slot('aura_coral') = 'aura'),
  (3, 'наборы: 8, в каждом питомец и две его ауры за монеты',
      (select count(*) from shop_bundles()) = 8
      and not exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
                        left join shop_catalog() c on c.kind || ':' || c.code = it.item
                       where c.kind is null or c.coins = 0)
      and not exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
                       where split_part(it.item, ':', 1) = 'gear'
                         and pet_item_for('gear', split_part(it.item, ':', 2)) is distinct from split_part(b.items[1], ':', 2)))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
