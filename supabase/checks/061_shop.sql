-- Проверка миграции 061_shop.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'кошелёк и журнал на месте',
      (select count(*) from information_schema.tables where table_schema = 'public' and table_name in ('wallet', 'wallet_log')) = 2),
  (2, 'в магазине 54 товара, у каждого одна цена: монеты или кристаллы',
      (select count(*) from shop_items()) = 54
      and not exists (select 1 from shop_items() i where (i.coins > 0) = (i.gems > 0))),
  (3, 'Приключение платит: звёзды, боссы, миры на ★★★',
      (select count(*) from fn where name in ('adventure_result', 'adventure_sync', 'adventure_save')
         and src like '%adventure_wallet%') = 3),
  (4, 'онлайн, Испытание, задания дня и турнир платят',
      exists (select 1 from fn where name = 'matches_pass' and src like '%wallet_earn%')
      and exists (select 1 from fn where name = 'run_report' and src like '%wallet_earn%')
      and exists (select 1 from fn where name = 'daily_quests_pass' and src like '%wallet_add%')
      and exists (select 1 from fn where name = 'weekend_claim' and src like '%wallet_add%')),
  (5, 'купленное надевается: иконка, цвет, фраза',
      exists (select 1 from fn where name = 'set_avatar' and src like '%shop_codes%')
      and exists (select 1 from fn where name = 'set_avatar_color' and src like '%shop_codes%')
      and exists (select 1 from fn where name = 'send_phrase' and src like '%shop_codes%')
      and chat_codes() @> shop_codes('phrase')
      and (select count(*) from pg_constraint where conname in ('student_avatar_allowed', 'student_avatar_color_allowed')
             and pg_get_constraintdef(oid) like '%shop_codes%') = 2),
  (6, 'прошлое начислено: у всех со звёздами Приключения кошелёк посчитан',
      not exists (select 1 from students s
                  where not coalesce(s.is_bot, false) and s.username not like '#%' and s.username not like '@bot:%'
                    and s.adventure_stars ~ '[1-3]'
                    and not exists (select 1 from wallet w where w.username = s.username and w.adv_paid <> ''))),
  (7, 'из игры начислить себе нельзя',
      not has_function_privilege('anon', 'wallet_add(text,int,int,text,text)', 'execute')
      and not has_function_privilege('anon', 'wallet_earn(text,int,text,text)', 'execute')
      and not has_function_privilege('anon', 'adventure_wallet(text)', 'execute')
      and not has_function_privilege('anon', 'wallet_add_paid(text,int,text)', 'execute')
      and has_function_privilege('anon', 'shop_buy(text,text,text,text)', 'execute')
      and has_function_privilege('anon', 'my_wallet(text,text)', 'execute'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
