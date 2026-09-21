\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$ begin
  delete from matches; delete from ranked_queue;
  delete from elo_ratings; delete from rivalry;
  -- Предыдущие файлы наплодили ботов, и защита «не больше двадцати регистраций
  -- в час» срабатывает на наших. Она тут не проверяется — отодвигаем их в прошлое
  update students set created_at = now() - interval '2 hours';
end $$;
\echo ok

\echo === 1. лесенка идёт 100 / 80 / 60 / 40 / 20 / 10 и дальше 10
do $$
declare got double precision[]; want double precision[] := array[1, .8, .6, .4, .2, .1, .1, .1];
        i int;
begin
  delete from rivalry;
  for i in 1..8 loop
    got := got || elo_multiplier('Лев', 'Кира');
  end loop;
  if got is distinct from want then raise exception 'ОШИБКА: лесенка %', got; end if;
end $$;
\echo ok

\echo === 2. победа соперника обнуляет серию
do $$
declare got double precision;
begin
  delete from rivalry;
  perform elo_multiplier('Лев','Кира');
  perform elo_multiplier('Лев','Кира');
  perform elo_multiplier('Лев','Кира');
  got := elo_multiplier('Кира','Лев');
  if got is distinct from 1.0 then raise exception 'ОШИБКА: чужая победа не обнулила серию: %', got; end if;
  got := elo_multiplier('Кира','Лев');
  if got is distinct from 0.8 then raise exception 'ОШИБКА: новая серия не пошла'; end if;
  -- И обратно: Лев начинает свою серию с нуля
  got := elo_multiplier('Лев','Кира');
  if got is distinct from 1.0 then raise exception 'ОШИБКА: серия не переключилась обратно'; end if;
end $$;
\echo ok

\echo === 3. пара считается одной строкой, в каком бы порядке ни назвали
do $$
declare n int;
begin
  delete from rivalry;
  perform elo_multiplier('Лев','Кира');
  perform elo_multiplier('Кира','Лев');
  select count(*) into n from rivalry;
  if n is distinct from 1 then raise exception 'ОШИБКА: пара размножилась на % строк', n; end if;
  if (select a from rivalry) is distinct from least('Лев','Кира') then
    raise exception 'ОШИБКА: пара сохранена не по порядку';
  end if;
end $$;
\echo ok

\echo === 4. сутки без игр уменьшают серию на единицу, а не обнуляют её
do $$
declare got double precision;
begin
  delete from rivalry;
  perform elo_multiplier('Лев','Кира');       -- серия 1
  perform elo_multiplier('Лев','Кира');       -- 2
  perform elo_multiplier('Лев','Кира');       -- 3
  perform elo_multiplier('Лев','Кира');       -- 4
  update rivalry set last_game = now() - interval '2 days';
  got := elo_multiplier('Лев','Кира');        -- 4 - 2 = 2, значит эта третья
  if got is distinct from 0.6 then raise exception 'ОШИБКА: за двое суток серия ушла в %', got; end if;

  -- Неделя простоя — серия стирается совсем
  update rivalry set last_game = now() - interval '7 days';
  got := elo_multiplier('Лев','Кира');
  if got is distinct from 1.0 then raise exception 'ОШИБКА: неделя простоя не сбросила серию: %', got; end if;
end $$;
\echo ok

\echo === 5. накрутка вторым аккаунтом упирается в потолок
do $$
declare mid bigint; m matches; i int; before int; после int;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  -- Лев побеждает Киру сто раз подряд, ничего между этим не происходит
  for i in 1..100 loop
    insert into matches(p0, p1, wins_needed, range_min, range_max, ranked, ranked_mode,
                        status, secret)
    values ('Лев','Кира', 3, 1, 100, true, 0, 'finished', 50) returning id into mid;
    perform apply_elo(mid, 0);
  end loop;
  select elo into после from elo_ratings where username = 'Лев' and mode = 0;
  if после > 1130 then
    raise exception 'ОШИБКА: накрутка добралась до % — потолок пробит', после;
  end if;
  if после < 1050 then
    raise exception 'ОШИБКА: рейтинг почти не вырос (%), лесенка слишком злая', после;
  end if;
end $$;
\echo ok

\echo === 6. честная пара с чередованием побед почти не теряет
do $$
declare mid bigint; i int; lev int;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  for i in 1..20 loop
    insert into matches(p0, p1, wins_needed, range_min, range_max, ranked, ranked_mode,
                        status, secret)
    values ('Лев','Кира', 3, 1, 100, true, 0, 'finished', 50) returning id into mid;
    perform apply_elo(mid, i % 2);            -- побеждают по очереди
  end loop;
  select elo into lev from elo_ratings where username = 'Лев' and mode = 0;
  -- Ходили поровну, значит рейтинг должен остаться около тысячи
  if abs(lev - 1000) > 15 then
    raise exception 'ОШИБКА: при равной игре рейтинг уехал в %', lev;
  end if;
  if (select games from elo_ratings where username = 'Лев' and mode = 0) is distinct from 20 then
    raise exception 'ОШИБКА: игры не посчитаны';
  end if;
end $$;
\echo ok

\echo === 7. серия общая на все режимы, по режимам её не размазать
do $$
declare mid bigint; md int; got int;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  for md in 0..3 loop
    insert into matches(p0, p1, wins_needed, range_min, range_max, ranked, ranked_mode,
                        status, secret)
    values ('Лев','Кира', 3, 1, 100, true, md, 'finished', 50) returning id into mid;
    perform apply_elo(mid, 0);
  end loop;
  if (select streak from rivalry) is distinct from 4 then
    raise exception 'ОШИБКА: серия не общая — %', (select streak from rivalry);
  end if;
  -- Четвёртая победа шла уже с коэффициентом 0.4
  select elo into got from elo_ratings where username = 'Лев' and mode = 3;
  if got is distinct from 1008 then raise exception 'ОШИБКА: четвёртый режим дал % вместо 1008', got; end if;
end $$;
\echo ok

\echo === 8. удаление аккаунта: имя освобождается, игры остаются
do $$
declare mid bigint; gone text; n int;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  delete from students where username = 'Гость';
  perform register_student('Гость','5555');
  insert into matches(p0, p1, wins_needed, range_min, range_max, ranked, ranked_mode,
                      status, secret, match_over)
  values ('Лев','Гость', 3, 1, 100, true, 0, 'finished', 50, true) returning id into mid;
  insert into elo_ratings(username, mode, elo, games) values ('Гость', 0, 1300, 9);
  insert into runs(username, score, rounds) values ('Гость', 500, 4);
  perform send_friend_request('Гость','5555','Лев');

  gone := delete_account('Гость','5555');
  if gone not like '#%' then raise exception 'ОШИБКА: имя удалённого не помечено: %', gone; end if;

  if exists (select 1 from students where username = 'Гость') then
    raise exception 'ОШИБКА: старое имя осталось занято';
  end if;
  select count(*) into n from matches where id = mid and p1 = gone;
  if n is distinct from 1 then raise exception 'ОШИБКА: матч потерял игрока'; end if;
  if exists (select 1 from elo_ratings where username = gone) then
    raise exception 'ОШИБКА: рейтинг не стёрт';
  end if;
  if exists (select 1 from runs where username in ('Гость', gone)) then
    raise exception 'ОШИБКА: забеги не стёрты';
  end if;
  if exists (select 1 from friendships where requester = gone or addressee = gone) then
    raise exception 'ОШИБКА: дружба не стёрта';
  end if;
  if (select best_run_score from students where username = gone) is distinct from 0 then
    raise exception 'ОШИБКА: рекорд не обнулён';
  end if;
  perform set_config('t.gone', gone, false);
end $$;
\echo ok

\echo === 9. под удалённым именем не войти и не зарегистрироваться
do $$
declare gone text := current_setting('t.gone');
begin
  if check_student_pin(gone, '5555') is not null then
    raise exception 'ОШИБКА: старый PIN всё ещё подходит';
  end if;
  begin
    perform register_student(gone, '1234');
    raise exception 'ОШИБКА: зарегистрировались под именем удалённого';
  exception when others then
    if sqlerrm is distinct from 'invalid_username' then raise; end if;
  end;
  -- А освобождённое имя занять можно
  if register_student('Гость','7777') is distinct from true then
    raise exception 'ОШИБКА: имя не освободилось';
  end if;
  perform delete_account('Гость','7777');
end $$;
\echo ok

\echo === 10. удаление во время рейтинговой игры — поражение
do $$
declare mid bigint; m matches;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  delete from students where username like 'Беглец%';
  perform register_student('Беглец','5555');
  insert into matches(p0, p1, wins_needed, range_min, range_max, ranked, ranked_mode,
                      status, secret)
  values ('Лев','Беглец', 3, 1, 100, true, 0, 'active', 50) returning id into mid;
  perform delete_account('Беглец','5555');
  select * into m from matches where id = mid;
  if m.status is distinct from 'finished' then raise exception 'ОШИБКА: матч завис'; end if;
  if m.forfeit_by is distinct from 1 then raise exception 'ОШИБКА: ушедший не отмечен'; end if;
  if (select elo from elo_ratings where username = 'Лев' and mode = 0) <= 1000 then
    raise exception 'ОШИБКА: оставшийся не получил рейтинг';
  end if;
end $$;
\echo ok

\echo === 11. чужим PIN аккаунт не удалить
do $$ begin
  begin
    perform delete_account('Лев','9999');
    raise exception 'ОШИБКА: удалили чужой аккаунт';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

\echo === 12. реванш повторяет условия и ждёт согласия
do $$
declare mid bigint; rid bigint; m matches; r matches;
begin
  delete from matches; delete from elo_ratings; delete from rivalry;
  insert into matches(p0, p1, wins_needed, range_min, range_max, frost, bonuses_on,
                      ranked, ranked_mode, status, secret, match_over)
  values ('Кира','Лев', 3, -100, 100, true, true, true, 3, 'finished', 0, true)
  returning id into mid;
  select * into m from matches where id = mid;

  rid := rematch('Лев','1234', mid);
  select * into r from matches where id = rid;
  if r.status is distinct from 'invited' then raise exception 'ОШИБКА: реванш начался без согласия'; end if;
  if r.p0 is distinct from 'Лев' or r.p1 is distinct from 'Кира' then
    raise exception 'ОШИБКА: реванш зовёт не того';
  end if;
  if (r.range_min, r.range_max, r.frost, r.bonuses_on, r.ranked, r.ranked_mode, r.wins_needed)
     is distinct from (m.range_min, m.range_max, m.frost, m.bonuses_on, m.ranked, m.ranked_mode, m.wins_needed) then
    raise exception 'ОШИБКА: условия реванша разъехались с исходной игрой';
  end if;

  -- Второй раз не создаётся, пока первый не отвечен
  begin
    perform rematch('Лев','1234', mid);
    raise exception 'ОШИБКА: создалось два реванша';
  exception when others then
    if sqlerrm is distinct from 'match_already_live' then raise; end if;
  end;

  if respond_challenge('Кира','4321', rid, true) is distinct from 'active' then
    raise exception 'ОШИБКА: реванш не принимается';
  end if;
end $$;
\echo ok

\echo === 13. реванш зовёт только участника и только законченной игры
do $$
declare mid bigint;
begin
  delete from matches;
  insert into matches(p0, p1, ranked, status, match_over)
  values ('Лев','Кира', false, 'active', false) returning id into mid;
  begin
    perform rematch('Лев','1234', mid);
    raise exception 'ОШИБКА: реванш посреди игры';
  exception when others then
    if sqlerrm is distinct from 'match_already_live' then raise; end if;
  end;
  update matches set status = 'finished', match_over = true where id = mid;
  begin
    perform rematch('Максим','1111', mid);
    raise exception 'ОШИБКА: позвал на реванш чужую игру';
  exception when others then
    if sqlerrm is distinct from 'not_your_match' then raise; end if;
  end;
end $$;
\echo ok

\echo === 14. удалённого на реванш не позвать
do $$
declare mid bigint; gone text;
begin
  delete from matches;
  delete from students where username like 'Ушедший%';
  perform register_student('Ушедший','5555');
  insert into matches(p0, p1, ranked, status, match_over)
  values ('Лев','Ушедший', false, 'finished', true) returning id into mid;
  gone := delete_account('Ушедший','5555');
  begin
    perform rematch('Лев','1234', mid);
    raise exception 'ОШИБКА: позвали удалённого';
  exception when others then
    if sqlerrm is distinct from 'no_such_student' then raise; end if;
  end;
end $$;
\echo ok

\echo === 15. anon не лезет в серии и не считает множитель сам
begin;
set local role anon;
do $$ begin
  if (select count(*) from rivalry) is distinct from 0 then
    raise exception 'ОШИБКА: anon читает серии';
  end if;
  begin
    perform elo_multiplier('Лев','Кира');
    raise exception 'ОШИБКА: anon зовёт служебную функцию';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
\echo ok

\echo === уборка
do $$ begin
  delete from matches; delete from ranked_queue;
  delete from elo_ratings; delete from rivalry;
  delete from students where username like '#%';
end $$;
\echo ok
