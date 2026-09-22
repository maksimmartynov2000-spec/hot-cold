\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка: между Львом, Кирой и Максимом ничего нет
do $$ begin
  delete from friendships;
  delete from push_outbox;
  update students set created_at = now() - interval '2 hours';
end $$;
\echo ok

\echo === 1. свою заявку можно отозвать
do $$ begin
  perform send_friend_request('Лев','1234','Кира');
  if friend_status('Лев','Кира') is distinct from 'outgoing' then
    raise exception 'ОШИБКА: заявка не отправилась';
  end if;
  perform cancel_friend_request('Лев','1234','Кира');
  if friend_status('Лев','Кира') is not null then
    raise exception 'ОШИБКА: после отмены осталось «%»', friend_status('Лев','Кира');
  end if;
end $$;
\echo ok

\echo === 2. и у того, кому она пришла, её больше нет
do $$
declare seen int;
begin
  select count(*) into seen from list_friends('Кира','4321') r where r.username = 'Лев';
  if seen <> 0 then raise exception 'ОШИБКА: отменённая заявка видна адресату'; end if;
end $$;
\echo ok

\echo === 3. чужую заявку отменить нельзя
do $$ begin
  delete from friendships;
  perform send_friend_request('Лев','1234','Кира');
  begin
    perform cancel_friend_request('Кира','4321','Лев');
    raise exception 'ОШИБКА: адресат отменил чужую заявку';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%no_such_request%' then raise; end if;
  end;
  if friend_status('Лев','Кира') is distinct from 'outgoing' then
    raise exception 'ОШИБКА: заявка пострадала';
  end if;
end $$;
\echo ok

\echo === 4. принятую дружбу отменой не разорвать — для этого есть «удалить»
do $$ begin
  perform respond_friend_request('Кира','4321','Лев',true);
  begin
    perform cancel_friend_request('Лев','1234','Кира');
    raise exception 'ОШИБКА: отмена разорвала дружбу';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%no_such_request%' then raise; end if;
  end;
  if friend_status('Лев','Кира') is distinct from 'friend' then
    raise exception 'ОШИБКА: дружба пропала';
  end if;
end $$;
\echo ok

\echo === 5. сразу повторить отменённую заявку нельзя
do $$ begin
  delete from friendships;
  perform send_friend_request('Лев','1234','Кира');
  perform cancel_friend_request('Лев','1234','Кира');
  begin
    perform send_friend_request('Лев','1234','Кира');
    raise exception 'ОШИБКА: отмена и отправка крутятся по кругу';
  exception when sqlstate 'P0001' then
    if sqlerrm not like '%recently_cancelled%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 6. через час — можно
do $$ begin
  update friendships set decided_at = now() - interval '61 minutes'
  where requester = 'Лев' and addressee = 'Кира';
  perform send_friend_request('Лев','1234','Кира');
  if friend_status('Лев','Кира') is distinct from 'outgoing' then
    raise exception 'ОШИБКА: запрет не снялся';
  end if;
end $$;
\echo ok

\echo === 7. неотвеченная заявка старше пяти дней уходит сама
do $$
declare gone int;
begin
  update friendships set created_at = now() - interval '6 days'
  where requester = 'Лев' and addressee = 'Кира';
  gone := expire_friend_requests();
  if gone <> 1 then raise exception 'ОШИБКА: убрано % заявок вместо одной', gone; end if;
  if friend_status('Лев','Кира') is not null then
    raise exception 'ОШИБКА: протухшая заявка осталась';
  end if;
end $$;
\echo ok

\echo === 8. свежая заявка остаётся на месте
do $$ begin
  delete from friendships;
  perform send_friend_request('Лев','1234','Кира');
  update friendships set created_at = now() - interval '4 days'
  where requester = 'Лев' and addressee = 'Кира';
  perform expire_friend_requests();
  if friend_status('Лев','Кира') is distinct from 'outgoing' then
    raise exception 'ОШИБКА: четырёхдневная заявка пропала';
  end if;
end $$;
\echo ok

\echo === 9. принятая дружба не протухает никогда
do $$ begin
  perform respond_friend_request('Кира','4321','Лев',true);
  update friendships set created_at = now() - interval '400 days',
                         decided_at = now() - interval '400 days'
  where requester = 'Лев' and addressee = 'Кира';
  perform expire_friend_requests();
  if friend_status('Лев','Кира') is distinct from 'friend' then
    raise exception 'ОШИБКА: дружба протухла';
  end if;
end $$;
\echo ok

\echo === 10. забытые заявки не занимают место в лимите
do $$
declare i int; n int;
begin
  delete from friendships;
  -- Двадцать мест заняты заявками полугодовой давности
  for i in 1..20 loop
    insert into students(username, pin_hash, created_at)
    values ('Ждун' || i, 'x', now() - interval '2 hours')
    on conflict do nothing;
    insert into friendships(requester, addressee, status, created_at)
    values ('Лев', 'Ждун' || i, 'pending', now() - interval '180 days');
  end loop;
  perform send_friend_request('Лев','1234','Кира');
  if friend_status('Лев','Кира') is distinct from 'outgoing' then
    raise exception 'ОШИБКА: протухшие заявки заняли лимит';
  end if;
  select count(*) into n from friendships where requester = 'Лев' and status = 'pending';
  if n <> 1 then raise exception 'ОШИБКА: осталось % заявок вместо одной', n; end if;
end $$;
\echo ok

\echo === 11. повторная заявка будит уведомлением, а не пропадает молча
do $$
declare n int;
begin
  delete from friendships; delete from push_outbox;
  perform send_friend_request('Лев','1234','Кира');
  perform respond_friend_request('Кира','4321','Лев',false);
  update friendships set decided_at = now() - interval '25 hours'
  where requester = 'Лев' and addressee = 'Кира';
  -- Вторая заявка ложится в ту же строку обновлением, а не вставкой
  perform send_friend_request('Лев','1234','Кира');
  select count(*) into n from push_outbox
  where username = 'Кира' and kind = 'friend_request' and who = 'Лев';
  if n <> 2 then raise exception 'ОШИБКА: уведомлений %, а заявок было две', n; end if;
end $$;
\echo ok

\echo === 12. решённые заявки не копятся в таблице вечно
do $$
declare n int;
begin
  delete from friendships;
  insert into friendships(requester, addressee, status, created_at, decided_at)
  values ('Лев','Кира','declined', now() - interval '30 days', now() - interval '8 days'),
         ('Лев','Максим','cancelled', now() - interval '30 days', now() - interval '8 days');
  perform expire_friend_requests();
  select count(*) into n from friendships;
  if n <> 0 then raise exception 'ОШИБКА: осталось % старых решённых заявок', n; end if;

  insert into friendships(requester, addressee, status, created_at, decided_at)
  values ('Лев','Кира','declined', now() - interval '2 days', now() - interval '2 hours');
  perform expire_friend_requests();
  select count(*) into n from friendships where status = 'declined';
  if n <> 1 then raise exception 'ОШИБКА: свежий отказ стёрли — запрет на сутки перестал работать'; end if;
end $$;
\echo ok

\echo === уборка
do $$ begin
  delete from friendships;
  delete from students where username like 'Ждун%';
  delete from push_outbox;
end $$;
\echo ok
