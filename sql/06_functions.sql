-- ============================================================================
-- CloudVault — Database Functions
-- ============================================================================
-- Reusable server-side functions for common operations.
-- These can be called via supabase.rpc() from the backend or directly
-- from the client SDK.
-- ============================================================================


-- ──────────────────────────────────────────────────────────────────────────
-- 1. get_storage_usage(target_user_id)
-- ──────────────────────────────────────────────────────────────────────────
-- Returns storage stats for a user: used bytes, limit, and percentage.
-- This mirrors ProfileService.getStorageUsage() but as a DB function,
-- enabling direct client-side calls without going through the API.
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.get_storage_usage(target_user_id uuid)
returns json
language plpgsql
security invoker
as $$
declare
  v_used   bigint;
  v_limit  bigint;
begin
  select storage_used, storage_limit
  into   v_used, v_limit
  from   public.profiles
  where  id = target_user_id;

  if not found then
    raise exception 'Profile not found for user %', target_user_id;
  end if;

  return json_build_object(
    'used',       v_used,
    'limit',      v_limit,
    'percentage', round((v_used::numeric / v_limit::numeric) * 100, 2)
  );
end;
$$;

comment on function public.get_storage_usage(uuid)
  is 'Returns storage usage stats (used, limit, percentage) for a given user.';


-- ──────────────────────────────────────────────────────────────────────────
-- 2. recalculate_storage_used(target_user_id)
-- ──────────────────────────────────────────────────────────────────────────
-- Recalculates storage_used from the actual files table.
-- Useful as a periodic reconciliation or admin repair tool in case the
-- running counter in profiles.storage_used drifts out of sync.
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.recalculate_storage_used(target_user_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actual bigint;
begin
  select coalesce(sum(size), 0)
  into   v_actual
  from   public.files
  where  user_id = target_user_id;

  update public.profiles
  set    storage_used = v_actual,
         updated_at   = now()
  where  id = target_user_id;

  return v_actual;
end;
$$;

comment on function public.recalculate_storage_used(uuid)
  is 'Recalculates profiles.storage_used by summing files.size. Use for drift repair.';


-- ──────────────────────────────────────────────────────────────────────────
-- 3. get_user_file_count(target_user_id)
-- ──────────────────────────────────────────────────────────────────────────
-- Returns the total number of files a user has uploaded.
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.get_user_file_count(target_user_id uuid)
returns bigint
language sql
security invoker
as $$
  select count(*)
  from   public.files
  where  user_id = target_user_id;
$$;

comment on function public.get_user_file_count(uuid)
  is 'Returns the total number of files owned by a user.';
