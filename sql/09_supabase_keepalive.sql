-- 1. Create a minimal dedicated table for the keep-alive ping (idempotent)
CREATE TABLE IF NOT EXISTS public.supabase_keepalive (
  id integer PRIMARY KEY
);

-- 2. Insert a single row if not already present
INSERT INTO public.supabase_keepalive (id) 
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.supabase_keepalive ENABLE ROW LEVEL SECURITY;

-- 4. Create a restrictive policy that only allows read access to anonymous users
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.supabase_keepalive;

CREATE POLICY "Allow anonymous read access"
ON public.supabase_keepalive
FOR SELECT
TO anon
USING (true);

