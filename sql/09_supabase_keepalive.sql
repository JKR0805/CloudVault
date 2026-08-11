-- 1. Create a minimal dedicated table for the keep-alive ping
CREATE TABLE public.supabase_keepalive (
  id integer PRIMARY KEY
);

-- 2. Insert a single row
INSERT INTO public.supabase_keepalive (id) VALUES (1);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.supabase_keepalive ENABLE ROW LEVEL SECURITY;

-- 4. Create a restrictive policy that only allows read access to anonymous users
CREATE POLICY "Allow anonymous read access"
ON public.supabase_keepalive
FOR SELECT
TO anon
USING (true);
