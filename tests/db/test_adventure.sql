\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

\echo === подготовка
do $$ begin update students set adventure = 0, avatar = null; end $$;
\echo ok

\echo === 1. прогресс пишется и не уменьшается
do $$ begin
  if adventure_save('Лев', '1234', 7) <> 7 then raise exception 'ОШИБКА: 7 не записалось'; end if;
  if adventure_save('Лев', '1234', 3) <> 7 then raise exception 'ОШИБКА: прогресс уменьшился'; end if;
  if adventure_save('Лев', '1234', 0) <> 7 then raise exception 'ОШИБКА: чтение вернуло не то'; end if;
  if adventure_save('Лев', '1234', 999) <> 50 then raise exception 'ОШИБКА: больше 50 не обрезано'; end if;
end $$;
\echo ok

\echo === 2. с чужим PIN не записать
do $$ begin
  begin
    perform adventure_save('Лев', '0000', 10);
    raise exception 'ОШИБКА: записалось без PIN';
  exception when sqlstate 'P0001' then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
end $$;
\echo ok

\echo === 3. иконка босса — только за пройденный мир
do $$ begin
  update students set adventure = 9 where username = 'Лев';
  begin
    perform set_avatar('Лев', '1234', '🧙');
    raise exception 'ОШИБКА: иконка босса без пройденного мира';
  exception when sqlstate 'P0001' then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  update students set adventure = 10 where username = 'Лев';
  if set_avatar('Лев', '1234', '🧙') is distinct from '🧙' then raise exception 'ОШИБКА: 🧙 не встал'; end if;
  begin
    perform set_avatar('Лев', '1234', '🦍');
    raise exception 'ОШИБКА: иконка второго мира открыта после первого';
  exception when sqlstate 'P0001' then if sqlerrm not like '%avatar_locked%' then raise; end if;
  end;
  update students set adventure = 50 where username = 'Лев';
  if set_avatar('Лев', '1234', '🛸') is distinct from '🛸' then raise exception 'ОШИБКА: 🛸 не встал'; end if;
end $$;
\echo ok

\echo === 4. иконки боссов в базе те же, что в игре
create temp table js_adv(icon text);
\copy js_adv from 'adventure_icons_js.csv' with (format csv, header true)
do $$
declare js text[];
begin
  select array_agg(icon) into js from js_adv;
  if js is distinct from adventure_icons() then raise exception 'ОШИБКА: разошлись: игра %, база %', js, adventure_icons(); end if;
end $$;
\echo ok

\echo === 5. anon пишет прогресс только через функцию
begin;
set local role anon;
do $$
declare n int := 0;
begin
  perform adventure_save('Лев', '1234', 12);
  -- RLS без правил: запрос либо запрещён, либо не находит ни одной строки
  begin
    update students set adventure = 50 where username = 'Кира';
    get diagnostics n = row_count;
  exception when insufficient_privilege then n := 0;
  end;
  if n > 0 then raise exception 'ОШИБКА: anon меняет прогресс напрямую'; end if;
end $$;
rollback;
\echo ok

do $$ begin update students set adventure = 0, avatar = null; end $$;
