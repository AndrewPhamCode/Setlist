-- Run this in Supabase SQL Editor (after migration.sql)

create table if not exists public.likes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  show_id    uuid not null references public.shows(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, show_id)
);

create index if not exists likes_show_id_idx on public.likes(show_id);

alter table public.likes enable row level security;

create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);
