ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS objective text DEFAULT '',
ADD COLUMN IF NOT EXISTS profile_summary text DEFAULT '',
ADD COLUMN IF NOT EXISTS internships jsonb DEFAULT '[]'::jsonb;