\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: отметки и иконки откатываются в конце
begin;

\echo === подготовка
do $$ begin
  update students set failed_logins = 0, locked_until = null, avatar = null, tutorial_done = false;
end $$;
\echo ok

\echo === 1. иконка 🎓 — только тому, кто прошёл обучение
do $$
begin
  if (my_profile('Кира','4321')->>'tutorialDone')::boolean then raise exception 'ОШИБКА: обучение пройдено с самого начала'; end if;
  begin
    perform set_avatar('Кира','4321','🎓');
    raise exception 'ОШИБКА: иконка без обучения';
  exception when others then if sqlerrm <> 'avatar_locked' then raise; end if;
  end;
  perform tutorial_finished('Кира','4321');
  if not (my_profile('Кира','4321')->>'tutorialDone')::boolean then raise exception 'ОШИБКА: отметка не сохранилась'; end if;
  if set_avatar('Кира','4321','🎓') <> '🎓' then raise exception 'ОШИБКА: иконка не ставится'; end if;
  -- Обычные иконки и награды лиг работают как раньше
  if set_avatar('Кира','4321', (avatar_choices())[1]) <> (avatar_choices())[1] then raise exception 'ОШИБКА: обычная иконка'; end if;
  begin
    perform set_avatar('Кира','4321','🦖');
    raise exception 'ОШИБКА: награда лиги без лиги';
  exception when others then if sqlerrm <> 'avatar_locked' then raise; end if;
  end;
  begin
    perform tutorial_finished('Кира','0000');
    raise exception 'ОШИБКА: отметка без PIN';
  exception when others then if sqlerrm <> 'auth_failed' then raise; end if;
  end;
  update students set failed_logins = 0, locked_until = null where username = 'Кира';
end $$;
\echo ok

\echo === 2. права
set local role anon;
do $$
begin
  if not has_function_privilege('anon', 'tutorial_finished(text,text)', 'execute') then
    raise exception 'ОШИБКА: игра не может отметить обучение';
  end if;
end $$;
reset role;
\echo ok

rollback;
