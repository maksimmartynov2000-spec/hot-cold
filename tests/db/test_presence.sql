\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: отметки и дружба откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, last_seen = null;
  delete from friendships where 'Лев' in (requester, addressee) or 'Кира' in (requester, addressee) or 'Максим' in (requester, addressee);
  insert into friendships(requester, addressee, status) values ('Лев', 'Кира', 'accepted'), ('Максим', 'Лев', 'pending');
end $$;
\echo ok

\echo === 1. отметился — друг видит; свежесть — 2 минуты
do $$ begin
  if friends_online('Лев', '1234') <> '{}'::text[] then raise exception 'ОШИБКА: кто-то в игре до отметки'; end if;
  perform mark_seen('Кира', '4321');
  if friends_online('Лев', '1234') <> array['Кира'] then raise exception 'ОШИБКА: друг не виден: %', friends_online('Лев', '1234'); end if;
  update students set last_seen = now() - interval '3 minutes' where username = 'Кира';
  if friends_online('Лев', '1234') <> '{}'::text[] then raise exception 'ОШИБКА: давний заход считается «сейчас»'; end if;
end $$;
\echo ok

\echo === 2. не другу не видно: заявка — ещё не дружба
do $$ begin
  perform mark_seen('Лев', '1234');
  if friends_online('Максим', '1111') <> '{}'::text[] then raise exception 'ОШИБКА: видно по неотвеченной заявке'; end if;
  if friends_online('Кира', '4321') <> array['Лев'] then raise exception 'ОШИБКА: другу не видно'; end if;
end $$;
\echo ok

\echo === 3. часто не пишет; без PIN — нельзя
do $$
declare t1 timestamptz; t2 timestamptz;
begin
  update students set last_seen = now() - interval '10 seconds' where username = 'Лев';
  t1 := (select last_seen from students where username = 'Лев');
  perform mark_seen('Лев', '1234');
  t2 := (select last_seen from students where username = 'Лев');
  if t1 <> t2 then raise exception 'ОШИБКА: отметка переписана через 10 секунд'; end if;
  begin
    perform mark_seen('Лев', '0000');
    raise exception 'ОШИБКА: отметка без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  begin
    perform friends_online('Лев', '0000');
    raise exception 'ОШИБКА: список без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

rollback;
