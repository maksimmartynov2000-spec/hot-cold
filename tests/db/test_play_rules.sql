\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- «Играть» и «Своя игра»: очередь по правилам, предложения, бот, один рейтинг
-- (миграция 056). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null;
  update matches set status = 'finished' where status in ('invited', 'active');
  delete from ranked_queue;
end $$;
\echo ok

\echo === 1. правила приводятся к одному виду, лишнее отбрасывается
do $$ begin
  if play_rules('{}') <> '{"range":"100","bonuses":true,"wins":3,"blitz":false}'::jsonb then
    raise exception 'ОШИБКА: «Играть» по умолчанию %', play_rules('{}');
  end if;
  if play_rules('{"range":"5000","wins":7,"hack":1}') <> '{"range":"100","bonuses":true,"wins":3,"blitz":false}'::jsonb then
    raise exception 'ОШИБКА: чушь не отброшена %', play_rules('{"range":"5000","wins":7,"hack":1}');
  end if;
  if play_rules('{"daily":true,"range":"20"}') <> '{"daily":true}'::jsonb then raise exception 'ОШИБКА: правила дня'; end if;
  if play_key(play_rules('{"range":"20","bonuses":false,"wins":1,"blitz":true}')) <> '20:n:1:z' then raise exception 'ОШИБКА: ключ'; end if;
end $$;
\echo ok

\echo === 2. одинаковые правила — партия сразу, по этим правилам
do $$
declare r jsonb; m matches;
begin
  r := play_join('Лев', '1234', '{"range":"pm100","bonuses":false,"wins":5,"blitz":true}');
  if r->>'matchId' is not null then raise exception 'ОШИБКА: партия без соперника %', r; end if;
  r := play_join('Кира', '4321', '{"range":"pm100","bonuses":false,"wins":5,"blitz":true}');
  if r->>'matchId' is null then raise exception 'ОШИБКА: не свели одинаковые правила %', r; end if;
  select * into m from matches where id = (r->>'matchId')::bigint;
  if m.range_min <> -100 or m.range_max <> 100 or not m.frost or m.bonuses_on or m.wins_needed <> 5
     or m.variant is distinct from 'blitz' or turn_seconds(m) <> 10 or m.ranked_mode <> 0 or not m.ladder or m.p0 <> 'Лев' then
    raise exception 'ОШИБКА: правила партии %', row_to_json(m);
  end if;
  if (play_status('Лев', '1234')->>'matchId')::bigint <> m.id then raise exception 'ОШИБКА: первый не увидел партию'; end if;
  update matches set status = 'finished' where id = m.id;
end $$;
\echo ok

\echo === 3. разные правила — не сводятся, но видно, кто чего ждёт; позвать — встать к нему
do $$
declare r jsonb; s jsonb;
begin
  delete from ranked_queue;
  perform play_join('Лев', '1234', '{"range":"20","bonuses":true,"wins":3}');
  r := play_join('Кира', '4321', '{}');
  if r->>'matchId' is not null then raise exception 'ОШИБКА: свели разные правила'; end if;
  s := play_status('Кира', '4321');
  if jsonb_array_length(s->'offers') <> 1 or (s->'offers'->0->>'username') <> 'Лев'
     or (s->'offers'->0->'rules'->>'range') <> '20' then
    raise exception 'ОШИБКА: предложения %', s->'offers';
  end if;
  if not (s->>'inQueue')::boolean or (s->'rules'->>'range') <> '100' then raise exception 'ОШИБКА: своя очередь %', s; end if;
  -- Кира принимает правила Льва
  r := play_join('Кира', '4321', s->'offers'->0->'rules');
  if r->>'matchId' is null then raise exception 'ОШИБКА: к Льву не попала %', r; end if;
  if (select range_max from matches where id = (r->>'matchId')::bigint) <> 20 then raise exception 'ОШИБКА: не те правила'; end if;
  update matches set status = 'finished' where id = (r->>'matchId')::bigint;
end $$;
\echo ok

\echo === 4. никого — через 5–25 секунд соперник-«человек» с вашими правилами
do $$
declare s jsonb; m matches;
begin
  delete from ranked_queue;
  perform play_join('Лев', '1234', '{"range":"20","bonuses":false,"wins":1}');
  update ranked_queue set joined_at = now() - interval '30 seconds' where username = 'Лев';
  s := play_status('Лев', '1234');
  if s->>'matchId' is null then raise exception 'ОШИБКА: бот не пришёл %', s; end if;
  select * into m from matches where id = (s->>'matchId')::bigint;
  if m.bot_seat is null or m.range_max <> 20 or m.bonuses_on or m.wins_needed <> 1 then raise exception 'ОШИБКА: бот не с теми правилами %', row_to_json(m); end if;
  update matches set status = 'finished' where id = m.id;
end $$;
\echo ok

\echo === 5. правила дня: режим 4, правила дня ставит партия, очки ×2 остаются
do $$
declare r jsonb; m matches;
begin
  delete from ranked_queue;
  perform play_join('Лев', '1234', '{"daily":true}');
  r := play_join('Кира', '4321', '{"daily":true}');
  select * into m from matches where id = (r->>'matchId')::bigint;
  if m.ranked_mode <> 4 or m.variant <> daily_variant() then raise exception 'ОШИБКА: правила дня %', row_to_json(m); end if;
  update matches set status = 'finished' where id = m.id;
end $$;
\echo ok

\echo === 6. рейтинг один: партия любого правила меняет общий (режим 0)
do $$
declare mid bigint; before int; after int;
begin
  insert into elo_ratings(username, mode) values ('Лев', 0) on conflict do nothing;
  select elo into before from elo_ratings where username = 'Лев' and mode = 0;
  insert into matches(p0, p1, status, ranked, ranked_mode, range_min, range_max) values ('Лев', 'Кира', 'active', true, 4, 1, 100) returning id into mid;
  update matches set wins = array[3, 0], round_winner = 0, match_over = true, status = 'finished' where id = mid;
  perform apply_elo(mid, 0);
  select elo into after from elo_ratings where username = 'Лев' and mode = 0;
  if after <= before then raise exception 'ОШИБКА: общий рейтинг не вырос % → %', before, after; end if;
  if exists (select 1 from elo_ratings where username = 'Лев' and mode = 4 and games > 0) then raise exception 'ОШИБКА: рейтинг режима 4'; end if;
end $$;
\echo ok

\echo === 7. заблокированный в предложениях не виден; anon не создаёт партии сам
do $$
declare s jsonb;
begin
  delete from ranked_queue;
  perform play_join('Лев', '1234', '{"range":"20"}');
  insert into player_blocks(blocker, blocked) values ('Кира', 'Лев') on conflict do nothing;
  perform play_join('Кира', '4321', '{}');
  s := play_status('Кира', '4321');
  if jsonb_array_length(s->'offers') <> 0 then raise exception 'ОШИБКА: виден заблокированный %', s->'offers'; end if;
  delete from player_blocks where blocker = 'Кира' and blocked = 'Лев';
end $$;
set local role anon;
do $$ begin
  if has_function_privilege('anon', 'play_make_match(text,text,jsonb,int,real)', 'execute')
     or has_function_privilege('anon', 'play_pair(text)', 'execute') then
    raise exception 'ОШИБКА: anon создаёт партии';
  end if;
end $$;
reset role;
\echo ok

rollback;
