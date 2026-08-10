-- ==========================================
-- 08_shared_links.sql
-- Creates the shared_links table for URL shortener
-- ==========================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.shared_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    short_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for fast lookups by short_code
CREATE INDEX IF NOT EXISTS idx_shared_links_short_code ON public.shared_links(short_code);

-- 3. Enable RLS
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can manage their own shared links
CREATE POLICY "Users can manage their own shared links" ON public.shared_links
    FOR ALL USING (auth.uid() = user_id);
