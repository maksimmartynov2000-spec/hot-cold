\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Удаление аккаунта и реванш с другом (из миграций 021–024; рейтинг и
-- таблица соперничества ушли в 062). Откатывается в конце
begin;

\echo === подготовка
do $$ begin
  -- Защита «не больше двадцати регистраций в час» здесь не проверяется
  update students set created_at = now() - interval '2 hours';
  update students set failed_logins = 0, locked_until = null;
end $$;
\echo ok

\echo === 1. удаление аккаунта: имя освобождается, игры остаются
do $$
declare mid bigint; gone text; n int;
begin
  delete from matches;
  delete from students where username = 'Гость';
  perform register_student('Гость','555555');
  insert into matches(p0, p1, wins_needed, range_min, range_max, status, secret, match_over)
  values ('Лев','Гость', 3, 1, 100, 'finished', 50, true) returning id into mid;
  perform wallet_add('Гость', 40, 2, 'test', 'test:gone');
  insert into runs(username, score, rounds) values ('Гость', 500, 4);
  perform send_friend_request('Гость','555555','Лев');

  gone := delete_account('Гость','555555');
  if gone not like '#%' then raise exception 'ОШИБКА: имя удалённого не помечено: %', gone; end if;

  if exists (select 1 from students where username = 'Гость') then
    raise exception 'ОШИБКА: старое имя осталось занято';
  end if;
  select count(*) into n from matches where id = mid and p1 = gone;
  if n is distinct from 1 then raise exception 'ОШИБКА: матч потерял игрока'; end if;
  if exists (select 1 from wallet where username in ('Гость', gone)) or exists (select 1 from wallet_log where username in ('Гость', gone)) then
    raise exception 'ОШИБКА: кошелёк не стёрт';
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

\echo === 2. под удалённым именем не войти и не зарегистрироваться
do $$
declare gone text := current_setting('t.gone');
begin
  if check_student_pin(gone, '555555') is not null then
    raise exception 'ОШИБКА: старый PIN всё ещё подходит';
  end if;
  begin
    perform register_student(gone, '123456');
    raise exception 'ОШИБКА: зарегистрировались под именем удалённого';
  exception when others then
    if sqlerrm is distinct from 'invalid_username' then raise; end if;
  end;
  -- А освобождённое имя занять можно
  if register_student('Гость','777777') is distinct from true then
    raise exception 'ОШИБКА: имя не освободилось';
  end if;
  perform delete_account('Гость','777777');
end $$;
\echo ok

\echo === 3. удаление во время партии с другом — партия кончается без результата
do $$
declare mid bigint; m matches;
begin
  delete from matches;
  delete from students where username like 'Беглец%';
  perform register_student('Беглец','555555');
  insert into matches(p0, p1, wins_needed, range_min, range_max, status, secret)
  values ('Лев','Беглец', 3, 1, 100, 'active', 50) returning id into mid;
  perform delete_account('Беглец','555555');
  select * into m from matches where id = mid;
  if m.status is distinct from 'finished' or not m.match_over then raise exception 'ОШИБКА: матч завис'; end if;
  if match_winner(m) is not null then raise exception 'ОШИБКА: у брошенной партии есть победитель'; end if;
end $$;
\echo ok

\echo === 4. чужим PIN аккаунт не удалить
do $$ begin
  begin
    perform delete_account('Лев','9999');
    raise exception 'ОШИБКА: удалили чужой аккаунт';
  exception when others then
    if sqlerrm is distinct from 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

\echo === 5. реванш повторяет условия и ждёт согласия
do $$
declare mid bigint; rid bigint; m matches; r matches;
begin
  delete from matches;
  insert into matches(p0, p1, wins_needed, range_min, range_max, frost, bonuses_on,
                      status, secret, match_over)
  values ('Кира','Лев', 3, -100, 100, true, true, 'finished', 0, true)
  returning id into mid;
  select * into m from matches where id = mid;

  rid := rematch('Лев','1234', mid);
  select * into r from matches where id = rid;
  if r.status is distinct from 'invited' then raise exception 'ОШИБКА: реванш начался без согласия'; end if;
  if r.p0 is distinct from 'Лев' or r.p1 is distinct from 'Кира' then
    raise exception 'ОШИБКА: реванш зовёт не того';
  end if;
  if (r.range_min, r.range_max, r.frost, r.bonuses_on, r.wins_needed)
     is distinct from (m.range_min, m.range_max, m.frost, m.bonuses_on, m.wins_needed) or r.ranked then
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

\echo === 6. реванш зовёт только участника и только законченной игры
do $$
declare mid bigint;
begin
  delete from matches;
  insert into matches(p0, p1, status, match_over)
  values ('Лев','Кира', 'active', false) returning id into mid;
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

\echo === 7. удалённого на реванш не позвать
do $$
declare mid bigint; gone text;
begin
  delete from matches;
  delete from students where username like 'Ушедший%';
  perform register_student('Ушедший','555555');
  insert into matches(p0, p1, ranked, status, match_over)
  values ('Лев','Ушедший', false, 'finished', true) returning id into mid;
  gone := delete_account('Ушедший','555555');
  begin
    perform rematch('Лев','1234', mid);
    raise exception 'ОШИБКА: позвали удалённого';
  exception when others then
    if sqlerrm is distinct from 'no_such_student' then raise; end if;
  end;
end $$;
\echo ok

rollback;
