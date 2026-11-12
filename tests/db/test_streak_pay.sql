\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Награда за день серии (миграция 066): монеты в сундуке дня, на 5-й и 10-й
-- день — кристаллы, на 10-й ещё и иконка. Раз в день. Откатывается в конце
begin;

\echo === подготовка: Лев сыграл сегодня, кошелёк пуст
do $$
declare d date;
begin
  update students set failed_logins = 0, locked_until = null, tz = 'Pacific/Pago_Pago' where username = 'Лев';
  delete from wallet_log where username = 'Лев';
  delete from wallet where username = 'Лев';
  delete from cosmetics where username = 'Лев';
  delete from online_streak where username = 'Лев';
  d := player_day('Лев');
  delete from online_days where username = 'Лев';
  insert into online_days(username, day, played) values ('Лев', d, true);
end $$;
\echo ok

\echo === 1. первый день серии — 10 🪙, второй раз в тот же день — ничего
do $$
declare r jsonb;
begin
  r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 1 or (r->'pay'->>'coins')::int <> 10 or (r->'pay'->>'gems')::int <> 0 then raise exception 'ОШИБКА: день 1 %', r; end if;
  if (select coins from wallet where username = 'Лев') <> 10 then raise exception 'ОШИБКА: монеты в кошельке'; end if;
  r := open_chest('Лев', '1234');
  if not (r->>'already')::boolean or (select coins from wallet where username = 'Лев') <> 10 then raise exception 'ОШИБКА: второй раз за день %', r; end if;
end $$;
\echo ok

-- Следующий «день»: вчера была серия n, сундук сегодня ещё закрыт
create or replace function pg_temp.next_day(n int) returns void language plpgsql as $$
declare d date := player_day('Лев');
begin
  update online_streak set streak = n, last_day = d - 1, freeze_week = null where username = 'Лев';
  update online_days set chest_at = null, chest = null where username = 'Лев' and day = d;
  delete from wallet_log where username = 'Лев' and reason = 'streak';
end $$;

\echo === 2. дни 2–4: 15, 20, 25 🪙; 5-й — 3 💎
do $$
declare r jsonb; c0 int;
begin
  perform pg_temp.next_day(1); r := open_chest('Лев', '1234');
  if (r->'pay'->>'coins')::int <> 15 then raise exception 'ОШИБКА: день 2 %', r; end if;
  perform pg_temp.next_day(3); r := open_chest('Лев', '1234');
  if (r->'pay'->>'coins')::int <> 25 then raise exception 'ОШИБКА: день 4 %', r; end if;
  c0 := (select coins from wallet where username = 'Лев');
  perform pg_temp.next_day(4); r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 5 or (r->'pay'->>'gems')::int <> 3 or (r->'pay'->>'coins')::int <> 0 then raise exception 'ОШИБКА: день 5 %', r; end if;
  if (select gems from wallet where username = 'Лев') <> 3 or (select coins from wallet where username = 'Лев') <> c0 then raise exception 'ОШИБКА: кристаллы за 5-й день'; end if;
  perform pg_temp.next_day(5); r := open_chest('Лев', '1234');
  if (r->'pay'->>'coins')::int <> 10 then raise exception 'ОШИБКА: день 6 — снова 10 %', r; end if;
end $$;
\echo ok

\echo === 3. 10-й день — 5 💎 и иконка, которой нет; все иконки есть — +50 🪙
do $$
declare r jsonb; g0 int; c0 int;
begin
  g0 := (select gems from wallet where username = 'Лев');
  perform pg_temp.next_day(9); r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 10 or (r->'pay'->>'gems')::int <> 5 or r->'pay'->>'icon' is null then raise exception 'ОШИБКА: день 10 %', r; end if;
  if not cosmetic_has('Лев', 'icon', r->'pay'->>'icon') or (select gems from wallet where username = 'Лев') <> g0 + 5 then raise exception 'ОШИБКА: иконка или кристаллы 10-го дня'; end if;
  insert into cosmetics(username, kind, code, source) select 'Лев', 'icon', c.code, 'shop' from shop_catalog() c where c.kind = 'icon' on conflict do nothing;
  c0 := (select coins from wallet where username = 'Лев');
  perform pg_temp.next_day(19); r := open_chest('Лев', '1234');
  if (r->>'streak')::int <> 20 or r->'pay'->>'icon' is not null or (r->'pay'->>'coins')::int <> 50 then raise exception 'ОШИБКА: 20-й день без новых иконок %', r; end if;
  if (select coins from wallet where username = 'Лев') <> c0 + 50 then raise exception 'ОШИБКА: +50 вместо иконки'; end if;
end $$;
\echo ok

\echo === 4. в игре и в базе — одно и то же расписание
create temp table js_pay(day int, coins int, gems int, chest boolean);
\copy js_pay from 'streak_pay_js.csv' with (format csv, header true)
do $$ begin
  if (select count(*) from js_pay) <> 20 then raise exception 'ОШИБКА: дней в игре %', (select count(*) from js_pay); end if;
  if exists (select j.day, j.coins, j.gems, j.chest from js_pay j
             except select d, x.coins, x.gems, x.chest from generate_series(1, 20) d cross join lateral streak_day_pay(d) x) then
    raise exception 'ОШИБКА: расписание в игре и в базе разное';
  end if;
end $$;
\echo ok

rollback;
