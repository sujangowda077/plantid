-- ═══════════════════════════════════════════════════════════════
-- Botanica v3 — Supabase Database Setup
-- Paste into: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── Drop old table if re-running ─────────────────────────────
-- (safe to remove this line in production)
-- drop table if exists public.plants;

-- ── 1. Create plants table ────────────────────────────────────
create table if not exists public.plants (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  plant_name    text        not null,
  scientific    text,
  family        text,
  confidence    float4      not null check (confidence >= 0 and confidence <= 1),
  image_url     text,                   -- base64 data URI or Supabase Storage URL
  alternatives  jsonb,                  -- [{name, scientific, confidence}]
  care_tips     jsonb,                  -- {water, sunlight, soil, humidity, notes}
  user_notes    text,
  is_favorite   boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- ── 2. Performance indexes ────────────────────────────────────
create index if not exists plants_user_id_idx
  on public.plants (user_id);

create index if not exists plants_user_recent_idx
  on public.plants (user_id, created_at desc);

create index if not exists plants_user_favorite_idx
  on public.plants (user_id, is_favorite)
  where is_favorite = true;

-- ── 3. Enable Row Level Security ──────────────────────────────
alter table public.plants enable row level security;

-- ── 4. RLS policies ──────────────────────────────────────────
-- Drop any old policies first (safe on fresh setup)
drop policy if exists "Users can manage their own plants" on public.plants;

-- Single policy covers SELECT, INSERT, UPDATE, DELETE
create policy "Users can manage their own plants"
  on public.plants
  for all
  using       (auth.uid() = user_id)
  with check  (auth.uid() = user_id);

-- ── 5. Permissions ───────────────────────────────────────────
grant usage  on schema public  to authenticated;
grant all    on public.plants  to authenticated;

-- ── 6. (Optional) Enable Realtime for live dashboard updates ──
-- Run this once:
-- alter publication supabase_realtime add table public.plants;

-- ── Verify ───────────────────────────────────────────────────
-- select column_name, data_type, is_nullable, column_default
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'plants'
-- order by ordinal_position;
