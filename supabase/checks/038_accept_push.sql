-- Проверка миграции 038_accept_push.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'база знает новые виды уведомлений',
      exists (select 1 from pg_constraint where conname = 'push_kind'
              and pg_get_constraintdef(oid) like '%accepted%'
              and pg_get_constraintdef(oid) like '%season_end%'
              and pg_get_constraintdef(oid) like '%invite_joined%')),
  (2, 'приняли вызов — вызвавшему уведомление',
      exists (select 1 from pg_trigger g join pg_class c on c.oid = g.tgrelid
              where c.relname = 'matches' and g.tgname = 'push_match_accept' and g.tgenabled = 'O')),
  (3, 'жетон до старта партии не взводится',
      exists (select 1 from fn where name = 'use_match_token' and src like '%not_started%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
