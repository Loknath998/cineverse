-- CineVerse — Supabase schema
--
-- Run this once in your Supabase project's SQL editor (Project → SQL Editor
-- → New query → paste → Run). It creates a single table that stores each
-- signed-in user's CineVerse data (watchlist, watched, favourites, ratings,
-- notes, activity log and profile) as one JSON document per user, protected
-- by row-level security so a user can only ever read or write their own row.
--
-- This mirrors the shape the app already keeps in localStorage (see
-- src/lib/library.tsx), so the client just loads/saves one JSON blob rather
-- than juggling several relational tables — simple, and easy to reason
-- about for a personal-data use case like this.

create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.user_data is
  'One row per user: their CineVerse watchlist/watched/favourites/ratings/notes/activity/profile as a single JSON document.';

alter table public.user_data enable row level security;

drop policy if exists "Users can view their own data" on public.user_data;
create policy "Users can view their own data"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own data" on public.user_data;
create policy "Users can insert their own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own data" on public.user_data;
create policy "Users can update their own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own data" on public.user_data;
create policy "Users can delete their own data"
  on public.user_data for delete
  using (auth.uid() = user_id);
