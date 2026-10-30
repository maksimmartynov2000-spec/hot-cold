-- Проверка миграции 055_cup_table_frames_quests.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'рамка турнира — своя у каждого месяца (12 штук)',
      array_length(pass_frames(), 1) = 18 and 'cup-12' = any (pass_frames())
      and exists (select 1 from fn where name = 'weekend_claim' and src like '%cup_frame_code()%')),
  (2, 'таблица турнира: друзья и десятка лучших',
      exists (select 1 from fn where name = 'cup_top' and src like '%friendships%' and src like '%bot_people%')),
  (3, 'задания дня про режим дня',
      exists (select 1 from quest_pool() q where q.code = 'daily2')
      and exists (select 1 from quest_pool() q where q.code = 'daily_win1')
      and exists (select 1 from pg_trigger where tgname = 'matches_daily_quests')),
  (4, 'уведомления турнира: начало и «до награды»',
      exists (select 1 from fn where name = 'push_tick')
      and to_regclass('public.cup_notices') is not null
      and exists (select 1 from pg_constraint where conname = 'push_kind' and pg_get_constraintdef(oid) like '%cup_left%')),
  (5, 'игра видит рамку этих выходных',
      exists (select 1 from fn where name = 'my_online' and src like '%cup_frame_code()%'))
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
