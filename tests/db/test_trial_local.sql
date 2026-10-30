\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Итог Испытания из телефона (миграция 051). Откатывается в конце
begin;

\echo === 1. итог записан: runs, рекорд, задание дня, достижения
do $$
declare r jsonb; d date; n int;
begin
  update students set failed_logins = 0, locked_until = null, best_run_score = 0, best_run_rounds = 0 where username = 'Кира';
  delete from run_sessions where username = 'Кира';
  d := quest_ensure('Кира');
  delete from daily_quests where username = 'Кира' and day = d;
  insert into daily_quests(username, day, slot, code, goal) values ('Кира', d, 3, 'run_best3', 3);
  select count(*) into n from runs where username = 'Кира';
  r := run_report('Кира', '4321', 5, 2100);
  if (r->>'best')::int <> 2100 or (r->>'bestRounds')::int <> 5 then raise exception 'ОШИБКА: рекорд %', r; end if;
  if (select count(*) from runs where username = 'Кира') <> n + 1 then raise exception 'ОШИБКА: нет строки в runs'; end if;
  if (select progress from daily_quests where username = 'Кира' and day = d and slot = 3) <> 3 then
    raise exception 'ОШИБКА: задание не засчитано';
  end if;
  if not exists (select 1 from achievements where username = 'Кира' and code = 'run_5') then
    raise exception 'ОШИБКА: достижение «Испытание: 5» не открылось';
  end if;
  if (select status from run_sessions where username = 'Кира') <> 'finished' then raise exception 'ОШИБКА: строка не закрыта'; end if;
end $$;
\echo ok

\echo === 2. меньший счёт рекорд не трогает, частые итоги и чушь — отказ
do $$
declare r jsonb;
begin
  begin
    perform run_report('Кира', '4321', 1, 100);
    raise exception 'ОШИБКА: два итога за секунду';
  exception when others then if sqlerrm not like '%too_fast%' then raise; end if;
  end;
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  r := run_report('Кира', '4321', 1, 100);
  if (r->>'best')::int <> 2100 then raise exception 'ОШИБКА: рекорд уменьшился %', r; end if;
  update run_sessions set updated_at = now() - interval '10 seconds' where username = 'Кира';
  begin
    perform run_report('Кира', '4321', 2, 99999999);
    raise exception 'ОШИБКА: невозможный счёт принят';
  exception when others then if sqlerrm not like '%bad_result%' then raise; end if;
  end;
  begin
    perform run_report('Кира', '4321', -1, 0);
    raise exception 'ОШИБКА: отрицательные раунды';
  exception when others then if sqlerrm not like '%bad_result%' then raise; end if;
  end;
  begin
    perform run_report('Кира', '0000', 3, 100);
    raise exception 'ОШИБКА: без PIN';
  exception when others then if sqlerrm not like '%auth_failed%' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Кира';
end $$;
\echo ok

rollback;
