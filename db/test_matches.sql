\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка: Лев и Кира друзья, Максим сам по себе
-- Файл не должен зависеть от того, что оставил после себя предыдущий:
-- дружба или уже есть, или доводится до конца здесь
do $$ begin
  if friend_status('Лев','Кира') is distinct from 'friend' then
    perform send_friend_request('Лев','1234','Кира');
    if friend_status('Лев','Кира') is distinct from 'friend' then
      perform respond_friend_request('Кира','4321','Лев',true);
    end if;
  end if;
  if friend_status('Лев','Максим') = 'friend' then
    perform remove_friend('Лев','1234','Максим');
  end if;
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
end $$;
\echo ok

\echo === 1. вызвать можно только друга
do $$ begin
  begin
    perform challenge_friend('Лев','1234','Максим',100,false,3);
    raise exception 'ОШИБКА: вызвал не друга';
  exception when others then
    if sqlerrm is distinct from 'not_a_friend' then raise; end if;
  end;
end $$;
\echo ok

\echo === 2. вызов создаётся и виден обоим
do $$
declare mid bigint; n int;
begin
  mid := challenge_friend('Лев','1234','Кира',100,false,3);
  perform set_config('t.m', mid::text, false);
  select count(*) into n from list_matches('Лев','1234') where id = mid and status = 'invited' and other = 'Кира';
  if n is distinct from 1 then raise exception 'ОШИБКА: у пригласившего вызова нет'; end if;
  select count(*) into n from list_matches('Кира','4321') where id = mid and status = 'invited' and other = 'Лев';
  if n is distinct from 1 then raise exception 'ОШИБКА: у приглашённого вызова нет'; end if;
end $$;
\echo ok

\echo === 3. второй вызов той же паре не создаётся
do $$ begin
  begin
    perform challenge_friend('Лев','1234','Кира',100,false,3);
    raise exception 'ОШИБКА: создался второй матч';
  exception when others then
    if sqlerrm is distinct from 'match_already_live' then raise; end if;
  end;
end $$;
\echo ok

\echo === 4. принять вызов может только приглашённый
do $$
declare mid bigint := current_setting('t.m')::bigint;
begin
  begin
    perform respond_challenge('Лев','1234',mid,true);
    raise exception 'ОШИБКА: пригласивший принял свой же вызов';
  exception when others then
    if sqlerrm is distinct from 'not_your_invite' then raise; end if;
  end;
end $$;
\echo ok

\echo === 5. до начала матча ходить нельзя
do $$
declare mid bigint := current_setting('t.m')::bigint;
begin
  begin
    perform match_guess('Кира','4321',mid,50);
    raise exception 'ОШИБКА: ход прошёл до принятия вызова';
  exception when others then
    if sqlerrm is distinct from 'not_playing' then raise; end if;
  end;
end $$;
\echo ok

\echo === 6. принятие запускает раунд
select 'статус: ' || respond_challenge('Кира','4321',current_setting('t.m')::bigint,true);
select 'число загадано: ' || (secret is not null)::text from matches where id = current_setting('t.m')::bigint;

\echo === 7. ЧИСЛО НЕ ОТДАЁТСЯ НИ ОДНОЙ ИЗ СТОРОН
do $$
declare mid bigint := current_setting('t.m')::bigint; a jsonb; b jsonb; sec int;
begin
  select secret into sec from matches where id = mid;
  if sec is null then raise exception 'ОШИБКА: число не загадано, проверять нечего'; end if;
  a := match_state('Лев','1234',mid);
  b := match_state('Кира','4321',mid);
  if a ->> 'secret' is not null then raise exception 'УТЕЧКА: число видно пригласившему — %', a ->> 'secret'; end if;
  if b ->> 'secret' is not null then raise exception 'УТЕЧКА: число видно приглашённому — %', b ->> 'secret'; end if;

  -- Числа не должно быть в ответе и под любым другим именем. Загадываем такое,
  -- которое не может совпасть ни с номером матча, ни с границами, ни с жетонами:
  -- иначе проверка падала бы на законной единице в tokens
  update matches set secret = 73 where id = mid and id <> 73;
  a := match_state('Лев','1234',mid);
  if a::text ~ '(^|[^0-9])73([^0-9]|$)' then
    raise exception 'УТЕЧКА: загаданное число встречается в ответе %', a::text;
  end if;
end $$;

\echo === 8. чужой в матч не заглядывает
do $$
declare mid bigint := current_setting('t.m')::bigint;
begin
  begin
    perform match_state('Максим','1111',mid);
    raise exception 'ОШИБКА: посторонний прочитал матч';
  exception when others then
    if sqlerrm is distinct from 'not_your_match' then raise; end if;
  end;
end $$;
\echo ok

\echo === 9. ходит только тот, чья очередь
do $$
declare mid bigint := current_setting('t.m')::bigint; st jsonb;
begin
  st := match_state('Лев','1234',mid);
  if (st ->> 'cur')::int is distinct from 0 then raise exception 'ОШИБКА: первым ходит не тот'; end if;
  begin
    perform match_guess('Кира','4321',mid,50);
    raise exception 'ОШИБКА: сходил не в свою очередь';
  exception when others then
    if sqlerrm is distinct from 'not_your_turn' then raise; end if;
  end;
end $$;
\echo ok

\echo === 10. ход возвращает только пояс, и очередь переходит
do $$
declare mid bigint := current_setting('t.m')::bigint; band int; st jsonb; sec int;
begin
  select secret into sec from matches where id = mid;
  band := match_guess('Лев','1234',mid, case when sec = 1 then 2 else 1 end);
  if band is null or band < 0 or band > 8 then raise exception 'ОШИБКА: странный пояс %', band; end if;
  st := match_state('Кира','4321',mid);
  if (st ->> 'cur')::int is distinct from 1 then raise exception 'ОШИБКА: очередь не перешла'; end if;
  if (st -> 'moves' -> 0 ->> 'guess') is null then raise exception 'ОШИБКА: ход не записан'; end if;
  if (st -> 'moves' -> 0) ? 'distance' then raise exception 'ОШИБКА: расстояние утекло в ход'; end if;
end $$;
\echo ok (в ходе есть догадка и пояс, расстояния нет)

\echo === 11. за границы диапазона не пускает
do $$
declare mid bigint := current_setting('t.m')::bigint;
begin
  begin
    perform match_guess('Кира','4321',mid,101);
    raise exception 'ОШИБКА: приняли число вне диапазона';
  exception when others then
    if sqlerrm is distinct from 'out_of_range' then raise; end if;
  end;
end $$;
\echo ok

\echo === 12. жетон двойного хода
do $$
declare mid bigint := current_setting('t.m')::bigint; st jsonb;
begin
  perform use_match_token('Кира','4321',mid,true);
  st := match_state('Кира','4321',mid);
  if not (st ->> 'armed')::boolean then raise exception 'ОШИБКА: жетон не взвёлся'; end if;
  if (st -> 'tokens' ->> 1)::int is distinct from 0 then raise exception 'ОШИБКА: жетон не списался'; end if;
end $$;
\echo ok

\echo === 13. со взведённым жетоном ход остаётся за игроком
do $$
declare mid bigint := current_setting('t.m')::bigint; sec int; st jsonb;
begin
  select secret into sec from matches where id = mid;
  perform match_guess('Кира','4321',mid, case when sec = 100 then 99 else 100 end);
  st := match_state('Кира','4321',mid);
  if (st ->> 'cur')::int is distinct from 1 then raise exception 'ОШИБКА: ход ушёл, хотя жетон был'; end if;
  if (st ->> 'armed')::boolean then raise exception 'ОШИБКА: жетон не потратился'; end if;
end $$;
\echo ok

\echo === 14. угаданное число заканчивает раунд и открывает ответ
do $$
declare mid bigint := current_setting('t.m')::bigint; sec int; st jsonb;
begin
  select secret into sec from matches where id = mid;
  perform match_guess('Кира','4321',mid, sec);
  st := match_state('Лев','1234',mid);
  if not (st ->> 'roundOver')::boolean then raise exception 'ОШИБКА: раунд не закончился'; end if;
  if (st ->> 'roundWinner')::int is distinct from 1 then raise exception 'ОШИБКА: победитель не тот'; end if;
  if (st -> 'wins' ->> 1)::int is distinct from 1 then raise exception 'ОШИБКА: победа не засчитана'; end if;
  if (st ->> 'secret')::int is distinct from sec then raise exception 'ОШИБКА: ответ не показан после раунда'; end if;
end $$;
\echo ok

\echo === 15. после конца раунда ходить нельзя
do $$
declare mid bigint := current_setting('t.m')::bigint;
begin
  begin
    perform match_guess('Лев','1234',mid,50);
    raise exception 'ОШИБКА: сходили после конца раунда';
  exception when others then
    if sqlerrm is distinct from 'round_over' then raise; end if;
  end;
end $$;
\echo ok

\echo === 16. новый раунд: другое число, другой начинающий, жетоны вернулись
do $$
declare mid bigint := current_setting('t.m')::bigint; st jsonb;
begin
  perform next_match_round('Лев','1234',mid);
  st := match_state('Лев','1234',mid);
  if (st ->> 'round')::int is distinct from 2 then raise exception 'ОШИБКА: раунд не сменился'; end if;
  if (st ->> 'cur')::int is distinct from 1 then raise exception 'ОШИБКА: начинает не второй игрок'; end if;
  if (st ->> 'roundOver')::boolean then raise exception 'ОШИБКА: раунд сразу закрыт'; end if;
  if (st -> 'tokens' ->> 0)::int is distinct from 1 or (st -> 'tokens' ->> 1)::int <> 1 then
    raise exception 'ОШИБКА: жетоны не вернулись';
  end if;
  if st ->> 'secret' is not null then raise exception 'ОШИБКА: ответ виден в новом раунде'; end if;
  if jsonb_array_length(st -> 'moves') is distinct from 0 then raise exception 'ОШИБКА: ходы прошлого раунда не убрались'; end if;
end $$;
\echo ok

\echo === 17. матч заканчивается на нужном числе побед
do $$
declare mid bigint := current_setting('t.m')::bigint; sec int; st jsonb; guard int := 0;
begin
  loop
    st := match_state('Лев','1234',mid);
    exit when (st ->> 'matchOver')::boolean;
    guard := guard + 1;
    if guard > 20 then raise exception 'ОШИБКА: матч не кончается'; end if;
    if (st ->> 'roundOver')::boolean then
      perform next_match_round('Лев','1234',mid);
    else
      select secret into sec from matches where id = mid;
      if (st ->> 'cur')::int = 0
        then perform match_guess('Лев','1234',mid,sec);
        else perform match_guess('Кира','4321',mid,sec);
      end if;
    end if;
  end loop;
  st := match_state('Лев','1234',mid);
  if (st ->> 'status') is distinct from 'finished' then raise exception 'ОШИБКА: статус не finished'; end if;
  if greatest((st -> 'wins' ->> 0)::int, (st -> 'wins' ->> 1)::int) is distinct from 3 then
    raise exception 'ОШИБКА: побед не три';
  end if;
end $$;
\echo ok

\echo === 18. законченный матч пропадает из списка
do $$
declare n int;
begin
  select count(*) into n from list_matches('Лев','1234');
  if n is distinct from 0 then raise exception 'ОШИБКА: доигранный матч остался в списке (% шт.)', n; end if;
end $$;
\echo ok

\echo === 19. брошенный вызов протухает
do $$
declare mid bigint; n int; st text;
begin
  mid := challenge_friend('Лев','1234','Кира',10,true,1);
  update matches set updated_at = now() - interval '2 hours' where id = mid;
  select count(*) into n from list_matches('Лев','1234');
  if n is distinct from 0 then raise exception 'ОШИБКА: протухший вызов остался в списке (% шт.)', n; end if;
  select status into st from matches where id = mid;
  if st is distinct from 'expired' then raise exception 'ОШИБКА: статус % вместо expired', st; end if;
end $$;
\echo ok

\echo === 20. «мороз и жара» даёт симметричные границы
do $$
declare mid bigint; lo int; hi int;
begin
  mid := challenge_friend('Лев','1234','Кира',100,true,1);
  select range_min, range_max into lo, hi from matches where id = mid;
  if lo is distinct from -50 or hi <> 50 then raise exception 'ОШИБКА: границы %…% вместо -50…50', lo, hi; end if;
  delete from matches where id = mid;
end $$;
\echo ok

\echo === 21. напрямую к таблицам anon не добирается
begin;
set local role anon;
do $$
declare n int;
begin
  begin
    select count(*) into n from matches;
    if n > 0 then raise exception 'ОШИБКА: anon видит % матчей напрямую', n; end if;
  exception when insufficient_privilege then null;
  end;
  begin
    select count(*) into n from match_moves;
    if n > 0 then raise exception 'ОШИБКА: anon видит ходы напрямую'; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
commit;
\echo ok

\echo === 22. новые диапазоны принимаются, чужие — нет
do $$
declare mid bigint; n int; r int;
begin
  foreach r in array array[10, 20, 100, 200, 1000, 2000] loop
    delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
    mid := challenge_friend('Лев','1234','Кира', r, false, 1, false, null);
    select count(*) into n from matches where id = mid and range_max = r;
    if n is distinct from 1 then raise exception 'ОШИБКА: диапазон % не принят', r; end if;
  end loop;
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
  begin
    perform challenge_friend('Лев','1234','Кира', 500, false, 1, false, null);
    raise exception 'ОШИБКА: принят диапазон, которого нет в игре';
  exception when others then
    if sqlerrm is distinct from 'bad_range' then raise; end if;
  end;
end $$;
\echo ok

\echo === 23. мороз на новых диапазонах даёт ровные границы
do $$
declare mid bigint; lo int; hi int; r int; want int;
begin
  foreach r in array array[20, 200, 2000] loop
    delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
    mid := challenge_friend('Лев','1234','Кира', r, true, 1, false, null);
    select range_min, range_max into lo, hi from matches where id = mid;
    want := r / 2;
    if lo is distinct from -want or hi is distinct from want then
      raise exception 'ОШИБКА: для % границы %…% вместо -%…%', r, lo, hi, want, want;
    end if;
  end loop;
  delete from matches where (p0, p1) in (('Лев','Кира'), ('Кира','Лев'));
end $$;
\echo ok
