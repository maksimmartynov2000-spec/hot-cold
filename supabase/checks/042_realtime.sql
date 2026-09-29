-- Проверка миграции 042_realtime.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with trg as (
  select tgname as name from pg_trigger where not tgisinternal
),
checks(nn, what, ok) as (values
  (1, 'у игрока есть ключ своего канала',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'students' and column_name = 'signal_key')),
  (2, 'игра может узнать свой ключ',
      coalesce(has_function_privilege('anon', to_regprocedure('public.my_signal_key(text,text)'), 'execute'), false)),
  (3, 'сигналы идут: партии, ходы, чат партии, друзья, переписка',
      (select count(*) from trg where name in ('matches_signal_ins', 'matches_signal_upd', 'match_moves_signal',
                                               'match_chat_signal', 'friendships_signal', 'friend_chat_signal')) = 6),
  (4, 'сигнал из игры не подделать',
      not coalesce(has_function_privilege('anon', to_regprocedure('public.hc_signal(text,text,bigint)'), 'execute'), true)),
  (5, 'Realtime в базе есть (realtime.send)',
      to_regprocedure('realtime.send(jsonb,text,text,boolean)') is not null)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
