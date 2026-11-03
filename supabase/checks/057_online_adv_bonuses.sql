-- Проверка миграции 057_online_adv_bonuses.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'в онлайне раскладываются Рентген, Половина, Щит, Заморозка',
      online_bonus_good() @> array['xray', 'half', 'shield', 'freeze']
      and exists (select 1 from fn where name = 'place_match_bonuses' and src like '%online_bonus_good()%')),
  (2, 'бонусы работают: знание, щит, заморозка',
      exists (select 1 from fn where name = 'apply_match_bonus' and src like '%know_parity%' and src like '%frozen%')),
  (3, 'щит отбивает ловушку',
      exists (select 1 from fn where name = 'match_guess_core' and src like '%shieldUsed%')),
  (4, 'ответ Рентгена и Половины видит только взявший',
      exists (select 1 from fn where name = 'match_state' and src like '%know_parity[my_seat + 1]%')),
  (5, 'новый раунд сбрасывает знания и щиты',
      exists (select 1 from fn where name = 'start_match_round' and src like '%know_half%')
      and exists (select 1 from pg_trigger where tgname = 'matches_frozen_clear'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
