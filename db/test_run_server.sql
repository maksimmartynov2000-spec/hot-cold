\echo === рейтинг: кривая сложности база против клиента
create temp table js_curve(n int, range int, allowed int, minatt int);
\copy js_curve from '/home/user/hot-cold/db/run_curve_js.csv' with (format csv)
create temp table js_min(range int, minatt int);
\copy js_min from '/home/user/hot-cold/db/min_attempts_js.csv' with (format csv)

do $$
declare n int; total int; ex text;
begin
  select count(*) into total from js_min;
  select count(*) into n from js_min m where min_attempts(m.range) <> m.minatt;
  if n > 0 then
    select 'диапазон ' || range || ': клиент ' || minatt || ', база ' || min_attempts(range)
      into ex from js_min m where min_attempts(m.range) <> m.minatt limit 1;
    raise exception 'minAttempts разошёлся в % случаях из % (%)', n, total, ex;
  end if;
  raise notice 'minAttempts совпал на всех % диапазонах', total;
end $$;

do $$
declare n int; ex text;
begin
  select count(*) into n from js_curve c where run_range_for_round(c.n) <> c.range;
  if n > 0 then
    select 'раунд ' || c.n || ': клиент ' || range || ', база ' || run_range_for_round(c.n)
      into ex from js_curve c where run_range_for_round(c.n) <> c.range limit 1;
    raise exception 'диапазон раунда разошёлся в % случаях (%)', n, ex;
  end if;

  select count(*) into n from js_curve c where run_attempts_for_round(c.n, c.range) <> c.allowed;
  if n > 0 then
    select 'раунд ' || c.n || ': клиент ' || allowed || ', база ' || run_attempts_for_round(c.n, c.range)
      into ex from js_curve c where run_attempts_for_round(c.n, c.range) <> c.allowed limit 1;
    raise exception 'число попыток разошлось в % случаях (%)', n, ex;
  end if;
  raise notice 'диапазоны и попытки совпали на всех 60 раундах';
end $$;

\echo === 1. забег начинается с первого раунда и десятки
do $$
declare st jsonb;
begin
  delete from run_sessions where username = 'Лев';
  st := run_start('Лев','1234',false,true);
  if (st ->> 'round')::int <> 1 then raise exception 'ОШИБКА: не первый раунд'; end if;
  if (st ->> 'score')::int <> 0 then raise exception 'ОШИБКА: очки не с нуля'; end if;
  if (st ->> 'rangeMin')::int <> 1 or (st ->> 'rangeMax')::int <> 10 then
    raise exception 'ОШИБКА: границы % … %', st ->> 'rangeMin', st ->> 'rangeMax';
  end if;
  if not (st ->> 'active')::boolean then raise exception 'ОШИБКА: забег не активен'; end if;
end $$;
\echo ok

\echo === 2. ЗАГАДАННОЕ ЧИСЛО НЕ ОТДАЁТСЯ
do $$
declare st jsonb; sec int;
begin
  select secret into sec from run_sessions where username = 'Лев';
  st := run_state('Лев','1234');
  if st ? 'secret' then raise exception 'УТЕЧКА: число в состоянии забега'; end if;
  update run_sessions set secret = 7 where username = 'Лев';
  st := run_state('Лев','1234');
  if st::text ~ '(^|[^0-9])7([^0-9]|$)' then
    raise exception 'УТЕЧКА: число встречается в ответе %', st::text;
  end if;
  update run_sessions set secret = sec where username = 'Лев';
end $$;
\echo ok

\echo === 3. промах возвращает пояс и не заканчивает раунд
do $$
declare r run_sessions; res jsonb;
begin
  select * into r from run_sessions where username = 'Лев';
  res := run_guess('Лев','1234', case when r.secret = 1 then 2 else 1 end);
  if (res ->> 'tier')::int = 8 then raise exception 'ОШИБКА: промах засчитан как попадание'; end if;
  if res ? 'roundWon' then raise exception 'ОШИБКА: раунд закрыт промахом'; end if;
  if (res -> 'state' ->> 'moves')::int <> 1 then raise exception 'ОШИБКА: ход не посчитан'; end if;
end $$;
\echo ok

\echo === 4. за границы диапазона не пускает
do $$ begin
  begin
    perform run_guess('Лев','1234',999);
    raise exception 'ОШИБКА: приняли число вне диапазона';
  exception when others then
    if sqlerrm <> 'out_of_range' then raise; end if;
  end;
end $$;
\echo ok

\echo === 5. угаданное число даёт очки по формуле и открывает следующий раунд
do $$
declare r run_sessions; res jsonb; want int;
begin
  select * into r from run_sessions where username = 'Лев';
  want := round(100.0 * r.round * (min_attempts(r.range_max - r.range_min + 1)::numeric / (r.moves + 1)));
  res := run_guess('Лев','1234', r.secret);
  if (res ->> 'tier')::int <> 8 then raise exception 'ОШИБКА: попадание не признано'; end if;
  if (res ->> 'points')::int <> want then
    raise exception 'ОШИБКА: очков % вместо %', res ->> 'points', want;
  end if;
  if (res -> 'state' ->> 'round')::int <> r.round + 1 then
    raise exception 'ОШИБКА: раунд не сменился';
  end if;
  if (res -> 'state' ->> 'score')::int <> want then raise exception 'ОШИБКА: очки не начислены'; end if;
  if (res -> 'state' ->> 'moves')::int <> 0 then raise exception 'ОШИБКА: ходы не обнулились'; end if;
end $$;
\echo ok

\echo === 6. кончились попытки — забег закрыт и записан
do $$
declare r run_sessions; res jsonb; i int; before int; after int; guard int := 0;
begin
  select count(*) into before from runs where username = 'Лев';
  select * into r from run_sessions where username = 'Лев';
  loop
    guard := guard + 1;
    if guard > 40 then raise exception 'ОШИБКА: забег не кончается'; end if;
    select * into r from run_sessions where username = 'Лев';
    exit when r.status <> 'active';
    res := run_guess('Лев','1234', case when r.secret = r.range_min then r.range_max else r.range_min end);
    exit when (res ->> 'over')::boolean;
  end loop;
  select count(*) into after from runs where username = 'Лев';
  if after <> before + 1 then raise exception 'ОШИБКА: забег не записан в историю'; end if;
  select * into r from run_sessions where username = 'Лев';
  if r.status <> 'finished' then raise exception 'ОШИБКА: забег остался активным'; end if;
end $$;
\echo ok

\echo === 7. после конца ходить нельзя
do $$ begin
  begin
    perform run_guess('Лев','1234',1);
    raise exception 'ОШИБКА: ход прошёл после конца забега';
  exception when others then
    if sqlerrm <> 'no_run' then raise; end if;
  end;
end $$;
\echo ok

\echo === 8. незаконченный забег продолжается, а не начинается заново
do $$
declare a jsonb; b jsonb;
begin
  a := run_start('Лев','1234',false,true);
  perform run_guess('Лев','1234', case when (select secret from run_sessions where username='Лев') = 1 then 2 else 1 end);
  b := run_start('Лев','1234',false,false);
  if (b ->> 'moves')::int <> 1 then raise exception 'ОШИБКА: продолжение потеряло ход'; end if;
  if (b ->> 'round')::int <> (a ->> 'round')::int then raise exception 'ОШИБКА: раунд сбросился'; end if;
end $$;
\echo ok

\echo === 9. рекорд обновляется только когда он выше прежнего
do $$
declare best_before int; best_after int;
begin
  update students set best_run_score = 100000 where username = 'Лев';
  perform run_give_up('Лев','1234');
  select best_run_score into best_after from students where username = 'Лев';
  if best_after <> 100000 then raise exception 'ОШИБКА: слабый забег перебил рекорд'; end if;

  update students set best_run_score = 0 where username = 'Лев';
  perform run_start('Лев','1234',false,true);
  update run_sessions set score = 4242, round = 5 where username = 'Лев';
  perform run_give_up('Лев','1234');
  select best_run_score into best_after from students where username = 'Лев';
  if best_after <> 4242 then raise exception 'ОШИБКА: рекорд не обновился — %', best_after; end if;
end $$;
\echo ok

\echo === 10. «мороз и жара» даёт симметричные границы
do $$
declare st jsonb;
begin
  st := run_start('Лев','1234',true,true);
  if (st ->> 'rangeMin')::int <> -5 or (st ->> 'rangeMax')::int <> 5 then
    raise exception 'ОШИБКА: границы % … %', st ->> 'rangeMin', st ->> 'rangeMax';
  end if;
end $$;
\echo ok

\echo === 11. чужой забег не тронуть
do $$ begin
  begin
    perform run_guess('Лев','9999',1);
    raise exception 'ОШИБКА: чужой PIN прошёл';
  exception when others then
    if sqlerrm <> 'auth_failed' then raise; end if;
  end;
end $$;
\echo ok

\echo === 12. напрямую к забегам anon не добирается
begin;
set local role anon;
do $$
declare n int;
begin
  begin
    select count(*) into n from run_sessions;
    if n > 0 then raise exception 'УТЕЧКА: anon видит % забегов напрямую', n; end if;
  exception when insufficient_privilege then null;
  end;
end $$;
commit;
\echo ok
