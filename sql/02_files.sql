-- ============================================================================
-- CloudVault — Files Table
-- ============================================================================
-- Stores metadata for every uploaded file.
-- The actual binary lives in Supabase Storage (bucket: user-files);
-- this table tracks names, paths, MIME types, sizes, and ownership.
--
-- Design notes:
--   • original_name  = the filename the user sees (can be renamed)
--   • stored_name    = UUID-based filename in storage (never changes)
--   • storage_path   = "<user_id>/<stored_name>" — the full key in the bucket
--   • bucket_name    = the Supabase Storage bucket holding the object
-- ============================================================================

create table if not exists public.files (
  -- Primary key — auto-generated UUID
  id             uuid         primary key default gen_random_uuid(),

  -- Owner — cascading delete removes files when the user is deleted
  user_id        uuid         not null references auth.users(id) on delete cascade,

  -- ── Naming ──────────────────────────────────────────────────────────────
  -- The display name (user-facing, can be renamed via PATCH /files/:id)
  original_name  text         not null,

  -- The UUID-based name stored in Supabase Storage (immutable after upload)
  stored_name    text         not null,

  -- Full object key: "<user_id>/<stored_name>"
  storage_path   text         not null,

  -- Supabase Storage bucket name
  bucket_name    text         not null default 'user-files',

  -- ── File metadata ───────────────────────────────────────────────────────
  -- MIME type (e.g. "application/pdf", "image/png")
  mime_type      text         not null,

  -- File size in bytes
  size           bigint       not null,

  -- ── Timestamps ──────────────────────────────────────────────────────────
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now(),

  -- ── Constraints ─────────────────────────────────────────────────────────
  constraint files_size_non_negative       check (size >= 0),
  constraint files_original_name_not_empty check (length(trim(original_name)) > 0),
  constraint files_storage_path_unique     unique (storage_path)
);

-- ── Indexes ──────────────────────────────────────────────────────────────
-- Primary query pattern: list files for a user, newest first
create index if not exists idx_files_user_id_created_at
  on public.files (user_id, created_at desc);

-- Look up files by MIME type (useful for filtering by type)
create index if not exists idx_files_user_id_mime_type
  on public.files (user_id, mime_type);

-- ── Column comments ──────────────────────────────────────────────────────
comment on table  public.files                  is 'File metadata — one row per uploaded object. Binaries live in Supabase Storage.';
comment on column public.files.id               is 'Auto-generated UUID primary key.';
comment on column public.files.user_id          is 'FK → auth.users(id). Owner of the file.';
comment on column public.files.original_name    is 'User-facing filename (can be renamed).';
comment on column public.files.stored_name      is 'UUID-based filename in storage (immutable).';
comment on column public.files.storage_path     is 'Full storage key: <user_id>/<stored_name>.';
comment on column public.files.bucket_name      is 'Supabase Storage bucket holding the binary.';
comment on column public.files.mime_type        is 'MIME type of the uploaded file.';
comment on column public.files.size             is 'File size in bytes.';
