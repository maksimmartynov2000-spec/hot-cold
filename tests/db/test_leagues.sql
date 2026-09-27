\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: звёзды и партии откатываются в конце
begin;

\echo === подготовка
do $$ begin
  delete from ranked_queue;
  delete from ladder;
  delete from season_badges;
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null, avatar = null, avatar_color = null;
end $$;
\echo ok

\echo === 1. звёзды: +1, третья победа подряд +2, поражение −1 и обрыв серии
do $$
declare s int[] := '{}'; d int;
begin
  foreach d in array array[1, 1, 1, 1, 0, 1] loop
    perform ladder_after('Лев', d = 1);
    s := s || (select stars from ladder where username = 'Лев');
  end loop;
  -- 1, 2, 4 (третья подряд), 6, 5 (поражение), 6 (серия заново)
  if s <> array[1, 2, 4, 6, 5, 6] then raise exception 'ОШИБКА: звёзды %', s; end if;
  if (select streak from ladder where username = 'Лев') <> 1 then raise exception 'ОШИБКА: серия'; end if;
end $$;
\echo ok

\echo === 2. ступени: начало лиги и ранг 5 — ниже не упасть
do $$
declare v int; after int;
begin
  foreach v in array array[0, 15, 30, 45, 60, 135] loop
    update ladder set stars = v where username = 'Лев';
    perform ladder_after('Лев', false);
    after := (select stars from ladder where username = 'Лев');
    if after <> v then raise exception 'ОШИБКА: со ступени % упал до %', v, after; end if;
  end loop;
  update ladder set stars = 31 where username = 'Лев';
  perform ladder_after('Лев', false);
  if (select stars from ladder where username = 'Лев') <> 30 then raise exception 'ОШИБКА: над ступенью не отнялась звезда'; end if;
end $$;
\echo ok

\echo === 3. Легенда: выше Алмаза 1, держится до конца сезона, открывает всё
do $$
declare r ladder;
begin
  update ladder set stars = 148, streak = 2 where username = 'Лев';
  perform ladder_after('Лев', true);       -- третья подряд: +2 → 150
  select * into r from ladder where username = 'Лев';
  if r.stars <> 150 or r.legend_at is null or r.peak <> 5 then raise exception 'ОШИБКА: не Легенда: %', row_to_json(r); end if;
  perform ladder_after('Лев', false);
  perform ladder_after('Лев', true);
  select * into r from ladder where username = 'Лев';
  if r.stars <> 150 then raise exception 'ОШИБКА: Легенда сдвинулась: %', r.stars; end if;
end $$;
\echo ok

\echo === 4. награды: закрытое не поставить, открытое — можно, чужое — никогда
do $$ begin
  delete from ladder where username = 'Кира';
  begin
    perform set_avatar('Кира', '4321', '🦅');
    raise exception 'ОШИБКА: иконка Серебра без Серебра';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  begin
    perform set_avatar_color('Кира', '4321', '#94a3b8');
    raise exception 'ОШИБКА: цвет Серебра без Серебра';
  exception when others then if sqlerrm not like '%color_locked%' then raise; end if;
  end;
  perform ladder_touch('Кира');
  update ladder set stars = 29 where username = 'Кира';
  perform ladder_after('Кира', true);       -- 30 — Серебро 10
  perform set_avatar('Кира', '4321', '🦅');
  perform set_avatar_color('Кира', '4321', '#94a3b8');
  if (select avatar || avatar_color from students where username = 'Кира') <> '🦅#94a3b8' then
    raise exception 'ОШИБКА: открытая награда не поставилась';
  end if;
  begin
    perform set_avatar('Кира', '4321', '🐉');  -- Золото
    raise exception 'ОШИБКА: иконка Золота в Серебре';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  begin
    perform set_avatar('Кира', '4321', '💩');
    raise exception 'ОШИБКА: принята чужая иконка';
  exception when others then if sqlerrm not like '%invalid_avatar%' then raise; end if;
  end;
  -- Лига упала в новом сезоне — открытое остаётся
  update ladder set season = '2000-01', stars = 30, best = 30, games = 3 where username = 'Кира';
  perform ladder_touch('Кира');
  perform set_avatar('Кира', '4321', '🐺');
  -- Обычные иконки — как раньше
  perform set_avatar('Кира', '4321', '🦊');
  perform set_avatar('Кира', '4321', null);
  begin
    update students set avatar = '💩' where username = 'Кира';
    raise exception 'ОШИБКА: база приняла чужую иконку напрямую';
  exception when check_violation then null;
  end;
end $$;
\echo ok

\echo === 5. новый сезон: значок за прошлый, спуск на лигу
do $$
declare r ladder; b int;
begin
  delete from season_badges;
  -- Платина 3 (83) при лучшем 95 (Платина) → Серебро того же ранга без звёзд
  update ladder set season = '2000-01', stars = 83, best = 95, games = 5, streak = 4 where username = 'Лев';
  r := ladder_touch('Лев');
  if r.season <> ladder_season() or r.stars <> 51 or r.streak <> 0 or r.games <> 0 or r.best <> 51 then
    raise exception 'ОШИБКА: сброс %', row_to_json(r);
  end if;
  select league into b from season_badges where username = 'Лев' and season = '2000-01';
  if b is distinct from 3 then raise exception 'ОШИБКА: значок %', b; end if;
  -- Легенда → Алмаз 5; Бронза → начало Бронзы; кто не играл — без значка
  update ladder set season = '2000-02', stars = 150, best = 150, games = 1 where username = 'Лев';
  r := ladder_touch('Лев');
  if r.stars <> 135 or (select league from season_badges where username = 'Лев' and season = '2000-02') <> 5 then
    raise exception 'ОШИБКА: из Легенды %', r.stars;
  end if;
  update ladder set season = '2000-03', stars = 20, best = 20, games = 0 where username = 'Лев';
  r := ladder_touch('Лев');
  if r.stars <> 0 or exists (select 1 from season_badges where season = '2000-03') then
    raise exception 'ОШИБКА: Бронза или значок без игр';
  end if;
  -- Повторный вход в том же сезоне ничего не трогает
  update ladder set stars = 40 where username = 'Лев';
  r := ladder_touch('Лев');
  if r.stars <> 40 then raise exception 'ОШИБКА: повторный сброс'; end if;
end $$;
\echo ok

\echo === 6. партия из очереди с ботом даёт звезду, разбор её показывает
do $$
declare r jsonb; mid bigint; m matches; rv jsonb;
begin
  delete from ladder where username = 'Максим';
  perform join_ranked_queue('Максим', '1111', 0);
  update ranked_queue set joined_at = now() - interval '16 seconds' where username = 'Максим';
  r := ranked_status('Максим', '1111', 0);
  mid := (r->>'matchId')::bigint;
  select * into m from matches where id = mid;
  if not m.ladder then raise exception 'ОШИБКА: партия из очереди не на звёзды'; end if;
  update matches set wins = array[2, 0], cur = 0 where id = mid;
  perform match_guess('Максим', '1111', mid, (select secret from matches where id = mid));
  select * into m from matches where id = mid;
  if not m.match_over or m.star_delta <> array[1, 0] or m.star_after[1] <> 1 or m.star_after[2] is not null then
    raise exception 'ОШИБКА: звёзды за бота % / %', m.star_delta, m.star_after;
  end if;
  if (select stars from ladder where username = 'Максим') <> 1 then raise exception 'ОШИБКА: звезда не записана'; end if;
  if exists (select 1 from ladder where username like '@bot:%') then raise exception 'ОШИБКА: у бота лестница'; end if;
  rv := match_review('Максим', '1111', mid);
  if rv->'stars'->'delta' <> '[1, 0]'::jsonb or (rv->'stars'->'after'->>0)::int <> 1 then
    raise exception 'ОШИБКА: разбор без звёзд: %', rv->'stars';
  end if;
end $$;
\echo ok

\echo === 7. партия людей из очереди: победителю звезда, проигравшему — минус, открытие лиги отмечено
do $$
declare r jsonb; mid bigint; m matches; win_seat int;
begin
  update ladder set stars = 29, streak = 0 where username = 'Максим';
  delete from ladder where username = 'Кира';
  perform ladder_touch('Кира');
  update ladder set stars = 20 where username = 'Кира';
  perform join_ranked_queue('Кира', '4321', 1);
  r := join_ranked_queue('Максим', '1111', 1);
  mid := (r->>'matchId')::bigint;
  select * into m from matches where id = mid;
  if not m.ladder or m.bot_seat is not null then raise exception 'ОШИБКА: не партия людей на звёзды'; end if;
  win_seat := match_seat(m, 'Максим');
  update matches set wins[win_seat + 1] = 2, cur = win_seat where id = mid;
  perform match_guess('Максим', '1111', mid, (select secret from matches where id = mid));
  select * into m from matches where id = mid;
  if m.star_delta[win_seat + 1] <> 1 or m.star_delta[2 - win_seat] <> -1 then
    raise exception 'ОШИБКА: звёзды людей %', m.star_delta;
  end if;
  if m.star_unlock[win_seat + 1] is distinct from 1 or m.star_unlock[2 - win_seat] is not null then
    raise exception 'ОШИБКА: открытие Серебра не отмечено: %', m.star_unlock;
  end if;
end $$;
\echo ok

\echo === 8. вызов друга на рейтинг звёзд не даёт
do $$
declare mid bigint; m matches; before int;
begin
  insert into friendships(requester, addressee, status) values ('Лев', 'Кира', 'accepted')
  on conflict do nothing;
  update friendships set status = 'accepted' where (requester = 'Лев' and addressee = 'Кира') or (requester = 'Кира' and addressee = 'Лев');
  mid := challenge_friend_ranked('Лев', '1234', 'Кира', 0);
  perform respond_challenge('Кира', '4321', mid, true);
  select * into m from matches where id = mid;
  if m.ladder then raise exception 'ОШИБКА: дружеский рейтинг даёт звёзды'; end if;
  before := (select stars from ladder where username = 'Лев');
  update matches set wins = array[2, 0], cur = 0 where id = mid;
  perform match_guess('Лев', '1234', mid, (select secret from matches where id = mid));
  if (select stars from ladder where username = 'Лев') <> before then raise exception 'ОШИБКА: звёзды за друга'; end if;
end $$;
\echo ok

\echo === 9. статус лестницы и топ сезона
do $$
declare st jsonb; top text;
begin
  update ladder set season = ladder_season(), games = 1;
  update ladder set stars = 150, legend_at = now() - interval '1 hour' where username = 'Кира';
  update ladder set stars = 150, legend_at = now() where username = 'Лев';
  update ladder set stars = 70 where username = 'Максим';
  st := ladder_status('Максим', '1111');
  if (st->>'stars')::int <> 70 or (st->>'season') <> ladder_season() or (st->>'endsIn')::int <= 0
     or (st->>'endsIn')::int > 31 * 86400 or jsonb_typeof(st->'badges') <> 'array' then
    raise exception 'ОШИБКА: статус %', st;
  end if;
  select string_agg(t.username, ',') into top from ladder_top() t;
  -- Легенды первыми, раньше дошедшая — выше
  if top not like 'Кира,Лев,Максим%' then raise exception 'ОШИБКА: топ %', top; end if;
  update ladder set games = 0 where username = 'Максим';
  if exists (select 1 from ladder_top() t where t.username = 'Максим') then raise exception 'ОШИБКА: в топе без игр'; end if;
end $$;
\echo ok

\echo === 10. anon: статус и топ — можно, звёзды руками и таблицы — нельзя
set local role anon;
do $$
declare n int := 0; f text;
begin
  foreach f in array array['ladder_after(text,boolean)', 'ladder_touch(text)'] loop
    if has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon может %', f; end if;
  end loop;
  if not has_function_privilege('anon', 'ladder_status(text,text)', 'execute')
     or not has_function_privilege('anon', 'ladder_top()', 'execute') then
    raise exception 'ОШИБКА: anon не видит лестницу';
  end if;
  begin
    update ladder set stars = 150;
    get diagnostics n = row_count;
  exception when insufficient_privilege then n := 0;
  end;
  if n > 0 then raise exception 'ОШИБКА: anon правит звёзды'; end if;
end $$;
reset role;
\echo ok

\echo === 11. награды в базе те же, что в игре
create temp table js_rewards(league int, kind text, value text);
\copy js_rewards from 'rewards_js.csv' with (format csv, header true)
do $$
declare js text; db text;
begin
  select string_agg(league || kind || value, ',' order by league, kind, value) into js from js_rewards;
  select string_agg(league || kind || value, ',' order by league, kind, value) into db from league_rewards();
  if js is distinct from db then raise exception 'ОШИБКА: награды разошлись: игра % / база %', js, db; end if;
end $$;
\echo ok

rollback;
