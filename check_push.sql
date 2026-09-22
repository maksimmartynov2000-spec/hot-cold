-- Проверка двух последних миграций: migration_bonus_balance.txt и migration_push.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
col as (
  select table_name as t, column_name as c
  from information_schema.columns where table_schema = 'public'
),
-- Числа считаем через query_to_xml: на базе без миграции прямой вызов уронил бы
-- весь отчёт, а так недостающая функция просто даст ✘.
num(what, val) as (
  select 'bonus1000', case when to_regprocedure('public.auto_bonus_count(int)') is null then null
    else (xpath('/row/c/text()', query_to_xml(
      'select auto_bonus_count(1000) as c', false, true, '')))[1]::text::int end
  union all
  select 'bonus100', case when to_regprocedure('public.auto_bonus_count(int)') is null then null
    else (xpath('/row/c/text()', query_to_xml(
      'select auto_bonus_count(100) as c', false, true, '')))[1]::text::int end
),
checks(nn, part, what, ok) as (values
  (1,  'баланс бонусов', 'бросок в лаву ложится в широкий пояс «лава или очень горячо»',
       exists (select 1 from fn where name = 'lava_value' and src like '%tier_upper(match_span(m)))[7]%')),
  (2,  'баланс бонусов', 'старый бросок ровно в одну клетку от ответа убран',
       exists (select 1 from fn where name = 'lava_value')
       and not exists (select 1 from fn where name = 'lava_value' and src like '%tier_upper(match_span(m)))[8]%')),
  (3,  'баланс бонусов', 'на диапазоне 1000 бонусов стало 30, а не 16',
       (select val from num where what = 'bonus1000') = 30),
  (4,  'баланс бонусов', 'на малых диапазонах ничего не изменилось (100 → 6)',
       (select val from num where what = 'bonus100') = 6),

  (5,  'уведомления', 'у game_config есть место под открытый ключ',
       exists (select 1 from col where t = 'game_config' and c = 'vapid_public')),
  (6,  'уведомления', 'таблица подписок push_subscriptions создана',
       to_regclass('public.push_subscriptions') is not null),
  (7,  'уведомления', 'очередь push_outbox создана',
       to_regclass('public.push_outbox') is not null),
  (8,  'уведомления', 'push_config отдаёт игре открытый ключ',
       exists (select 1 from fn where name = 'push_config')),
  (9,  'уведомления', 'save_push_subscription принимает язык читающего',
       exists (select 1 from fn where name = 'save_push_subscription' and nargs = 6)),
  (10, 'уведомления', 'drop_push_subscription на месте',
       exists (select 1 from fn where name = 'drop_push_subscription' and nargs = 3)),
  (11, 'уведомления', 'заявка в друзья кладётся в очередь',
       exists (select 1 from pg_trigger where tgname = 'push_friendship' and not tgisinternal)),
  (12, 'уведомления', 'вызов на игру кладётся в очередь',
       exists (select 1 from pg_trigger where tgname = 'push_match' and not tgisinternal)),
  (13, 'уведомления', 'сообщение другу кладётся в очередь',
       exists (select 1 from pg_trigger where tgname = 'push_talk' and not tgisinternal)),
  (14, 'уведомления', 'удаление аккаунта вычищает и очередь уведомлений',
       exists (select 1 from fn where name = 'delete_account' and src like '%push_outbox%')),

  (15, 'безопасность', 'RLS включена на обеих новых таблицах',
       coalesce((select bool_and(c.relrowsecurity) from pg_class c
                 join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public'
                   and c.relname in ('push_subscriptions', 'push_outbox')), false)),
  (16, 'безопасность', 'политик на них нет — только через функции',
       to_regclass('public.push_subscriptions') is not null
       and to_regclass('public.push_outbox') is not null
       and not exists (select 1 from pg_policies where schemaname = 'public'
                   and tablename in ('push_subscriptions', 'push_outbox'))),
  (17, 'безопасность', 'anon может подписаться и отписаться',
       coalesce(has_function_privilege('anon',
         to_regprocedure('public.save_push_subscription(text,text,text,text,text,text)'), 'execute'), false)
       and coalesce(has_function_privilege('anon',
         to_regprocedure('public.drop_push_subscription(text,text,text)'), 'execute'), false)),
  (18, 'безопасность', 'anon НЕ может дёргать триггерные функции сам',
       to_regprocedure('public.push_on_talk()') is not null
       and to_regprocedure('public.push_on_match()') is not null
       and coalesce(has_function_privilege('anon',
         to_regprocedure('public.push_on_talk()'), 'execute'), false) = false
       and coalesce(has_function_privilege('anon',
         to_regprocedure('public.push_on_match()'), 'execute'), false) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       part as "миграция", what as "проверка"
from checks
union all
select 98,
       case when not exists (select 1 from col where t = 'game_config' and c = 'vapid_public')
              then '— шаг 3'
            -- coalesce обязателен: у пустого текста нет текстового узла,
            -- xpath вернёт NULL, и сравнение с '' дало бы NULL вместо истины
            when coalesce((xpath('/row/c/text()', query_to_xml(
                   'select coalesce(vapid_public, '''') as c from game_config where id = 1',
                   false, true, '')))[1]::text, '') = ''
              then '— шаг 3 ещё не сделан'
            else '✔ ключ на месте' end,
       'шаг 3 (не миграция)', 'открытый ключ VAPID записан в game_config'
union all
select 99,
       case when (select bool_and(ok) from checks) then '✔ ОБЕ МИГРАЦИИ НА МЕСТЕ'
            else '✘ ЕСТЬ ПРОБЕЛЫ' end,
       'итого', 'ждёт отправки: ' ||
       case when to_regclass('public.push_outbox') is null then 'таблицы нет'
            else coalesce((xpath('/row/c/text()', query_to_xml(
                   'select count(*) as c from public.push_outbox where sent_at is null',
                   false, true, '')))[1]::text, '0')
       end
order by 1;
