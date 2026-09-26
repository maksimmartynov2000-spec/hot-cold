\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Всё в одной транзакции и в конце откатывается: партии с ботом меняют
-- рейтинг, а следующие файлы ждут рейтинг нетронутым
begin;

\echo === подготовка
do $$ begin
  delete from ranked_queue;
  update matches set status = 'finished' where status in ('invited', 'active');
  update students set failed_logins = 0, locked_until = null;
end $$;
\echo ok

\echo === 1. пять ботов, войти под ботом нельзя
do $$
declare n int; pin text;
begin
  select count(*) into n from students s join bot_personas() p on p.username = s.username where s.is_bot;
  if n <> 5 then raise exception 'ОШИБКА: ботов %', n; end if;
  foreach pin in array array['0000', '1234', '1111', '9999'] loop
    if check_student_pin('@bot:owl', pin) is not null then raise exception 'ОШИБКА: вход под ботом с PIN %', pin; end if;
    update students set failed_logins = 0, locked_until = null where username = '@bot:owl';
  end loop;
  -- Персонажи покрывают всю силу от 0 до 1 без дыр
  if bot_for_level(0) <> '@bot:turtle' or bot_for_level(0.19) <> '@bot:turtle'
     or bot_for_level(0.2) <> '@bot:panda' or bot_for_level(0.5) <> '@bot:dolphin'
     or bot_for_level(0.79) <> '@bot:fox' or bot_for_level(0.8) <> '@bot:owl'
     or bot_for_level(1) <> '@bot:owl' then
    raise exception 'ОШИБКА: персонажи по силе разложены неверно';
  end if;
end $$;
\echo ok

\echo === 2. имя бота не занять, в поиске и в друзьях ботов нет
do $$ begin
  begin
    perform register_student('@bot:cat', '1234', null);
    raise exception 'ОШИБКА: зарегистрировано имя бота';
  exception when others then if sqlerrm not like '%invalid_username%' then raise; end if;
  end;
  begin
    perform register_student('@BOT:Owl2', '1234', null);
    raise exception 'ОШИБКА: зарегистрировано имя бота в другом регистре';
  exception when others then if sqlerrm not like '%invalid_username%' then raise; end if;
  end;
  begin
    perform rename_student('Лев', '1234', '@bot:lev');
    raise exception 'ОШИБКА: переименование в бота';
  exception when others then if sqlerrm not like '%invalid_username%' then raise; end if;
  end;
  if exists (select 1 from find_students('Лев', '1234', '@bot')) then raise exception 'ОШИБКА: бот в поиске'; end if;
  if exists (select 1 from suggest_students('Лев', '1234') s where s.username like '@bot:%') then
    raise exception 'ОШИБКА: бот в предложенных';
  end if;
  begin
    perform send_friend_request('Лев', '1234', '@bot:fox');
    raise exception 'ОШИБКА: заявка в друзья боту';
  exception when others then if sqlerrm not like '%no_such_student%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 3. очередь: до 15 секунд ждём человека, потом — бот
do $$
declare r jsonb; m matches;
begin
  r := join_ranked_queue('Лев', '1234', 0);
  if r->>'matchId' is not null then raise exception 'ОШИБКА: бот сразу, без ожидания'; end if;
  update ranked_queue set joined_at = now() - interval '10 seconds' where username = 'Лев';
  r := ranked_status('Лев', '1234', 0);
  if r->>'matchId' is not null or not (r->>'inQueue')::boolean then
    raise exception 'ОШИБКА: бот раньше 15 секунд: %', r;
  end if;
  if (r->>'botWait')::int <> 15 then raise exception 'ОШИБКА: botWait %', r->>'botWait'; end if;
  update ranked_queue set joined_at = now() - interval '16 seconds' where username = 'Лев';
  r := ranked_status('Лев', '1234', 0);
  if r->>'matchId' is null then raise exception 'ОШИБКА: через 16 секунд бота нет: %', r; end if;
  select * into m from matches where id = (r->>'matchId')::bigint;
  if m.p0 <> 'Лев' or m.p1 not like '@bot:%' or m.bot_seat <> 1 or not m.ranked
     or m.ranked_mode <> 0 or m.range_min <> 1 or m.range_max <> 100 or m.status <> 'active'
     or m.starter <> 0 or m.bot_level is null then
    raise exception 'ОШИБКА: партия с ботом собрана неверно: %', row_to_json(m);
  end if;
  if exists (select 1 from ranked_queue where username = 'Лев') then raise exception 'ОШИБКА: остался в очереди'; end if;
  -- Новичку с рейтингом 1000 — бот средне-слабый: 🐼
  if m.p1 <> '@bot:panda' or abs(m.bot_level - 0.3) > 0.001 then
    raise exception 'ОШИБКА: первый бот % с силой %', m.p1, m.bot_level;
  end if;
  update matches set status = 'finished' where id = m.id;
end $$;
\echo ok

\echo === 4. двое ждущих с далёким рейтингом встречаются друг с другом, а не с ботами
do $$
declare r jsonb; m matches;
begin
  insert into elo_ratings(username, mode, elo, games) values ('Кира', 1, 1600, 20)
  on conflict (username, mode) do update set elo = 1600;
  perform join_ranked_queue('Лев', '1234', 1);
  r := join_ranked_queue('Кира', '4321', 1);
  if r->>'matchId' is not null then raise exception 'ОШИБКА: окно по рейтингу не сработало'; end if;
  -- Прошло почти три минуты: окно выросло до 600, и опрос сводит людей,
  -- хотя бот ждёт уже давно
  update ranked_queue set joined_at = now() - interval '160 seconds';
  r := ranked_status('Кира', '4321', 1);
  if r->>'matchId' is null then raise exception 'ОШИБКА: не свели: %', r; end if;
  select * into m from matches where id = (r->>'matchId')::bigint;
  if m.bot_seat is not null or not (m.p0 in ('Лев', 'Кира') and m.p1 in ('Лев', 'Кира')) then
    raise exception 'ОШИБКА: вместо человека бот: %', row_to_json(m);
  end if;
  r := ranked_status('Лев', '1234', 1);
  if (r->>'matchId')::bigint <> m.id then raise exception 'ОШИБКА: второй не узнал о партии'; end if;
  update matches set status = 'finished' where id = m.id;
end $$;
\echo ok

\echo === 5. бот видит только ответы: возможные числа считаются из ходов, не из загаданного
do $$
declare mid bigint; c int[]; brute int[]; c2 int[]; g int;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 0.9) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 37 where matches.id = mid;
  foreach g in array array[50, 20, 30] loop
    perform match_guess_core(mid, (select cur from matches where matches.id = mid), g);
  end loop;
  c := bot_candidates(mid, 1, false);
  select array_agg(x order by x) into brute from generate_series(1, 100) x
  where feedback_tier(100, abs(x - 50)) = feedback_tier(100, 13)
    and feedback_tier(100, abs(x - 20)) = feedback_tier(100, 17)
    and feedback_tier(100, abs(x - 30)) = feedback_tier(100, 7);
  if c is distinct from brute then raise exception 'ОШИБКА: возможные % / перебор %', c, brute; end if;
  if not (37 = any(c)) then raise exception 'ОШИБКА: загаданное не среди возможных'; end if;
  -- Подменили загаданное — бот видит то же самое: о нём он не знает
  update matches set secret = c[1] where matches.id = mid;
  c2 := bot_candidates(mid, 1, false);
  if c2 is distinct from c then raise exception 'ОШИБКА: бот видит загаданное'; end if;
  perform setseed(0.42); g := bot_pick(mid, 1, 0.9);
  update matches set secret = c[array_length(c, 1)] where matches.id = mid;
  perform setseed(0.42);
  if bot_pick(mid, 1, 0.9) <> g then raise exception 'ОШИБКА: ход бота зависит от загаданного'; end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 6. туман, слепота, короткая память и рассеянность сужают то, что бот видит
-- Ходы подобраны перебором так, что каждая помеха меняет итог: иначе
-- проверка прошла бы и без неё. Загадано 1; Лев 40, бот 27, Лев 38, бот 60
do $$
declare mid bigint; full_c int[]; v int[]; views text[] := '{}';
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 0.9) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 1 where matches.id = mid;
  perform match_guess_core(mid, 0, 40);
  perform match_guess_core(mid, 1, 27);
  perform match_guess_core(mid, 0, 38);
  perform match_guess_core(mid, 1, 60);
  full_c := bot_candidates(mid, 1, false);

  update matches set fog = array[false, true] where matches.id = mid;
  v := bot_candidates(mid, 1, false);
  if v is distinct from (select array_agg(x order by x) from generate_series(1, 100) x
                         where feedback_tier(100, abs(x - 27)) = feedback_tier(100, 26)
                           and feedback_tier(100, abs(x - 60)) = feedback_tier(100, 59)) then
    raise exception 'ОШИБКА: под туманом видны чужие ходы';
  end if;
  views := views || v::text;

  update matches set fog = array[false, false], blind = array[false, true] where matches.id = mid;
  v := bot_candidates(mid, 1, false);
  if v is distinct from (select array_agg(x order by x) from generate_series(1, 100) x
                         where feedback_tier(100, abs(x - 40)) = feedback_tier(100, 39)
                           and feedback_tier(100, abs(x - 38)) = feedback_tier(100, 37)) then
    raise exception 'ОШИБКА: под слепотой видны свои ходы';
  end if;
  views := views || v::text;

  update matches set blind = array[false, false], short_memory = array[false, true] where matches.id = mid;
  v := bot_candidates(mid, 1, false);
  if v is distinct from (select array_agg(x order by x) from generate_series(1, 100) x
                         where feedback_tier(100, abs(x - 38)) = feedback_tier(100, 37)
                           and feedback_tier(100, abs(x - 60)) = feedback_tier(100, 59)) then
    raise exception 'ОШИБКА: короткая память помнит больше двух';
  end if;
  views := views || v::text;

  update matches set short_memory = array[false, false] where matches.id = mid;
  v := bot_candidates(mid, 1, true);
  if v is distinct from (select array_agg(x order by x) from generate_series(1, 100) x
                         where feedback_tier(100, abs(x - 60)) = feedback_tier(100, 59)) then
    raise exception 'ОШИБКА: рассеянный бот помнит больше одного хода';
  end if;
  views := views || v::text;

  if (select count(distinct x) from unnest(views) x) <> 4 or full_c::text = any(views) then
    raise exception 'ОШИБКА: пример не различает помехи';
  end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 7. лучший ход бота — самый информативный, и сначала — тот, что может попасть
do $$
declare mid bigint; pool int[]; one int[]; x int; h double precision; hb double precision := -1;
        s int[] := array[35, 36, 37, 38, 39];
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 1) returning matches.id into mid;
  perform start_match_round(mid);
  pool := bot_pool(mid, s, true, 1);
  -- Перебором: энтропия разбиения пяти чисел по поясам для каждого хода
  for x in 1..100 loop
    select -sum((c::double precision / 5) * ln(c::double precision / 5)) into h
    from (select feedback_tier(100, abs(x - v)) b, count(*) c from unnest(s) v group by 1) q;
    if h > hb + 1e-9 then hb := h; end if;
  end loop;
  foreach x in array pool loop
    select -sum((c::double precision / 5) * ln(c::double precision / 5)) into h
    from (select feedback_tier(100, abs(x - v)) b, count(*) c from unnest(s) v group by 1) q;
    if h < hb - 1e-9 then raise exception 'ОШИБКА: в лучших ход % с энтропией % < %', x, h, hb; end if;
    if not (x = any(s)) then raise exception 'ОШИБКА: лучший ход % не может попасть, хотя такие есть', x; end if;
  end loop;
  -- Осталось одно число — бот его и называет
  one := bot_pool(mid, array[44], true, 1);
  if one is distinct from array[44] then raise exception 'ОШИБКА: при одном числе %', one; end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 8. бот думает несколько секунд и ходит сам, когда игру спрашивают о партии
do $$
declare mid bigint; st jsonb; n int;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter)
  values ('Лев', '@bot:fox', true, 0, 'active', 1, 100, 1, 0.7, 1) returning matches.id into mid;
  perform start_match_round(mid);
  -- Ход бота только что начался: он ещё думает
  st := match_state('Лев', '1234', mid);
  select count(*) into n from match_moves where match_id = mid;
  if n <> 0 then raise exception 'ОШИБКА: бот походил без раздумий'; end if;
  if (st->>'botSeat')::int <> 1 then raise exception 'ОШИБКА: botSeat %', st->>'botSeat'; end if;
  if not exists (select 1 from match_chat where match_id = mid and seat = 1 and code = 'luck') then
    raise exception 'ОШИБКА: Лис не пожелал удачи';
  end if;
  -- Прошло 10 секунд
  update matches set turn_deadline = turn_deadline - interval '10 seconds' where matches.id = mid;
  st := match_state('Лев', '1234', mid);
  select count(*) into n from match_moves where match_id = mid and seat = 1;
  if n <> 1 then raise exception 'ОШИБКА: бот сделал % ходов вместо одного', n; end if;
  if (st->>'cur')::int <> 0 and not (st->>'roundOver')::boolean then raise exception 'ОШИБКА: ход не перешёл к человеку'; end if;
  -- Повторный опрос второго хода не даёт
  st := match_state('Лев', '1234', mid);
  select count(*) into n from match_moves where match_id = mid and seat = 1;
  if n <> 1 then raise exception 'ОШИБКА: опрос дал боту лишний ход'; end if;
  if (select count(*) from match_chat where match_id = mid and seat = 1) <> 1 then
    raise exception 'ОШИБКА: бот здоровается на каждом опросе';
  end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 9. у бота время не кончается
do $$
declare mid bigint; m matches;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 0.9, 1) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set turn_deadline = now() - interval '5 minutes' where matches.id = mid;
  -- Человек пытается сходить не в свой ход: время бота при этом не сгорает
  begin
    perform match_guess('Лев', '1234', mid, 50);
  exception when others then if sqlerrm not like '%not_your_turn%' then raise; end if;
  end;
  select * into m from matches where matches.id = mid;
  if m.timeouts[2] <> 0 or m.cur <> 1 or exists (select 1 from match_moves where match_id = mid and kind = 'timeout') then
    raise exception 'ОШИБКА: у бота сгорело время';
  end if;
  perform match_state('Лев', '1234', mid);
  if not exists (select 1 from match_moves where match_id = mid and seat = 1 and kind = 'guess') then
    raise exception 'ОШИБКА: бот не походил после долгой паузы';
  end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 10. лава и пропуск у бота срабатывают сами
do $$
declare mid bigint; m matches;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter, bonuses_on)
  values ('Лев', '@bot:turtle', true, 2, 'active', 1, 100, 1, 0.1, 1, true) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set auto_lava = array[false, true], turn_deadline = now() - interval '20 seconds' where matches.id = mid;
  perform bot_act(mid);
  select * into m from matches where matches.id = mid;
  if m.auto_lava[2] or not exists (select 1 from match_moves where match_id = mid and seat = 1) then
    raise exception 'ОШИБКА: лава за бота не бросилась';
  end if;
  if (select tier from match_moves where match_id = mid and seat = 1 order by id limit 1) < 6 then
    raise exception 'ОШИБКА: бросок в лаву лёг не у загаданного';
  end if;
  if not m.round_over and m.cur = 1 then
    raise exception 'ОШИБКА: после броска ход остался у бота';
  end if;
  if not m.round_over then
    update matches set cur = 1, skip_turn = array[false, true], turn_deadline = now() - interval '20 seconds'
    where matches.id = mid;
    perform bot_act(mid);
    select * into m from matches where matches.id = mid;
    if m.skip_turn[2] or m.cur <> 0 then raise exception 'ОШИБКА: пропуск бота не сработал'; end if;
  end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 11. когда осталось два числа, сильный бот берёт жетон и выигрывает двумя ходами
do $$
declare mid bigint; m matches; c int[];
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 1.0, 0) returning matches.id into mid;
  perform start_match_round(mid);
  update matches set secret = 38 where matches.id = mid;
  -- Ответы Льва оставляют два числа (как в разборе: 37 и 38 на 1..100)
  perform match_guess_core(mid, 0, 50);
  update matches set cur = 0 where matches.id = mid;
  perform match_guess_core(mid, 0, 20);
  update matches set cur = 0 where matches.id = mid;
  perform match_guess_core(mid, 0, 30);
  update matches set cur = 0 where matches.id = mid;
  perform match_guess_core(mid, 0, 45);
  c := bot_candidates(mid, 1, false);
  if array_length(c, 1) <> 2 then raise exception 'ОШИБКА: подготовка: возможных %', c; end if;
  update matches set turn_deadline = now() - interval '20 seconds' where matches.id = mid;
  perform bot_act(mid);
  select * into m from matches where matches.id = mid;
  if m.tokens[2] <> 0 then raise exception 'ОШИБКА: жетон не взят'; end if;
  if not m.round_over then
    if m.cur <> 1 then raise exception 'ОШИБКА: после первого промаха ход ушёл'; end if;
    update matches set turn_deadline = now() - interval '20 seconds' where matches.id = mid;
    perform bot_act(mid);
    select * into m from matches where matches.id = mid;
  end if;
  if not m.round_over or m.round_winner <> 1 then raise exception 'ОШИБКА: двумя ходами не выиграл'; end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 12. целая партия: рейтинг вдвое меньше, у бота рейтинга нет, сила меняется
do $$
declare mid bigint; m matches; g int; guard int := 0; before_lvl real; before_elo int; lvl real; won boolean;
begin
  delete from bot_skill where username = 'Максим';
  delete from elo_ratings where username = 'Максим';
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter)
  values ('Максим', '@bot:dolphin', true, 0, 'active', 1, 100, 1, 0.5, 0) returning matches.id into mid;
  perform start_match_round(mid);
  before_lvl := bot_level_for('Максим', 0);
  loop
    guard := guard + 1;
    if guard > 400 then raise exception 'ОШИБКА: партия не закончилась'; end if;
    select * into m from matches where matches.id = mid;
    exit when m.status <> 'active';
    if m.round_over then
      perform next_match_round('Максим', '1111', mid);
          continue;
    end if;
    if m.cur = 0 then
      g := bot_pick(mid, 0, 1.0);          -- человек играет как сильный бот
      perform match_guess('Максим', '1111', mid, g);
    else
      update matches set turn_deadline = now() - interval '20 seconds' where matches.id = mid;
      perform match_state('Максим', '1111', mid);
    end if;
  end loop;
  select * into m from matches where matches.id = mid;
  won := m.wins[1] >= 3;
  if not m.elo_applied then raise exception 'ОШИБКА: рейтинг не применён'; end if;
  if m.elo_delta[1] <> (case when won then 10 else -10 end) or m.elo_delta[2] <> 0 then
    raise exception 'ОШИБКА: рейтинг за бота %, победа %', m.elo_delta, won;
  end if;
  if exists (select 1 from elo_ratings where username like '@bot:%') then raise exception 'ОШИБКА: у бота есть рейтинг'; end if;
  select level into lvl from bot_skill where username = 'Максим' and mode = 0;
  if abs(lvl - (before_lvl + case when won then 0.07 else -0.07 end)) > 0.001 then
    raise exception 'ОШИБКА: сила бота % после %, победа %', lvl, before_lvl, won;
  end if;
  perform match_state('Максим', '1111', mid);
  perform match_state('Максим', '1111', mid);   -- опрос повторяется: фраза — нет
  if not exists (select 1 from match_chat where match_id = mid and seat = 1 and code = 'gg') then
    raise exception 'ОШИБКА: бот не сказал «хорошая игра»';
  end if;
  if (select count(*) from match_chat where match_id = mid and seat = 1 and code = 'gg') <> 1 then
    raise exception 'ОШИБКА: «хорошая игра» повторяется';
  end if;
end $$;
\echo ok

\echo === 13. лесенка: серия побед разгоняет бота, поражение разворачивает, границы 0 и 1
do $$
declare lv real[] := '{}'; b bot_skill;
begin
  delete from bot_skill where username = 'Кира' and mode = 3;
  insert into bot_skill(username, mode, level) values ('Кира', 3, 0.5);
  perform bot_skill_after('Кира', 3, true);  select * into b from bot_skill where username = 'Кира' and mode = 3; lv := lv || b.level;
  perform bot_skill_after('Кира', 3, true);  select * into b from bot_skill where username = 'Кира' and mode = 3; lv := lv || b.level;
  perform bot_skill_after('Кира', 3, true);  select * into b from bot_skill where username = 'Кира' and mode = 3; lv := lv || b.level;
  perform bot_skill_after('Кира', 3, true);  select * into b from bot_skill where username = 'Кира' and mode = 3; lv := lv || b.level;
  perform bot_skill_after('Кира', 3, false); select * into b from bot_skill where username = 'Кира' and mode = 3; lv := lv || b.level;
  -- +0,07, +0,105, +0,14, +0,14, потом −0,07
  if abs(lv[1] - 0.57) > 0.001 or abs(lv[2] - 0.675) > 0.001 or abs(lv[3] - 0.815) > 0.001
     or abs(lv[4] - 0.955) > 0.001 or abs(lv[5] - 0.885) > 0.001 or b.streak <> -1 or b.games <> 5 then
    raise exception 'ОШИБКА: лесенка %, серия %', lv, b.streak;
  end if;
  update bot_skill set level = 0.98, streak = 5 where username = 'Кира' and mode = 3;
  perform bot_skill_after('Кира', 3, true);
  if (select level from bot_skill where username = 'Кира' and mode = 3) > 1 then raise exception 'ОШИБКА: сила выше 1'; end if;
  update bot_skill set level = 0.02, streak = -5 where username = 'Кира' and mode = 3;
  perform bot_skill_after('Кира', 3, false);
  if (select level from bot_skill where username = 'Кира' and mode = 3) < 0 then raise exception 'ОШИБКА: сила ниже 0'; end if;
  -- Сильному игроку и первый бот сильнее
  delete from bot_skill where username = 'Кира' and mode = 1;
  if abs(bot_level_for('Кира', 1) - 0.9) > 0.001 then raise exception 'ОШИБКА: старт от рейтинга 1600: %', bot_level_for('Кира', 1); end if;
end $$;
\echo ok

\echo === 14. реванш с ботом — сразу, тот же персонаж
do $$
declare old bigint; nid bigint; m matches;
begin
  select id into old from matches where p0 = 'Максим' and bot_seat = 1 and status = 'finished' order by id desc limit 1;
  update bot_skill set level = 0.95 where username = 'Максим' and mode = 0;
  nid := rematch('Максим', '1111', old);
  select * into m from matches where matches.id = nid;
  if m.status <> 'active' or m.p1 <> '@bot:dolphin' or m.bot_seat <> 1
     or m.bot_level < 0.4 or m.bot_level >= 0.6 then
    raise exception 'ОШИБКА: реванш %', row_to_json(m);
  end if;
  update matches set status = 'finished' where matches.id = nid;
end $$;
\echo ok

\echo === 15. человек молчит — проигрывает боту, как и человеку
do $$
declare mid bigint; m matches; lvl real;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, starter)
  values ('Максим', '@bot:dolphin', true, 0, 'active', 1, 100, 1, 0.5, 0) returning matches.id into mid;
  perform start_match_round(mid);
  select level into lvl from bot_skill where username = 'Максим' and mode = 0;
  update matches set turn_deadline = now() - interval '1 second' where matches.id = mid;
  perform apply_turn_timeout(mid);
  update matches set cur = 0, turn_deadline = now() - interval '1 second' where matches.id = mid;
  perform apply_turn_timeout(mid);
  select * into m from matches where matches.id = mid;
  if m.status <> 'finished' or m.forfeit_by <> 0 or m.elo_delta[1] >= 0 then
    raise exception 'ОШИБКА: молчание без последствий %', row_to_json(m);
  end if;
  if (select level from bot_skill where username = 'Максим' and mode = 0) >= lvl then
    raise exception 'ОШИБКА: после поражения бот не стал слабее';
  end if;
end $$;
\echo ok

\echo === 16. «когда играли» — только партии людей
do $$
declare r jsonb;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status) values ('Лев', 'Кира', true, 0, 'finished');
  update matches set updated_at = now() - interval '3 hours' where ranked and bot_seat is null and ranked_mode = 0;
  update matches set updated_at = now() where ranked and bot_seat is not null and ranked_mode = 0;
  r := ranked_status('Лев', '1234', 0);
  if (r->>'lastAgo') is null or (r->>'lastAgo')::int < 3600 then
    raise exception 'ОШИБКА: партия с ботом считается игрой людей: %', r->>'lastAgo';
  end if;
end $$;
\echo ok

\echo === 17. ход бота считается быстро даже на −100..100
do $$
declare mid bigint; t0 timestamptz; ms double precision;
begin
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, frost, bot_seat, bot_level, starter)
  values ('Лев', '@bot:owl', true, 1, 'active', -100, 100, true, 1, 0.9, 1) returning matches.id into mid;
  perform start_match_round(mid);
  t0 := clock_timestamp();
  perform bot_pick(mid, 1, 0.9);
  ms := extract(epoch from clock_timestamp() - t0) * 1000;
  if ms > 500 then raise exception 'ОШИБКА: ход бота считался % мс', round(ms); end if;
  raise notice 'первый ход на −100..100: % мс', round(ms);
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

\echo === 18. без PIN за бота не сходить: служебное anon недоступно
set local role anon;
do $$
declare f text;
begin
  foreach f in array array[
    'match_guess_core(bigint,int,int)', 'forced_turn_core(bigint,int)', 'bot_act(bigint)',
    'bot_pick(bigint,int,double precision)', 'bot_candidates(bigint,int,boolean)',
    'bot_pool(bigint,int[],boolean,double precision)', 'ranked_pair(text,int)',
    'bot_skill_after(text,int,boolean)', 'bot_level_for(text,int)', 'bot_seed()'] loop
    if has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon может %', f; end if;
  end loop;
  foreach f in array array['match_state(text,text,bigint)', 'match_guess(text,text,bigint,int)',
                           'ranked_status(text,text,int)', 'rematch(text,text,bigint)'] loop
    if not has_function_privilege('anon', f, 'execute') then raise exception 'ОШИБКА: anon не может %', f; end if;
  end loop;
  begin
    perform match_guess_core(1, 0, 1);
    raise exception 'ОШИБКА: anon сходил без PIN';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
\echo ok

\echo === 19. персонажи в базе те же, что в игре
create temp table js_bots(username text, icon text, color text);
\copy js_bots from '/home/user/hot-cold/db/bots_js.csv' with (format csv, header true)
do $$
declare js text; db text;
begin
  select string_agg(username || icon || color, ',' order by username) into js from js_bots;
  select string_agg(username || icon || color, ',' order by username) into db from bot_personas();
  if js is distinct from db then raise exception 'ОШИБКА: боты разошлись: игра % / база %', js, db; end if;
end $$;
\echo ok

\echo === 20. сила работает и в базе: сильный бот обыгрывает слабого
do $$
declare mid bigint; w int := 0; r int; n int; g int; m matches;
begin
  perform setseed(0.3);
  insert into matches(p0, p1, ranked, ranked_mode, status, range_min, range_max, bot_seat, bot_level, wins_needed)
  values ('Лев', '@bot:owl', true, 0, 'active', 1, 100, 1, 1, 1000) returning matches.id into mid;
  for r in 1..60 loop
    update matches set round = r, starter = r % 2 where matches.id = mid;
    perform start_match_round(mid);
    for n in 1..80 loop
      select * into m from matches where matches.id = mid;
      exit when m.round_over;
      -- Место 1 — сила 1, место 0 — сила 0
      g := bot_pick(mid, m.cur, case when m.cur = 1 then 1.0 else 0.0 end);
      perform match_guess_core(mid, m.cur, g);
    end loop;
    select * into m from matches where matches.id = mid;
    if m.round_winner = 1 then w := w + 1; end if;
  end loop;
  raise notice 'сильный выиграл % раундов из 60', w;
  if w < 42 then raise exception 'ОШИБКА: сильный бот выиграл только % из 60', w; end if;
  update matches set status = 'finished' where matches.id = mid;
end $$;
\echo ok

rollback;
