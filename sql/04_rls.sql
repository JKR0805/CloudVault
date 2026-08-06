-- ============================================================================
-- CloudVault — Row Level Security (RLS)
-- ============================================================================
-- Supabase uses PostgreSQL RLS to control data access at the database level.
-- When RLS is enabled on a table, every query must satisfy at least one
-- policy — otherwise the row is invisible / the write is rejected.
--
-- The backend currently uses the service-role key (which bypasses RLS) for
-- most operations, but enabling RLS is essential because:
--   1. It's the last line of defense if the anon key is ever exposed.
--   2. It enables secure direct-from-client access in the future.
--   3. It's a Supabase best practice for every table in public.
--
-- Helper used below:
--   auth.uid()  →  returns the UUID of the currently authenticated user
--                   (extracted from the JWT by Supabase automatically)
-- ============================================================================


-- ──────────────────────────────────────────────────────────────────────────
-- PROFILES — RLS Policies
-- ──────────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- SELECT: users can only read their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- UPDATE: users can only update their own profile
-- Restricted columns are enforced at the application layer (profile.service.js)
create policy "profiles_update_own"
  on public.profiles
  for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT: only the trigger function (running as security definer) creates rows.
-- No direct user inserts allowed.
-- Note: The handle_new_user() trigger uses SECURITY DEFINER and thus bypasses
-- RLS entirely, so no INSERT policy is needed for profile creation.

-- DELETE: profiles are deleted via CASCADE when the auth.users row is removed.
-- No direct user deletes allowed.


-- ──────────────────────────────────────────────────────────────────────────
-- FILES — RLS Policies
-- ──────────────────────────────────────────────────────────────────────────

alter table public.files enable row level security;

-- SELECT: users can only see their own files
create policy "files_select_own"
  on public.files
  for select
  using (auth.uid() = user_id);

-- INSERT: users can only insert files owned by themselves
create policy "files_insert_own"
  on public.files
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can only update their own files (e.g. rename)
create policy "files_update_own"
  on public.files
  for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: users can only delete their own files
create policy "files_delete_own"
  on public.files
  for delete
  using (auth.uid() = user_id);
