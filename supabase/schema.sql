create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  selected_team_id uuid,
  onboarding_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age_group text,
  game_format text not null default '11v11' check (game_format in ('7v7', '9v9', '11v11')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  team_name text,
  game_format text not null default '11v11' check (game_format in ('7v7', '9v9', '11v11')),
  status text not null default 'in_progress' check (status in ('in_progress', 'final', 'archived')),
  started_at timestamptz,
  finalized_at timestamptz,
  elapsed_ms integer not null default 0,
  score_us integer not null default 0,
  score_them integer not null default 0,
  observation_count integer not null default 0,
  goal_count integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teams_user_id_idx on public.teams(user_id);
create index if not exists players_team_id_idx on public.players(team_id);
create index if not exists games_user_id_idx on public.games(user_id);
create index if not exists games_team_id_idx on public.games(team_id);
create index if not exists games_updated_at_idx on public.games(updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists set_players_updated_at on public.players;
create trigger set_players_updated_at
before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists set_games_updated_at on public.games;
create trigger set_games_updated_at
before update on public.games
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check ((select auth.uid()) = id);

drop policy if exists "Users can manage own teams" on public.teams;
create policy "Users can manage own teams"
on public.teams for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can manage players for own teams" on public.players;
create policy "Users can manage players for own teams"
on public.players for all
using (
  exists (
    select 1 from public.teams
    where teams.id = players.team_id
      and teams.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.teams
    where teams.id = players.team_id
      and teams.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can manage own games" on public.games;
create policy "Users can manage own games"
on public.games for all
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    team_id is null
    or exists (
      select 1 from public.teams
      where teams.id = games.team_id
        and teams.user_id = (select auth.uid())
    )
  )
);
