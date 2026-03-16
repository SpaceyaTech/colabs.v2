ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS github_repo_url text,
  ADD COLUMN IF NOT EXISTS external_links jsonb DEFAULT '{}'::jsonb;