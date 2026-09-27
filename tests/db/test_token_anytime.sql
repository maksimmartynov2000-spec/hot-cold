\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

begin;

\echo === 1. жетон взводится первым ходом раунда и даёт два хода подряд
do $$
declare mid bigint; m matches; sec int;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 3) returning id into mid;
  perform start_match_round(mid);
  select secret into sec from matches where id = mid;
  if exists (select 1 from match_moves where match_id = mid) then raise exception 'ОШИБКА: подготовка'; end if;
  if use_match_token('Лев', '1234', mid, true) is distinct from true then
    raise exception 'ОШИБКА: жетон не взвёлся первым ходом';
  end if;
  select * into m from matches where id = mid;
  if not m.armed or m.tokens[1] <> 0 then raise exception 'ОШИБКА: взвод %/%', m.armed, m.tokens; end if;
  perform match_guess('Лев', '1234', mid, case when sec = 1 then 2 else 1 end);
  select * into m from matches where id = mid;
  if m.cur <> 0 or m.armed then raise exception 'ОШИБКА: после первого хода ход ушёл или жетон остался'; end if;
  perform match_guess('Лев', '1234', mid, case when sec = 100 then 99 else 100 end);
  select * into m from matches where id = mid;
  if m.cur <> 1 then raise exception 'ОШИБКА: второй ход не отдал очередь'; end if;
end $$;
\echo ok

\echo === 2. передумал — жетон возвращается, чужим ходом не взвести
do $$
declare mid bigint; m matches;
begin
  insert into matches(p0, p1, status, range_min, range_max, wins_needed)
  values ('Лев', 'Кира', 'active', 1, 100, 3) returning id into mid;
  perform start_match_round(mid);
  perform use_match_token('Лев', '1234', mid, true);
  perform use_match_token('Лев', '1234', mid, false);
  select * into m from matches where id = mid;
  if m.armed or m.tokens[1] <> 1 then raise exception 'ОШИБКА: отмена %/%', m.armed, m.tokens; end if;
  begin
    perform use_match_token('Кира', '4321', mid, true);
    raise exception 'ОШИБКА: жетон взведён не в свой ход';
  exception when others then if sqlerrm not like '%not_your_turn%' then raise; end if;
  end;
end $$;
\echo ok

rollback;
