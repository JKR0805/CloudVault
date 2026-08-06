-- ============================================================================
-- CloudVault — Functions & Triggers
-- ============================================================================
-- Automatic behaviors that fire on database events.
--
-- 1. handle_new_user()          — creates a profiles row on signup
-- 2. moddatetime triggers       — auto-update updated_at columns
-- ============================================================================


-- ──────────────────────────────────────────────────────────────────────────
-- 1. Auto-create profile on signup
-- ──────────────────────────────────────────────────────────────────────────
-- When a new row is inserted into auth.users (i.e. a user signs up),
-- this trigger automatically creates a matching row in public.profiles
-- so the backend never has to handle "profile doesn't exist yet" cases.
--
-- It also extracts `full_name` and `avatar_url` from the auth metadata
-- if the user signed up via an OAuth provider (Google, GitHub, etc.).
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      null
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      null
    )
  );
  return new;
end;
$$;

-- Attach to auth.users INSERT
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

comment on function public.handle_new_user()
  is 'Creates a public.profiles row whenever a new user signs up via Supabase Auth.';


-- ──────────────────────────────────────────────────────────────────────────
-- 2. Auto-update updated_at timestamps
-- ──────────────────────────────────────────────────────────────────────────
-- Uses the moddatetime extension to automatically set the `updated_at`
-- column to now() on every UPDATE. This means the backend doesn't need
-- to manually set updated_at on every write (though it currently does
-- as a safety measure — this trigger acts as a guaranteed fallback).
-- ──────────────────────────────────────────────────────────────────────────

-- profiles.updated_at
create or replace trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function extensions.moddatetime('updated_at');

-- files.updated_at
create or replace trigger set_files_updated_at
  before update on public.files
  for each row
  execute function extensions.moddatetime('updated_at');
