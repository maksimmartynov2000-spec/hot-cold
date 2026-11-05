-- Проверка миграции 060_online_new_bonuses.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src, pg_get_function_identity_arguments(p.oid) as args
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'в онлайне раскладываются «Делится на 3?», «Делится на 5?», Компас, Воришка, Зеркало',
      online_bonus_good() @> array['div3', 'div5', 'compass', 'thief', 'mirror']),
  (2, 'бонусы работают: делимость, компас, воришка, зеркало',
      exists (select 1 from fn where name = 'apply_match_bonus' and args like '%p_guess%'
              and src like '%know_div3%' and src like '%know_gt%' and src like '%thief%' and src like '%mirror%')),
  (3, 'зеркало отражает ловушку в соперника',
      exists (select 1 from fn where name = 'match_guess_core' and src like '%mirrorUsed%' and src like '%reflected%')),
  (4, 'новое знание видит только взявший, зеркало — оба',
      exists (select 1 from fn where name = 'match_state' and src like '%know_div3[my_seat + 1]%' and src like '%''mirror''%')),
  (5, 'новый раунд сбрасывает новое знание и зеркало',
      exists (select 1 from fn where name = 'start_match_round' and src like '%know_lt%' and src like '%mirror%')),
  (6, 'бот пользуется новым знанием',
      exists (select 1 from fn where name = 'bot_candidates' and src like '%know_div5%' and src like '%know_lt%')),
  (7, 'колонки на месте',
      (select count(*) from information_schema.columns where table_name = 'matches'
        and column_name in ('know_div3', 'know_div5', 'know_gt', 'know_lt', 'mirror')) = 5)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
