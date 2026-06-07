-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('milestone', 'project')),
  total_amount INTEGER,
  total_duration TEXT,
  resume_path TEXT NOT NULL,
  cover_letter TEXT,
  portfolio_url TEXT NOT NULL,
  github_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create proposal_milestones table
CREATE TABLE IF NOT EXISTS public.proposal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  amount INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own proposals
CREATE POLICY IF NOT EXISTS "Users can view their own proposals"
ON public.proposals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own proposals"
ON public.proposals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own proposals"
ON public.proposals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own proposals"
ON public.proposals FOR DELETE
USING (auth.uid() = user_id);

-- Milestones: allow access through parent proposal ownership
CREATE POLICY IF NOT EXISTS "Users can view milestones of their proposals"
ON public.proposal_milestones FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can insert milestones for their proposals"
ON public.proposal_milestones FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can update milestones for their proposals"
ON public.proposal_milestones FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can delete milestones for their proposals"
ON public.proposal_milestones FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.user_id = auth.uid()
));

-- Saved jobs policies
CREATE POLICY IF NOT EXISTS "Users can view their saved jobs"
ON public.saved_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can save jobs for themselves"
ON public.saved_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can remove their saved jobs"
ON public.saved_jobs FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view their own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
