\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === 1. радиус сигнала «рядом» совпадает в браузере и в базе
create temp table js_radius(span int, radius int);
\copy js_radius from '/home/user/hot-cold/db/near_radius_js.csv' with (format csv, header true)
do $$
declare bad record; n int;
begin
  select count(*) into n from js_radius;
  if n < 4000 then raise exception 'ОШИБКА: таблица из клиента пуста (% строк)', n; end if;
  select * into bad from js_radius j
  where j.radius is distinct from bonus_near_radius(j.span) limit 1;
  if bad.span is not null then
    raise exception 'ОШИБКА: на диапазоне % клиент даёт радиус %, база — %',
      bad.span, bad.radius, bonus_near_radius(bad.span);
  end if;
  raise notice 'радиус совпал на всех % диапазонах', n;
end $$;
\echo ok

\echo === 2. на всех диапазонах игры сигнал накрывает не больше трети прямой
do $$
declare n int; k int; r int; share numeric; bad text := '';
begin
  -- Обычные 1…N и «мороз» −N…N для всех пресетов
  foreach n in array array[10, 20, 100, 200, 1000, 2000, 21, 41, 201, 401, 2001, 4001] loop
    k := auto_bonus_count(n);
    r := bonus_near_radius(n);
    share := 2.0 * r * k / n;
    -- На десятке меньше одной клетки радиус не бывает, и это законные 20 %
    if share > 0.34 then bad := bad || n || ': ' || round(share * 100) || '%; '; end if;
  end loop;
  if bad <> '' then raise exception 'ОШИБКА: сигнал накрывает слишком много — %', bad; end if;
end $$;
\echo ok

\echo === 3. на тесных диапазонах сигнал сузился, на широких не изменился
do $$ begin
  if bonus_near_radius(21) <> 1 then
    raise exception 'ОШИБКА: на −10…10 радиус %, а должен стать 1', bonus_near_radius(21);
  end if;
  if bonus_near_radius(100) <> 2 then
    raise exception 'ОШИБКА: на 1–100 радиус %, а должен стать 2', bonus_near_radius(100);
  end if;
  if bonus_near_radius(1000) <> 5 or bonus_near_radius(2000) <> 5 or bonus_near_radius(4001) <> 5 then
    raise exception 'ОШИБКА: на широких полях радиус сдвинулся';
  end if;
  if bonus_near_radius(10) <> 1 or bonus_near_radius(200) <> 3 then
    raise exception 'ОШИБКА: на 1–10 или 1–200 радиус сдвинулся';
  end if;
end $$;
\echo ok
