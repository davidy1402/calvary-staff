-- CCCJB Connect / Calvary Staff - Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Services Table
create table if not exists public.services (
  id text primary key,
  name text not null,
  short_name text not null,
  weekday integer not null,
  time text not null,
  rehearsal_time text not null,
  venue text not null,
  category_ids jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Coworkers Table
create table if not exists public.coworkers (
  id text primary key,
  name text not null,
  english_name text,
  phone text,
  cell_group text not null default '同工',
  qualified_role_ids jsonb not null default '[]'::jsonb,
  notes text,
  active boolean not null default true,
  avatar text,
  updated_at timestamptz not null default now()
);

-- 3. Rosters Table
create table if not exists public.rosters (
  id text primary key, -- e.g. 2026-10-04_sun_mandarin
  service_id text not null,
  date text not null,
  assignments jsonb not null default '{}'::jsonb,
  songs jsonb,
  duty_notes jsonb,
  special_events jsonb,
  theme text,
  speaker text,
  notes text,
  updated_at timestamptz not null default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.services enable row level security;
alter table public.coworkers enable row level security;
alter table public.rosters enable row level security;

-- 5. Policies for Volunteer App (Anon access)
create policy "Allow anon all on services" on public.services
  for all using (true) with check (true);

create policy "Allow anon all on coworkers" on public.coworkers
  for all using (true) with check (true);

create policy "Allow anon all on rosters" on public.rosters
  for all using (true) with check (true);

-- 6. Enable Realtime Replication
begin;
  -- Drop publication if exists or alter
  alter publication supabase_realtime add table public.services;
  alter publication supabase_realtime add table public.coworkers;
  alter publication supabase_realtime add table public.rosters;
commit;
