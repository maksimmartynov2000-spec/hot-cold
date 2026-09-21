\echo === пояса: база против клиента
create temp table js_tiers(span int, distance int, tier int);
\copy js_tiers from '/home/user/hot-cold/db/tiers_js.csv' with (format csv)

create temp table js_bounds(span int, idx int, lo int, hi int);
\copy js_bounds from '/home/user/hot-cold/db/bounds_js.csv' with (format csv)

do $$
declare n int; total int; example text;
begin
  select count(*) into total from js_tiers;
  if total < 19000 then
    raise exception 'таблица сравнения подозрительно мала: % строк', total;
  end if;

  select count(*) into n from js_tiers j where feedback_tier(j.span, j.distance) <> j.tier;
  if n > 0 then
    select 'диапазон ' || span || ', расстояние ' || distance || ': клиент ' || tier ||
           ', база ' || feedback_tier(span, distance)
      into example
    from js_tiers j where feedback_tier(j.span, j.distance) <> j.tier limit 1;
    raise exception 'пояса разошлись в % случаях (%)', n, example;
  end if;
  raise notice 'пояс совпал во всех % случаях', total;
end $$;

do $$
declare n int; total int;
begin
  select count(*) into total from js_bounds;
  select count(*) into n from js_bounds b
  where (tier_upper(b.span))[b.idx + 1] <> b.hi
     or (case when b.idx = 7 then 1 else (tier_upper(b.span))[b.idx + 2] + 1 end) <> b.lo;
  if n > 0 then
    raise exception 'границы поясов разошлись в % случаях из %', n, total;
  end if;
  raise notice 'границы совпали во всех % случаях', total;
end $$;
