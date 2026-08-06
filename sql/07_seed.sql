-- ============================================================================
-- CloudVault — Seed Data (Development Only)
-- ============================================================================
-- Optional test data for local development.
-- DO NOT run this against production.
--
-- Note: This file does NOT create auth.users rows — those must be created
-- through Supabase Auth (dashboard or API). Once a user is created, the
-- on_auth_user_created trigger will auto-create their profile.
--
-- The UUIDs below are placeholders. Replace them with real user IDs
-- from your Supabase Auth dashboard after creating test users.
-- ============================================================================


-- ── Example: Update a test user's profile ──────────────────────────────
-- Uncomment and replace the UUID after creating a test user via Supabase Auth.

-- update public.profiles
-- set
--   full_name   = 'Test User',
--   avatar_url  = 'https://api.dicebear.com/7.x/avataaars/svg?seed=cloudvault'
-- where id = '00000000-0000-0000-0000-000000000000';


-- ── Example: Insert a test file record ─────────────────────────────────
-- Uncomment and replace the user_id with a real UUID.

-- insert into public.files (user_id, original_name, stored_name, storage_path, bucket_name, mime_type, size)
-- values (
--   '00000000-0000-0000-0000-000000000000',
--   'test-document.pdf',
--   'a9e72b91-1234-5678-abcd-ef0123456789.pdf',
--   '00000000-0000-0000-0000-000000000000/a9e72b91-1234-5678-abcd-ef0123456789.pdf',
--   'user-files',
--   'application/pdf',
--   1048576  -- 1 MB
-- );
