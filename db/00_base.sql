-- Локальная копия того, что уже стоит в Supabase: нужна, чтобы новые миграции
-- проверялись на настоящем PostgreSQL, а не на глаз. В проде этот файл не нужен.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
end $$;

grant usage on schema public to anon;
alter default privileges in schema public grant all on tables to anon;

create table if not exists students (
  username text primary key,
  username_lower text generated always as (lower(username)) stored,
  pin_hash text not null,
  pin_hint text,
  failed_logins int not null default 0,
  locked_until timestamptz,
  best_run_score int not null default 0,
  best_run_rounds int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists students_username_lower_idx on students (username_lower);
alter table students enable row level security;

create table if not exists runs (
  id bigint generated always as identity primary key,
  username text not null,
  score int not null,
  rounds int not null,
  created_at timestamptz not null default now()
);
alter table runs enable row level security;

-- Настройки сложности «Игры на рейтинг» живут в базе: их можно менять без деплоя
create table if not exists game_config (
  id int primary key default 1,
  run_config jsonb not null default
    '{"start_range":10,"growth":2.2,"range_cap":2000,"buffer_start":5,
      "buffer_shrink":1,"squeeze_start":8,"min_attempts":3}'::jsonb
);
insert into game_config(id) values (1) on conflict do nothing;
alter table game_config enable row level security;

create or replace function check_student_pin(p_username text, p_pin text)
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare h text; uname text; locked timestamptz; fails int;
begin
  select username, pin_hash, locked_until, failed_logins
    into uname, h, locked, fails
  from students where username_lower = lower(trim(p_username));
  if h is null then return null; end if;
  if locked is not null and locked > now() then raise exception 'locked_out'; end if;
  if h = crypt(p_pin, h) then
    if fails <> 0 or locked is not null then
      update students set failed_logins = 0, locked_until = null where username = uname;
    end if;
    return uname;
  end if;
  update students
  set failed_logins = failed_logins + 1,
      locked_until = case when failed_logins + 1 >= 5 then now() + interval '5 minutes' else null end
  where username = uname;
  return null;
end;
$$;

create or replace function register_student(p_username text, p_pin text, p_hint text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if length(trim(p_username)) < 2 or length(trim(p_username)) > 20 then
    raise exception 'invalid_username';
  end if;
  if p_pin !~ '^[0-9]{4}$' then raise exception 'invalid_pin'; end if;
  insert into students(username, pin_hash, pin_hint)
  values (trim(p_username), crypt(p_pin, gen_salt('bf')), nullif(left(trim(coalesce(p_hint, '')), 60), ''));
  return true;
exception when unique_violation then
  return false;
end;
$$;
