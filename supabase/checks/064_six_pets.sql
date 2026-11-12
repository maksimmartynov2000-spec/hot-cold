-- Проверка миграции 064_six_pets.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  -- Товаров было 127; с миграцией 065 вещи ушли, остались ауры — поэтому «не меньше»
  (1, 'в магазине 6 питомцев, 30 обликов и ауры; прежних питомцев и их вещей нет',
      (select count(*) from shop_catalog()) >= 114
      and (select count(*) from shop_catalog() where kind = 'pet') = 6
      and (select count(*) from shop_catalog() where kind = 'skin') = 30
      and (select count(*) from shop_catalog() where kind = 'gear') >= 16
      and not exists (select 1 from shop_catalog() where code in ('fox', 'wolf', 'drake', 'wizard', 'viking', 'shades', 'scarf', 'bowtie', 'cape'))),
  (2, 'облик — вид вещи за кристаллы; питомцы, вещи и ауры — за монеты',
      exists (select 1 from pg_constraint where conname = 'cosmetic_kind' and pg_get_constraintdef(oid) like '%skin%')
      and not exists (select 1 from shop_catalog() where kind = 'skin' and gems = 0)
      and not exists (select 1 from shop_catalog() where kind in ('pet', 'gear') and coins = 0)),
  (3, 'у каждой вещи есть место; облик и вещь одного питомца знают хозяина',
      not exists (select 1 from shop_catalog() c where c.kind = 'gear' and pet_gear_slot(c.code) is null)
      and not exists (select 1 from shop_catalog() c where c.kind = 'skin'
                        and pet_item_for(c.kind, c.code) not in (select p.code from shop_catalog() p where p.kind = 'pet'))
      and pet_item_for('gear', 'aura_fire') is null and pet_item_for('gear', 'aura_leaves') = 'badger' and pet_gear_slot('aura_leaves') = 'aura'),
  (4, 'наборы: 6, в каждом питомец и две его вещи за монеты',
      (select count(*) from shop_bundles()) = 6
      and not exists (select 1 from shop_bundles() b cross join lateral unnest(b.items) as it(item)
                        left join shop_catalog() c on c.kind || ':' || c.code = it.item
                       where c.kind is null or c.coins = 0)),
  (5, 'наряд на каждого питомца: аура и облик; звёздный — с 2700 опыта',
      exists (select 1 from fn where name = 'set_pet_gear' and src like '%''skin''%' and src like '%''aura''%' and src like '%pet_star_xp%')
      and pet_star_xp() = 2700),
  (6, 'вещь чужого питомца не продаётся и в товары дня не попадает',
      exists (select 1 from fn where name = 'shop_buy' and src like '%pet_locked%')
      and exists (select 1 from fn where name = 'shop_deals_today' and src like '%pet_item_for%')),
  (7, 'прежние питомцы и вещи убраны из коллекций, монеты возвращены',
      exists (select 1 from fn where name = 'six_pets_cleanup')
      and not exists (select 1 from cosmetics where (kind = 'pet' and code in ('fox', 'wolf', 'drake'))
                                                  or (kind = 'gear' and code in ('wizard', 'viking', 'shades', 'scarf', 'bowtie', 'cape')))
      and not exists (select 1 from students where pet in ('fox', 'wolf', 'drake'))),
  (8, 'из игры: купить и надеть — можно; уборку и товары дня запускает только база',
      has_function_privilege('anon', 'shop_buy(text,text,text,text)', 'execute')
      and has_function_privilege('anon', 'set_pet_gear(text,text,text,text)', 'execute')
      and not has_function_privilege('anon', 'six_pets_cleanup()', 'execute')
      and not has_function_privilege('anon', 'shop_deals_today(text)', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
