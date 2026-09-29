\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: заглушка Realtime, партии и сигналы откатываются в конце
begin;

\echo === подготовка
-- realtime.send из 00_base.sql ничего не делает; здесь — заглушка, которая записывает,
-- что ушло и в какой канал

create table pg_temp.sent(payload jsonb, event text, topic text, private boolean);
create or replace function realtime.send(payload jsonb, event text, topic text, private boolean default true) returns void
language sql as $$ insert into pg_temp.sent values (payload, event, topic, private); $$;
do $$ begin
  update students set failed_logins = 0, locked_until = null, signal_key = null;
  delete from friendships where 'Лев' in (requester, addressee) or 'Кира' in (requester, addressee);
  delete from player_blocks;
  update matches set status = 'expired' where status in ('invited', 'active');
end $$;
\echo ok

\echo === 1. ключ канала: свой у каждого, не меняется, без PIN не выдаётся
do $$
declare k1 text; k2 text;
begin
  k1 := my_signal_key('Лев', '1234');
  k2 := my_signal_key('Лев', '1234');
  if k1 is null or k1 <> k2 or k1 !~ '^[0-9a-f]{32}$' then raise exception 'ОШИБКА: ключ % / %', k1, k2; end if;
  if my_signal_key('Кира', '4321') = k1 then raise exception 'ОШИБКА: один ключ на двоих'; end if;
  begin
    perform my_signal_key('Лев', '0000');
    raise exception 'ОШИБКА: ключ без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
end $$;
\echo ok

\echo === 2. вызов, ход, чат — сигнал обоим в их каналы; в сигнале только вид и номер
do $$
declare mid bigint; lev text := 'hc:' || my_signal_key('Лев', '1234'); kira text := 'hc:' || my_signal_key('Кира', '4321');
begin
  delete from pg_temp.sent;
  insert into matches(p0, p1, status, secret) values ('Лев', 'Кира', 'invited', 50) returning id into mid;
  if (select array_agg(topic order by topic) from pg_temp.sent) is distinct from (select array_agg(x order by x) from unnest(array[lev, kira]) x) then
    raise exception 'ОШИБКА: вызов: %', (select array_agg(topic) from pg_temp.sent);
  end if;
  if exists (select 1 from pg_temp.sent where event <> 'sig' or private or payload <> jsonb_build_object('k', 'match', 'id', mid)) then
    raise exception 'ОШИБКА: что в сигнале: %', (select array_agg(payload) from pg_temp.sent);
  end if;
  delete from pg_temp.sent;
  update matches set status = 'active' where id = mid;
  if (select count(*) from pg_temp.sent) <> 2 then raise exception 'ОШИБКА: принятие без сигнала'; end if;
  delete from pg_temp.sent;
  perform match_guess_core(mid, 0, 10);
  if (select count(*) from pg_temp.sent where topic = kira) < 1 then raise exception 'ОШИБКА: ход без сигнала сопернику'; end if;
  delete from pg_temp.sent;
  insert into match_chat(match_id, seat, code) values (mid, 1, 'hi');
  if (select count(*) from pg_temp.sent where topic = lev) <> 1 then raise exception 'ОШИБКА: чат без сигнала'; end if;
end $$;
\echo ok

\echo === 3. «я на месте» при опросе — без сигнала: иначе экраны будили бы друг друга
do $$
declare mid bigint;
begin
  select id into mid from matches where p0 = 'Лев' and status = 'active' order by id desc limit 1;
  delete from pg_temp.sent;
  update matches set seen_at = array[now(), now()], updated_at = now(), turn_deadline = now() + interval '30 seconds' where id = mid;
  perform match_state('Лев', '1234', mid);
  perform match_state('Кира', '4321', mid);
  if exists (select 1 from pg_temp.sent) then raise exception 'ОШИБКА: опрос шлёт сигналы: %', (select count(*) from pg_temp.sent); end if;
end $$;
\echo ok

\echo === 4. друзья и переписка: заявка — обоим, сообщение — тому, кому написали
do $$
declare kira text := 'hc:' || my_signal_key('Кира', '4321');
begin
  delete from pg_temp.sent;
  perform send_friend_request('Лев', '1234', 'Кира');
  if (select count(*) from pg_temp.sent where payload->>'k' = 'friends') <> 2 then raise exception 'ОШИБКА: заявка'; end if;
  perform respond_friend_request('Кира', '4321', 'Лев', true);
  delete from pg_temp.sent;
  perform send_friend_phrase('Лев', '1234', 'Кира', 'play');
  if (select array_agg(topic) from pg_temp.sent where payload->>'k' = 'chat') is distinct from array[kira] then
    raise exception 'ОШИБКА: переписка: %', (select array_agg(topic || ' ' || payload::text) from pg_temp.sent);
  end if;
end $$;
\echo ok

\echo === 5. боту и игроку без ключа — ничего; Realtime сломан — игра идёт
do $$
declare mid bigint;
begin
  update students set signal_key = null where username = 'Кира';
  delete from pg_temp.sent;
  insert into matches(p0, p1, status, secret, bot_seat) values ('Кира', '@bot:owl', 'active', 50, 1) returning id into mid;
  if exists (select 1 from pg_temp.sent) then raise exception 'ОШИБКА: сигнал без ключа или боту'; end if;
  create or replace function realtime.send(payload jsonb, event text, topic text, private boolean default true) returns void
  language plpgsql as $f$ begin raise exception 'realtime down'; end $f$;
  insert into matches(p0, p1, status, secret) values ('Лев', 'Максим', 'invited', 50);
end $$;
\echo ok

rollback;
