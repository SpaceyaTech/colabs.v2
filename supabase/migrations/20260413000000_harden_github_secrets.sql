-- Migration: harden_github_secrets
-- Date: 2026-04-13
-- Description: Move sensitive OAuth tokens to a separate table with no RLS policies to prevent client-side exposure.

-- 1. Create the secrets table
CREATE TABLE IF NOT EXISTS public.github_integration_secrets (
  id UUID PRIMARY KEY REFERENCES public.github_integrations(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
-- A table with RLS enabled but no policies denies all access to non-superusers/non-service-role.
ALTER TABLE public.github_integration_secrets ENABLE ROW LEVEL SECURITY;

-- 3. Migrate existing data
INSERT INTO public.github_integration_secrets (id, access_token, refresh_token, updated_at)
SELECT id, access_token, refresh_token, updated_at
FROM public.github_integrations;

-- 4. Drop sensitive columns from the main integrations table
ALTER TABLE public.github_integrations DROP COLUMN access_token;
ALTER TABLE public.github_integrations DROP COLUMN refresh_token;

-- 5. Add trigger to update updated_at on the secrets table
CREATE TRIGGER update_github_integration_secrets_updated_at
BEFORE UPDATE ON public.github_integration_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
