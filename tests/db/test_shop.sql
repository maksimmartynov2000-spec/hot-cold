\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Магазин: кошелёк, начисления за игру, покупки, надеть купленное
-- (миграция 061). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null, frame = null, title = null, avatar = null,
                      avatar_color = null, adventure = 0, adventure_stars = '', tz = 'Pacific/Pago_Pago'
   where username in ('Лев', 'Кира', 'Максим');
  delete from wallet_log where username in ('Лев', 'Кира', 'Максим');
  delete from wallet where username in ('Лев', 'Кира', 'Максим');
  delete from cosmetics where username in ('Лев', 'Кира', 'Максим');
  delete from run_sessions where username in ('Лев', 'Кира', 'Максим');
  delete from weekend_goal where username in ('Лев', 'Кира', 'Максим');
  -- Задания на сегодня уже выполнены: их 20 🪙 сюда не примешаются
  delete from daily_quests where username in ('Лев', 'Кира', 'Максим');
  insert into daily_quests(username, day, slot, code, goal, progress)
  select u, player_day(u), 1, 'play2', 2, 2 from unnest(array['Лев', 'Кира', 'Максим']) u;
end $$;
\echo ok

\echo === 1. товары: 114, цена одна (монеты или кристаллы), в игре и в базе одинаково, награды не продаются
create temp table js_shop(kind text, code text, coins int, gems int);
\copy js_shop from 'shop_js.csv' with (format csv, header true)
do $$ begin
  if (select count(*) from shop_items()) <> 114 then raise exception 'ОШИБКА: товаров %', (select count(*) from shop_items()); end if;
  if exists (select 1 from shop_items() i where (i.coins > 0) = (i.gems > 0) or i.coins < 0 or i.gems < 0) then
    raise exception 'ОШИБКА: у товара две цены или ни одной';
  end if;
  if exists (select i.kind, i.code, i.coins, i.gems from shop_items() i
             except select j.kind, j.code, j.coins, j.gems from js_shop j)
     or exists (select j.kind, j.code, j.coins, j.gems from js_shop j
                except select i.kind, i.code, i.coins, i.gems from shop_items() i) then
    raise exception 'ОШИБКА: товары в игре и в базе разные';
  end if;
  if (select count(*) from js_shop) <> 114 then raise exception 'ОШИБКА: в игре товаров %', (select count(*) from js_shop); end if;
  -- Коды не совпадают ни с чем, что уже есть: награды и трофеи не продаются
  if shop_codes('icon') && (avatar_choices() || reward_icons() || tutorial_icon() || quest_icons() || adventure_icons()
                            || adventure_char_icons() || pass_icons()) then
    raise exception 'ОШИБКА: иконка магазина совпала с наградой';
  end if;
  if shop_codes('color') && (avatar_colors() || reward_colors() || pass_colors()) then
    raise exception 'ОШИБКА: цвет магазина совпал с наградой';
  end if;
  if shop_codes('frame') && (pass_frames() || array['base', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend']) then
    raise exception 'ОШИБКА: рамка магазина совпала с наградой';
  end if;
  if shop_codes('title') && pass_titles() then raise exception 'ОШИБКА: титул магазина совпал с наградой'; end if;
  if (select count(*) from unnest(chat_codes())) <> (select count(distinct c) from unnest(chat_codes()) c) then
    raise exception 'ОШИБКА: фраза магазина совпала с другой';
  end if;
  if not (chat_codes() @> shop_codes('phrase')) then raise exception 'ОШИБКА: фраз магазина нет в чате'; end if;
end $$;
\echo ok

\echo === 2. Приключение: 5 🪙 за звезду, 2 💎 за босса, 3 💎 за мир на ★★★ — один раз
do $$
declare r jsonb; i int;
begin
  r := adventure_result('Лев', '1234', 0, 2);
  if (r->>'coins')::int <> 10 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: две звезды %', r; end if;
  r := adventure_result('Лев', '1234', 0, 3);
  if (r->>'coins')::int <> 5 then raise exception 'ОШИБКА: третья звезда %', r; end if;
  r := adventure_result('Лев', '1234', 0, 3);
  if (r->>'coins')::int <> 0 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: повтор оплачен %', r; end if;
  -- Хуже прежнего — тоже ничего
  r := adventure_result('Лев', '1234', 0, 1);
  if (r->>'coins')::int <> 0 then raise exception 'ОШИБКА: меньше звёзд оплачено %', r; end if;
  for i in 1 .. 8 loop
    r := adventure_result('Лев', '1234', i, 3);
    if (r->>'coins')::int <> 15 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: соперник % %', i, r; end if;
  end loop;
  -- Босс мира: звёзды, кристаллы за босса и за мир на ★★★
  r := adventure_result('Лев', '1234', 9, 3);
  if (r->>'coins')::int <> 15 or (r->>'gems')::int <> 5 then raise exception 'ОШИБКА: босс %', r; end if;
  r := adventure_result('Лев', '1234', 9, 3);
  if (r->>'coins')::int <> 0 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: босс второй раз %', r; end if;
  if (select coins from wallet where username = 'Лев') <> 150 or (select gems from wallet where username = 'Лев') <> 5 then
    raise exception 'ОШИБКА: кошелёк % 🪙 / % 💎', (select coins from wallet where username = 'Лев'),
      (select gems from wallet where username = 'Лев');
  end if;
  -- С другого телефона: звезда у 11-го соперника
  r := adventure_sync('Лев', '1234', 11, '33333333331');
  if (r->>'coins')::int <> 5 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: синхронизация %', r; end if;
  -- Старая версия игры: босс второго мира пройден без звезды — кристаллы всё равно
  if adventure_save('Лев', '1234', 20) <> 20 then raise exception 'ОШИБКА: сохранение'; end if;
  if (select gems from wallet where username = 'Лев') <> 7 then raise exception 'ОШИБКА: босс второго мира без кристаллов'; end if;
  r := adventure_sync('Лев', '1234', 20, '33333333331');
  if (r->>'coins')::int <> 0 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: синхронизация повторно %', r; end if;
  if (select sum(coins) from wallet_log where username = 'Лев' and reason = 'adventure') <> 155
     or (select sum(gems) from wallet_log where username = 'Лев' and reason = 'adventure') <> 7 then
    raise exception 'ОШИБКА: журнал Приключения';
  end if;
end $$;
\echo ok

\echo === 3. прошлое: по тем же правилам, второй раз — ничего; гостю кошелька нет
do $$
declare r jsonb;
begin
  update students set adventure = 30, adventure_stars = '3333333333' || '2222222222' || '1111111111' where username = 'Кира';
  r := adventure_wallet('Кира');
  if (r->>'coins')::int <> 300 or (r->>'gems')::int <> 9 then raise exception 'ОШИБКА: прошлое %', r; end if;
  r := adventure_wallet('Кира');
  if (r->>'coins')::int <> 0 or (r->>'gems')::int <> 0 then raise exception 'ОШИБКА: прошлое дважды %', r; end if;
  if wallet_person('#гость-1') or wallet_add('#гость-1', 10, 0, 'test', null) or wallet_person('@bot:owl') then
    raise exception 'ОШИБКА: кошелёк у гостя';
  end if;
end $$;
\echo ok

\echo === 4. партия с другом: победа 15 🪙, поражение 5, сдавшемуся 0; партия платится один раз
do $$
declare mid bigint; a0 int; b0 int;
begin
  a0 := (select coins from wallet where username = 'Лев');
  b0 := (select coins from wallet where username = 'Кира');
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100)
  returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  if (select coins from wallet where username = 'Лев') <> a0 + 15 or (select coins from wallet where username = 'Кира') <> b0 + 5 then
    raise exception 'ОШИБКА: за партию % / %', (select coins from wallet where username = 'Лев') - a0,
      (select coins from wallet where username = 'Кира') - b0;
  end if;
  -- Та же партия «закончилась» ещё раз — второй раз не платится
  update matches set status = 'active' where id = mid;
  update matches set status = 'finished' where id = mid;
  if (select coins from wallet where username = 'Лев') <> a0 + 15 then raise exception 'ОШИБКА: партия оплачена дважды'; end if;
  -- Сдался — без монет, победителю — как за победу
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100)
  returning id into mid;
  update matches set forfeit_by = 1, match_over = true, status = 'finished' where id = mid;
  if (select coins from wallet where username = 'Лев') <> a0 + 30 or (select coins from wallet where username = 'Кира') <> b0 + 5 then
    raise exception 'ОШИБКА: сдача % / %', (select coins from wallet where username = 'Лев') - a0,
      (select coins from wallet where username = 'Кира') - b0;
  end if;
end $$;
\echo ok

\echo === 5. Испытание: 2 🪙 за раунд, не больше 20 за заход
do $$
declare r jsonb;
begin
  r := run_report('Кира', '4321', 5, 2100);
  if (r->>'coins')::int <> 10 then raise exception 'ОШИБКА: 5 раундов %', r; end if;
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  r := run_report('Кира', '4321', 15, 2100);
  if (r->>'coins')::int <> 20 then raise exception 'ОШИБКА: 15 раундов %', r; end if;
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  r := run_report('Кира', '4321', 0, 0);
  if (r->>'coins')::int <> 0 then raise exception 'ОШИБКА: 0 раундов %', r; end if;
end $$;
\echo ok

\echo === 6. игры с другом и Испытание — не больше 300 🪙 в день; задание дня — сверху; завтра — заново
do $$
declare mid bigint; a0 int; t int; r jsonb;
begin
  select coalesce(sum(coins), 0) into t from wallet_log
   where username = 'Лев' and day = player_day('Лев') and reason in ('online', 'trial');
  -- Сегодня уже 290
  perform wallet_earn('Лев', 290 - t, 'online', 'test:cap');
  a0 := (select coins from wallet where username = 'Лев');
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100)
  returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  if (select coins from wallet where username = 'Лев') <> a0 + 10 then
    raise exception 'ОШИБКА: до предела %', (select coins from wallet where username = 'Лев') - a0;
  end if;
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100)
  returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  if (select coins from wallet where username = 'Лев') <> a0 + 10 then raise exception 'ОШИБКА: сверх предела'; end if;
  r := run_report('Лев', '1234', 5, 2100);
  if (r->>'coins')::int <> 0 then raise exception 'ОШИБКА: Испытание сверх предела %', r; end if;
  r := my_wallet('Лев', '1234');
  if (r->>'today')::int <> 300 or (r->>'cap')::int <> 300 or (r->>'coins')::int <> a0 + 10 then
    raise exception 'ОШИБКА: my_wallet %', r;
  end if;
  -- Задание дня в предел не входит: 20 🪙 сверху, и только один раз
  insert into daily_quests(username, day, slot, code, goal, progress) values ('Лев', player_day('Лев'), 2, 'play2', 2, 1);
  update daily_quests set progress = 2 where username = 'Лев' and day = player_day('Лев') and slot = 2;
  if (select coins from wallet where username = 'Лев') <> a0 + 30 then raise exception 'ОШИБКА: задание дня'; end if;
  update daily_quests set progress = 1 where username = 'Лев' and day = player_day('Лев') and slot = 2;
  update daily_quests set progress = 2 where username = 'Лев' and day = player_day('Лев') and slot = 2;
  if (select coins from wallet where username = 'Лев') <> a0 + 30 then raise exception 'ОШИБКА: задание оплачено дважды'; end if;
  -- Другой день (пояс +14 против −11 — дата всегда другая): предел заново
  update students set tz = 'Pacific/Kiritimati' where username = 'Лев';
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100)
  returning id into mid;
  update matches set wins = array[3, 0], match_over = true, status = 'finished' where id = mid;
  if (select coalesce(sum(coins), 0) from wallet_log where username = 'Лев' and day = player_day('Лев') and reason = 'online') <> 15 then
    raise exception 'ОШИБКА: новый день без монет';
  end if;
  if ((my_wallet('Лев', '1234'))->>'today')::int <> 15 then raise exception 'ОШИБКА: today нового дня'; end if;
end $$;
\echo ok

\echo === 7. «Испытание выходных»: 1 💎 за 3 очка, 2 💎 за 5 — один раз
do $$
declare r jsonb; g0 int;
begin
  perform set_config('hc.now', '2026-11-07 12:00+00', true);  -- суббота
  insert into weekend_goal(username, week, points) values ('Лев', weekend_key(), 5);
  g0 := (select gems from wallet where username = 'Лев');
  r := weekend_claim('Лев', '1234', 3);
  if (r->>'gems')::int <> 1 or (select gems from wallet where username = 'Лев') <> g0 + 1 then raise exception 'ОШИБКА: 3 очка %', r; end if;
  r := weekend_claim('Лев', '1234', 3);
  if (select gems from wallet where username = 'Лев') <> g0 + 1 then raise exception 'ОШИБКА: награда дважды %', r; end if;
  r := weekend_claim('Лев', '1234', 5);
  if (r->>'gems')::int <> 2 or (select gems from wallet where username = 'Лев') <> g0 + 3 then raise exception 'ОШИБКА: 5 очков %', r; end if;
  perform set_config('hc.now', '2026-11-04 12:00+00', true);  -- обычная среда, как во всех сценариях
end $$;
\echo ok

\echo === 8. покупка: цена списана, вещь навсегда; чужой PIN, нет товара, мало денег, уже есть — отказ
do $$
declare r jsonb; c0 int; g0 int;
begin
  begin
    perform shop_buy('Лев', '0000', 'icon', 'shop-01');
    raise exception 'ОШИБКА: купил с чужим PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Лев';
  begin
    perform shop_buy('Лев', '1234', 'icon', '🦦');
    raise exception 'ОШИБКА: награда пути продаётся';
  exception when others then if sqlerrm not like '%no_such_item%' then raise; end if;
  end;
  begin
    perform shop_buy('Лев', '1234', 'frame', 'cup-10');
    raise exception 'ОШИБКА: рамка месяца продаётся';
  exception when others then if sqlerrm not like '%no_such_item%' then raise; end if;
  end;
  begin
    perform shop_buy('Максим', '1111', 'icon', 'shop-01');
    raise exception 'ОШИБКА: купил без денег';
  exception when others then if sqlerrm not like '%not_enough%' then raise; end if;
  end;
  perform wallet_add('Лев', 1000, 0, 'test', 'test:topup');
  c0 := (select coins from wallet where username = 'Лев');
  g0 := (select gems from wallet where username = 'Лев');
  r := shop_buy('Лев', '1234', 'icon', 'shop-01');
  if (r->>'coins')::int <> c0 - 90 or (r->>'gems')::int <> g0 or (select coins from wallet where username = 'Лев') <> c0 - 90 then
    raise exception 'ОШИБКА: покупка %', r;
  end if;
  if not exists (select 1 from cosmetics where username = 'Лев' and kind = 'icon' and code = 'shop-01' and source = 'shop') then
    raise exception 'ОШИБКА: иконки нет в наградах';
  end if;
  if not exists (select 1 from wallet_log where username = 'Лев' and reason = 'buy' and coins = -90 and ref = 'icon:shop-01') then
    raise exception 'ОШИБКА: покупки нет в журнале';
  end if;
  begin
    perform shop_buy('Лев', '1234', 'icon', 'shop-01');
    raise exception 'ОШИБКА: купил второй раз';
  exception when others then if sqlerrm not like '%already_owned%' then raise; end if;
  end;
  if (select coins from wallet where username = 'Лев') <> c0 - 90 then raise exception 'ОШИБКА: второй раз списано'; end if;
  -- За кристаллы: не хватает — отказ, деньги на месте
  begin
    perform shop_buy('Лев', '1234', 'frame', 'galaxy');
    raise exception 'ОШИБКА: рамка за 14 💎 при %', g0;
  exception when others then if sqlerrm not like '%not_enough%' then raise; end if;
  end;
  -- Кристаллы за деньги (на будущее): номер платежа — один раз
  if not wallet_add_paid('Лев', 50, 'pay:test-1') then raise exception 'ОШИБКА: оплата не дошла'; end if;
  if wallet_add_paid('Лев', 50, 'pay:test-1') then raise exception 'ОШИБКА: оплата дважды'; end if;
  if (select gems_paid from wallet where username = 'Лев') <> 50 or (select gems from wallet where username = 'Лев') <> g0 + 50 then
    raise exception 'ОШИБКА: кристаллы за деньги';
  end if;
  r := shop_buy('Лев', '1234', 'frame', 'galaxy');
  if (r->>'gems')::int <> g0 + 36 then raise exception 'ОШИБКА: рамка за кристаллы %', r; end if;
  perform shop_buy('Лев', '1234', 'color', 'grad-mint');
  perform shop_buy('Лев', '1234', 'title', 'thinker');
  perform shop_buy('Лев', '1234', 'phrase', 'bingo');
  if (select coins from wallet where username = 'Лев') <> c0 - 320 then raise exception 'ОШИБКА: итог покупок'; end if;
  if (select count(*) from jsonb_array_elements(my_online('Лев', '1234')->'owned') o where o->>'code' in
      ('shop-01', 'galaxy', 'grad-mint', 'thinker', 'bingo')) <> 5 then
    raise exception 'ОШИБКА: купленного нет в my_online';
  end if;
end $$;
\echo ok

\echo === 9. купленное надевается и видно другим; чужое — нет
do $$
declare mid bigint;
begin
  if set_avatar('Лев', '1234', 'shop-01') <> 'shop-01' then raise exception 'ОШИБКА: иконка'; end if;
  begin
    perform set_avatar('Кира', '4321', 'shop-01');
    raise exception 'ОШИБКА: чужая иконка';
  exception when others then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  if set_avatar_color('Лев', '1234', 'grad-mint') <> 'grad-mint' then raise exception 'ОШИБКА: цвет'; end if;
  begin
    perform set_avatar_color('Кира', '4321', 'grad-mint');
    raise exception 'ОШИБКА: чужой цвет';
  exception when others then if sqlerrm not like '%color_locked%' then raise; end if;
  end;
  if set_frame('Лев', '1234', 'galaxy') <> 'galaxy' then raise exception 'ОШИБКА: рамка'; end if;
  begin
    perform set_frame('Кира', '4321', 'galaxy');
    raise exception 'ОШИБКА: чужая рамка';
  exception when others then if sqlerrm not like '%frame_locked%' then raise; end if;
  end;
  if set_title('Лев', '1234', 'thinker') <> 'thinker' then raise exception 'ОШИБКА: титул'; end if;
  begin
    perform set_title('Кира', '4321', 'thinker');
    raise exception 'ОШИБКА: чужой титул';
  exception when others then if sqlerrm not like '%title_locked%' then raise; end if;
  end;
  if not exists (select 1 from faces_for('Кира', '4321', array['Лев']) f
                 where f.avatar = 'shop-01' and f.color = 'grad-mint' and f.frame = 'galaxy' and f.title = 'thinker') then
    raise exception 'ОШИБКА: другим не видно';
  end if;
  insert into matches(p0, p1, status, range_min, range_max) values ('Лев', 'Кира', 'active', 1, 100)
  returning id into mid;
  if not send_phrase('Лев', '1234', mid, 'bingo') then raise exception 'ОШИБКА: своя фраза'; end if;
  begin
    perform send_phrase('Кира', '4321', mid, 'bingo');
    raise exception 'ОШИБКА: чужая фраза';
  exception when others then if sqlerrm not like '%phrase_locked%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 10. anon: витрина и покупка — да, начислить себе — нет, чужие кошельки не видно
set local role anon;
do $$ begin
  if has_function_privilege('anon', 'wallet_add(text,int,int,text,text)', 'execute')
     or has_function_privilege('anon', 'wallet_earn(text,int,text,text)', 'execute')
     or has_function_privilege('anon', 'adventure_wallet(text)', 'execute')
     or has_function_privilege('anon', 'wallet_add_paid(text,int,text)', 'execute')
     or has_function_privilege('anon', 'wallet_person(text)', 'execute') then
    raise exception 'ОШИБКА: anon начисляет себе';
  end if;
  if not has_function_privilege('anon', 'shop_buy(text,text,text,text)', 'execute')
     or not has_function_privilege('anon', 'my_wallet(text,text)', 'execute')
     or not has_function_privilege('anon', 'shop_items()', 'execute') then
    raise exception 'ОШИБКА: anon не может купить';
  end if;
  if has_table_privilege('anon', 'wallet', 'select') and exists (select 1 from wallet) then
    raise exception 'ОШИБКА: кошельки видно';
  end if;
  if has_table_privilege('anon', 'wallet_log', 'select') and exists (select 1 from wallet_log) then
    raise exception 'ОШИБКА: журнал видно';
  end if;
end $$;
reset role;
\echo ok

rollback;
