-- ============================================================================
-- CloudVault — Profiles Table
-- ============================================================================
-- Application-level user data. One row per auth.users entry.
--
-- Supabase's auth.users stores authentication credentials;
-- this table stores everything else: display name, avatar, storage quotas.
--
-- The id column is a foreign key to auth.users(id) — it is NOT auto-generated.
-- Rows are created automatically by the trigger in 03_triggers.sql.
-- ============================================================================

create table if not exists public.profiles (
  -- Primary key — matches auth.users.id exactly
  id          uuid        primary key references auth.users(id) on delete cascade,

  -- Display name (optional, set by the user)
  full_name   text        default null,

  -- Avatar URL (optional — could point to Supabase Storage or an external URL)
  avatar_url  text        default null,

  -- ── Storage quotas ──────────────────────────────────────────────────────
  -- storage_used:  running counter in bytes, updated by the backend on
  --               every upload / delete via file.service._updateStorageUsed()
  -- storage_limit: per-user quota in bytes (default 100 MB)
  storage_used   bigint   not null default 0,
  storage_limit  bigint   not null default 104857600,   -- 100 * 1024 * 1024

  -- ── Timestamps ──────────────────────────────────────────────────────────
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- ── Constraints ─────────────────────────────────────────────────────────
  constraint profiles_storage_used_non_negative  check (storage_used  >= 0),
  constraint profiles_storage_limit_positive     check (storage_limit >  0)
);

-- Index on updated_at for efficient "recently active" queries
create index if not exists idx_profiles_updated_at
  on public.profiles (updated_at desc);

-- ── Column comments ──────────────────────────────────────────────────────
comment on table  public.profiles                  is 'Application-level user profiles, one per auth.users row.';
comment on column public.profiles.id               is 'FK → auth.users(id). Set by the on-signup trigger.';
comment on column public.profiles.full_name        is 'User-chosen display name.';
comment on column public.profiles.avatar_url       is 'URL to the user''s avatar image.';
comment on column public.profiles.storage_used     is 'Running total of storage consumed (bytes).';
comment on column public.profiles.storage_limit    is 'Per-user storage quota (bytes). Default 100 MB.';
