\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- В одной транзакции: аккаунты откатываются в конце
begin;

\echo === 1. регистрация — только 6 цифр
do $$
begin
  delete from students where username in ('Шесть', 'Четыре');
  begin
    perform register_student('Четыре', '1234', null);
    raise exception 'ОШИБКА: зарегистрировали с PIN из 4 цифр';
  exception when others then if sqlerrm <> 'invalid_pin' then raise; end if;
  end;
  begin
    perform register_student('Четыре', '12345', null);
    raise exception 'ОШИБКА: зарегистрировали с PIN из 5 цифр';
  exception when others then if sqlerrm <> 'invalid_pin' then raise; end if;
  end;
  begin
    perform register_student('Четыре', '1234567', null);
    raise exception 'ОШИБКА: зарегистрировали с PIN из 7 цифр';
  exception when others then if sqlerrm <> 'invalid_pin' then raise; end if;
  end;
  if not register_student('Шесть', '123456', null) then raise exception 'ОШИБКА: 6 цифр не приняли'; end if;
  if check_student_pin('Шесть', '123456') is distinct from 'Шесть' then raise exception 'ОШИБКА: вход 6 цифрами'; end if;
  -- Двухаргументная версия регистрации ведёт через те же правила
  begin
    perform register_student('Четыре', '1234');
    raise exception 'ОШИБКА: обход через старую регистрацию';
  exception when others then if sqlerrm <> 'invalid_pin' then raise; end if;
  end;
end $$;
\echo ok

\echo === 2. старый аккаунт с 4 цифрами входит как раньше и может перейти на 6
do $$
begin
  if check_student_pin('Лев', '1234') is distinct from 'Лев' then raise exception 'ОШИБКА: старый PIN не пускает'; end if;
  perform change_pin('Лев', '1234', '654321', null);
  if check_student_pin('Лев', '654321') is distinct from 'Лев' then raise exception 'ОШИБКА: новый 6-значный не пускает'; end if;
  if check_student_pin('Лев', '1234') is not null then raise exception 'ОШИБКА: старый PIN остался'; end if;
end $$;
\echo ok

rollback;
