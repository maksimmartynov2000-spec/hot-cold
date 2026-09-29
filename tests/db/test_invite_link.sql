\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: коды, дружба и уведомления откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, invite_code = null;
  delete from friendships where 'Лев' in (requester, addressee) or 'Кира' in (requester, addressee);
  delete from player_blocks; delete from push_outbox;
end $$;
\echo ok

\echo === 1. свой код выдаётся один раз и не меняется
do $$
declare c1 text; c2 text;
begin
  c1 := my_invite_code('Лев','1234');
  c2 := my_invite_code('Лев','1234');
  if c1 is null or c1 <> c2 or c1 !~ '^[A-HJKMNP-Z2-9]{8}$' then raise exception 'ОШИБКА: код % / %', c1, c2; end if;
  if my_invite_code('Кира','4321') = c1 then raise exception 'ОШИБКА: у двоих один код'; end if;
  perform set_config('t.code', c1, false);
  begin
    perform my_invite_code('Лев','0000');
    raise exception 'ОШИБКА: код без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
end $$;
\echo ok

\echo === 2. по коду видно, кто зовёт; мусор — ничего
do $$
declare c text := current_setting('t.code');
begin
  if invite_owner(lower(c)) <> 'Лев' then raise exception 'ОШИБКА: хозяин кода %', invite_owner(c); end if;
  if invite_owner('ZZZZZZZZ') is not null or invite_owner(null) is not null then raise exception 'ОШИБКА: чужой код нашёлся'; end if;
end $$;
\echo ok

\echo === 3. принял — сразу друзья, пригласившему уведомление
do $$
declare c text := current_setting('t.code');
begin
  if accept_invite('Кира','4321',c) <> 'Лев' then raise exception 'ОШИБКА: принятие вернуло не того'; end if;
  if friend_status('Кира','Лев') <> 'friend' or friend_status('Лев','Кира') <> 'friend' then
    raise exception 'ОШИБКА: не друзья: % / %', friend_status('Кира','Лев'), friend_status('Лев','Кира');
  end if;
  if not exists (select 1 from push_outbox where username = 'Лев' and kind = 'invite_joined' and who = 'Кира') then
    raise exception 'ОШИБКА: пригласившему не сказали';
  end if;
  -- Повторное нажатие ничего не ломает и второй раз не уведомляет
  perform accept_invite('Кира','4321',c);
  if (select count(*) from push_outbox where kind = 'invite_joined') <> 1 then raise exception 'ОШИБКА: второе уведомление'; end if;
end $$;
\echo ok

\echo === 4. свой код, чужой мусор, блокировка
do $$
declare c text := current_setting('t.code');
begin
  begin
    perform accept_invite('Лев','1234',c);
    raise exception 'ОШИБКА: подружился сам с собой';
  exception when others then if sqlerrm <> 'cannot_friend_self' then raise; end if;
  end;
  begin
    perform accept_invite('Максим','1111','ZZZZZZZZ');
    raise exception 'ОШИБКА: принят несуществующий код';
  exception when others then if sqlerrm <> 'no_such_invite' then raise; end if;
  end;
  perform block_player('Максим','1111','Лев');
  begin
    perform accept_invite('Максим','1111',c);
    raise exception 'ОШИБКА: заблокированный стал другом по ссылке';
  exception when others then if sqlerrm <> 'unavailable' then raise; end if;
  end;
end $$;
\echo ok

\echo === 5. код переживает смену имени
do $$
declare c text := current_setting('t.code');
begin
  perform rename_student('Лев','1234','Левон');
  if invite_owner(c) is distinct from 'Левон' then raise exception 'ОШИБКА: после смены имени код ведёт к %', invite_owner(c); end if;
end $$;
\echo ok

\echo === 6. права
set local role anon;
do $$
begin
  if has_function_privilege('anon', 'new_invite_code()', 'execute') then raise exception 'ОШИБКА: anon делает коды'; end if;
  if not has_function_privilege('anon', 'invite_owner(text)', 'execute')
     or not has_function_privilege('anon', 'accept_invite(text,text,text)', 'execute') then
    raise exception 'ОШИБКА: игра не может принять приглашение';
  end if;
end $$;
reset role;
\echo ok

rollback;
