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
  birthday text,
  updated_at timestamptz not null default now()
);

-- Safe upgrade for existing projects created before birthdays were synced.
alter table public.coworkers add column if not exists birthday text;

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

-- 4. Date-specific exceptions to normally weekly services (holiday closures or notices).
create table if not exists public.service_exceptions (
  id text primary key, -- e.g. 2026-12-27_sun_mandarin
  service_id text not null,
  date text not null,
  status text not null check (status in ('cancelled', 'notice')),
  note text,
  updated_at timestamptz not null default now()
);

-- 5. Short-lived opaque editor sessions. Only Edge Functions use this table.
create table if not exists public.admin_sessions (
  token_hash text primary key,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 6. Enable Row Level Security (RLS)
alter table public.services enable row level security;
alter table public.coworkers enable row level security;
alter table public.rosters enable row level security;
alter table public.service_exceptions enable row level security;
alter table public.admin_sessions enable row level security;

-- 7. Volunteers can read the schedule. Edge Functions use the service role for changes.
drop policy if exists "Allow anon all on services" on public.services;
drop policy if exists "Allow anon all on coworkers" on public.coworkers;
drop policy if exists "Allow anon all on rosters" on public.rosters;
drop policy if exists "Allow anon all on service_exceptions" on public.service_exceptions;
drop policy if exists "Allow anon read on services" on public.services;
drop policy if exists "Allow anon read on coworkers" on public.coworkers;
drop policy if exists "Allow anon read on rosters" on public.rosters;
drop policy if exists "Allow anon read on service_exceptions" on public.service_exceptions;

create policy "Allow anon read on services" on public.services for select using (true);
create policy "Allow anon read on coworkers" on public.coworkers for select using (true);
create policy "Allow anon read on rosters" on public.rosters for select using (true);
create policy "Allow anon read on service_exceptions" on public.service_exceptions for select using (true);

-- 8. Enable Realtime Replication
-- Existing projects may already have these tables in the publication.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'services'
  ) then
    execute 'alter publication supabase_realtime add table public.services';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'coworkers'
  ) then
    execute 'alter publication supabase_realtime add table public.coworkers';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rosters'
  ) then
    execute 'alter publication supabase_realtime add table public.rosters';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'service_exceptions'
  ) then
    execute 'alter publication supabase_realtime add table public.service_exceptions';
  end if;
end $$;
