-- ============================================================================
-- CloudVault — Extensions
-- ============================================================================
-- Enable required PostgreSQL extensions.
-- Supabase enables most of these by default, but being explicit guarantees
-- the schema is self-contained and portable.
-- ============================================================================

-- UUID generation (gen_random_uuid)
create extension if not exists "pgcrypto" schema "extensions";

-- moddatetime: auto-update `updated_at` columns on row modification
create extension if not exists "moddatetime" schema "extensions";
