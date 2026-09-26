-- Проверка миграции migration_chat_text.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'у сообщения есть место под текст',
      exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'friend_chat' and column_name = 'body')),
  (2, 'в сообщении либо фраза, либо текст, и не длиннее 200',
      exists (select 1 from pg_constraint where conname = 'friend_chat_one_kind')
      and exists (select 1 from pg_constraint where conname = 'friend_chat_body_len')),
  (3, 'текст можно отправить другу',
      exists (select 1 from fn where name = 'send_friend_text' and nargs = 4)),
  (4, 'есть фильтр грубых слов на четырёх языках',
      exists (select 1 from fn where name = 'chat_clean' and src like '%пизд%'
              and src like '%fuck%' and src like '%merde%' and src like '%arschloch%')),
  (5, 'текст проходит через фильтр до записи',
      exists (select 1 from fn where name = 'send_friend_text' and src like '%chat_clean(msg)%')),
  (6, 'лента отдаёт текст сообщений',
      exists (select 1 from fn where name = 'friend_thread' and src like '%''text''%')),
  (7, 'смена имени сохраняет текст',
      exists (select 1 from fn where name = 'rename_student' and src like '%c.body%')),
  (8, 'новые фразы в игре приняты: «Удачи», «Почти», «Ещё раунд»',
      exists (select 1 from fn where name = 'chat_codes' and src like '%luck%'
              and src like '%almost%' and src like '%again%')),
  (9, 'anon может отправить текст',
      coalesce(has_function_privilege('anon', to_regprocedure('public.send_friend_text(text,text,text,text)'), 'execute'), false)),
  (10, 'anon НЕ может звать фильтр сам',
      to_regprocedure('public.chat_clean(text)') is not null
      and coalesce(has_function_privilege('anon', to_regprocedure('public.chat_clean(text)'), 'execute'), false) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end, 'итого'
order by 1;
