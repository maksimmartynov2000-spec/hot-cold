create extension if not exists pgcrypto;

create table if not exists students (
  username text primary key,
  username_lower text generated always as (lower(username)) stored,
  pin_hash text not null,
  best_run_score int not null default 0,
  best_run_rounds int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists students_username_lower_idx on students (username_lower);
alter table students enable row level security;
-- политик для прямого доступа НЕТ специально: ни читать, ни писать напрямую нельзя,
-- всё только через функции ниже

create or replace function register_student(p_username text, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if length(trim(p_username)) < 2 or length(trim(p_username)) > 20 then
    raise exception 'invalid_username';
  end if;
  if p_pin !~ '^[0-9]{4}$' then
    raise exception 'invalid_pin';
  end if;
  insert into students(username, pin_hash) values (trim(p_username), crypt(p_pin, gen_salt('bf')));
  return true;
exception when unique_violation then
  return false;
end;
$$;

create or replace function login_student(p_username text, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare h text;
begin
  select pin_hash into h from students where username_lower = lower(trim(p_username));
  if h is null then return false; end if;
  return h = crypt(p_pin, h);
end;
$$;

create or replace function submit_run_score(p_username text, p_pin text, p_score int, p_rounds int)
returns table(is_best boolean, best_score int)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare h text; cur_best int; uname text;
begin
  select username, pin_hash, best_run_score into uname, h, cur_best
  from students where username_lower = lower(trim(p_username));
  if h is null or h <> crypt(p_pin, h) then
    raise exception 'auth_failed';
  end if;
  if p_score > cur_best then
    update students set best_run_score = p_score, best_run_rounds = p_rounds where username = uname;
    return query select true, p_score;
  else
    return query select false, cur_best;
  end if;
end;
$$;

create or replace function run_leaderboard()
returns table(username text, best_run_score int, best_run_rounds int)
language sql
security definer
set search_path = public, pg_temp
as $$
  select username, best_run_score, best_run_rounds from students
  where best_run_score > 0
  order by best_run_score desc
  limit 10;
$$;

grant execute on function register_student(text, text) to anon;
grant execute on function login_student(text, text) to anon;
grant execute on function submit_run_score(text, text, int, int) to anon;
grant execute on function run_leaderboard() to anon;

alter table game_config add column if not exists run_config jsonb not null default
  '{"start_range":10,"growth":1.6,"buffer_start":6,"buffer_shrink":1}'::jsonb;
