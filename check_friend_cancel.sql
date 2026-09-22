-- Проверка миграции migration_friend_cancel.txt.
-- Вставить целиком в Supabase → SQL Editor → Run. Ничего не меняет, только читает.
-- В колонке «итог» должно быть ✔ у каждой строки.

with fn as (
  select p.proname as name, p.pronargs as nargs, p.prosrc as src
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
),
checks(nn, what, ok) as (values
  (1, 'свою заявку можно отозвать: функция на месте',
      exists (select 1 from fn where name = 'cancel_friend_request' and nargs = 3)),
  (2, 'отменяется только своя и только неотвеченная',
      exists (select 1 from fn where name = 'cancel_friend_request'
              and src like '%requester = me and addressee = other and status = ''pending''%')),
  (3, 'у заявки появилось состояние «отменена»',
      exists (select 1 from pg_constraint
              where conname = 'friendship_status'
                and pg_get_constraintdef(oid) like '%cancelled%')),
  (4, 'неотвеченные заявки протухают',
      exists (select 1 from fn where name = 'expire_friend_requests')),
  (5, 'срок — пять дней',
      exists (select 1 from fn where name = 'expire_friend_requests'
              and src like '%interval ''5 days''%')),
  (6, 'протухшие убираются до подсчёта лимита в двадцать',
      exists (select 1 from fn where name = 'send_friend_request'
              and src like '%expire_friend_requests%')),
  (7, 'отмену и отправку нельзя крутить по кругу',
      exists (select 1 from fn where name = 'send_friend_request'
              and src like '%recently_cancelled%')),
  (8, 'повторная заявка будит уведомлением',
      exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid
              where t.tgname = 'push_friendship' and c.relname = 'friendships'
                and not t.tgisinternal and (t.tgtype & 16) <> 0)),
  (9, 'anon может отменить свою заявку',
      coalesce(has_function_privilege('anon',
        to_regprocedure('public.cancel_friend_request(text,text,text)'), 'execute'), false)),
  (10, 'anon НЕ может чистить заявки сам',
      to_regprocedure('public.expire_friend_requests()') is not null
      and coalesce(has_function_privilege('anon',
        to_regprocedure('public.expire_friend_requests()'), 'execute'), false) = false)
)
select nn as "№",
       case when ok then '✔' else '✘ НЕ ПРИМЕНЕНО' end as "итог",
       what as "проверка"
from checks
union all
select 99, case when (select bool_and(ok) from checks) then '✔ МИГРАЦИЯ НА МЕСТЕ'
                else '✘ ЕСТЬ ПРОБЕЛЫ' end,
       'висит заявок без ответа: ' ||
       coalesce((select count(*)::text from friendships where status = 'pending'), '0')
order by 1;
