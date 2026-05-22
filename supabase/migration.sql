-- ============================================================
-- Setlist — run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. Tables

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      varchar(30) unique,
  display_name  varchar(50),
  bio           text,
  created_at    timestamptz not null default now()
);

create table if not exists public.shows (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  artist     varchar(200) not null,
  venue      varchar(200) not null,
  city       varchar(100) not null,
  show_date  date not null,
  rating     smallint not null check (rating between 1 and 5),
  review     text,
  created_at timestamptz not null default now()
);

create index if not exists shows_user_id_idx on public.shows(user_id);
create index if not exists shows_created_at_idx on public.shows(created_at desc);

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);

-- 2. Row Level Security

alter table public.profiles enable row level security;
alter table public.shows    enable row level security;
alter table public.follows  enable row level security;

-- profiles
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- shows
create policy "shows_select" on public.shows for select using (true);
create policy "shows_insert" on public.shows for insert with check (auth.uid() = user_id);
create policy "shows_update" on public.shows for update using (auth.uid() = user_id);
create policy "shows_delete" on public.shows for delete using (auth.uid() = user_id);

-- follows
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on public.follows for delete using (auth.uid() = follower_id);

-- 3. Auto-create profile row when a new user signs up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
