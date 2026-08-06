# CloudVault — SQL Schema

This directory contains the complete Supabase/PostgreSQL schema for CloudVault, organized as numbered migration files designed to be executed **in order**.

## Files

| # | File | Purpose |
|---|------|---------|
| 00 | `00_extensions.sql` | Enable required PostgreSQL extensions (`pgcrypto`, `moddatetime`) |
| 01 | `01_profiles.sql` | `profiles` table — user display names, avatars, storage quotas |
| 02 | `02_files.sql` | `files` table — uploaded file metadata (names, paths, MIME types, sizes) |
| 03 | `03_triggers.sql` | Trigger functions — auto-create profile on signup, auto-update `updated_at` |
| 04 | `04_rls.sql` | Row Level Security policies — users can only access their own data |
| 05 | `05_storage.sql` | Supabase Storage bucket creation + per-user access policies |
| 06 | `06_functions.sql` | Reusable DB functions — storage usage stats, reconciliation, file counts |
| 07 | `07_seed.sql` | Commented-out seed data templates for local development |

## How to Run

### Option 1: Supabase Dashboard (SQL Editor)
1. Open your Supabase project → **SQL Editor**
2. Paste and execute each file **in numeric order** (00 → 07)

### Option 2: Supabase CLI
```bash
# Run all files in order
for f in sql/*.sql; do supabase db execute --file "$f"; done
```

### Option 3: psql
```bash
# Connect to your Supabase database directly
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f sql/00_extensions.sql \
  -f sql/01_profiles.sql \
  -f sql/02_files.sql \
  -f sql/03_triggers.sql \
  -f sql/04_rls.sql \
  -f sql/05_storage.sql \
  -f sql/06_functions.sql \
  -f sql/07_seed.sql
```

## Schema Diagram

```
auth.users (Supabase-managed)
    │
    │  on INSERT → handle_new_user() trigger
    │
    ├──── public.profiles (1:1)
    │       • id (PK, FK → auth.users)
    │       • full_name, avatar_url
    │       • storage_used, storage_limit
    │       • created_at, updated_at
    │
    └──── public.files (1:many)
            • id (PK, auto UUID)
            • user_id (FK → auth.users)
            • original_name, stored_name
            • storage_path, bucket_name
            • mime_type, size
            • created_at, updated_at


storage.buckets
    └──── user-files (private)
            └──── <user_id>/
                    └──── <uuid-filename.ext>
```

## Security Model

| Layer | Mechanism |
|-------|-----------|
| **API** | JWT verification via Supabase Auth middleware |
| **Database** | RLS policies — users can only read/write their own rows |
| **Storage** | Per-user folder isolation via storage policies |
| **Backend** | Service-role key bypasses RLS for admin operations |
