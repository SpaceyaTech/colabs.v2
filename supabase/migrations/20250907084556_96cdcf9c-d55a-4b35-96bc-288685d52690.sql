-- Create tables for GitHub integration and repository data

-- Table to store GitHub integration per user
CREATE TABLE public.github_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  github_user_id INTEGER NOT NULL,
  github_username TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted in production
  refresh_token TEXT,
  avatar_url TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id),
  UNIQUE(github_user_id)
);

-- Enable RLS
ALTER TABLE public.github_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for github_integrations
CREATE POLICY "Users can view their own GitHub integration" 
ON public.github_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own GitHub integration" 
ON public.github_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub integration" 
ON public.github_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub integration" 
ON public.github_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Table to store connected repositories
CREATE TABLE public.github_repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID NOT NULL,
  github_repo_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  clone_url TEXT NOT NULL,
  default_branch TEXT NOT NULL DEFAULT 'main',
  language TEXT,
  topics TEXT[],
  stars_count INTEGER NOT NULL DEFAULT 0,
  forks_count INTEGER NOT NULL DEFAULT 0,
  is_private BOOLEAN NOT NULL DEFAULT false,
  is_fork BOOLEAN NOT NULL DEFAULT false,
  is_template BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'private', 'internal'
  allow_collaboration BOOLEAN NOT NULL DEFAULT false, -- User enables this repo for collaboration
  collaboration_type TEXT DEFAULT 'contribution', -- 'contribution', 'mentorship', 'hiring'
  experience_level TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(integration_id, github_repo_id)
);

-- Add foreign key constraint
ALTER TABLE public.github_repositories 
ADD CONSTRAINT fk_github_repositories_integration 
FOREIGN KEY (integration_id) REFERENCES public.github_integrations(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;

-- RLS policies for github_repositories
CREATE POLICY "Users can view repos from their GitHub integration" 
ON public.github_repositories 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.github_integrations gi 
    WHERE gi.id = integration_id AND gi.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view public collaboration-enabled repos" 
ON public.github_repositories 
FOR SELECT 
USING (allow_collaboration = true AND visibility = 'public');

CREATE POLICY "Users can manage repos from their GitHub integration" 
ON public.github_repositories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.github_integrations gi 
    WHERE gi.id = integration_id AND gi.user_id = auth.uid()
  )
);

-- Table to store collaboration requests
CREATE TABLE public.collaboration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  owner_id UUID NOT NULL, -- Repository owner
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  request_type TEXT NOT NULL DEFAULT 'contribution', -- 'contribution', 'mentorship'
  message TEXT,
  skills TEXT[], -- Skills the requester brings
  experience_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(repository_id, requester_id)
);

-- Add foreign key constraints
ALTER TABLE public.collaboration_requests 
ADD CONSTRAINT fk_collaboration_requests_repository 
FOREIGN KEY (repository_id) REFERENCES public.github_repositories(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for collaboration_requests
CREATE POLICY "Users can view their own requests" 
ON public.collaboration_requests 
FOR SELECT 
USING (auth.uid() = requester_id);

CREATE POLICY "Repo owners can view requests for their repos" 
ON public.collaboration_requests 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create collaboration requests" 
ON public.collaboration_requests 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Repo owners can update requests for their repos" 
ON public.collaboration_requests 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Create function to update timestamps
CREATE TRIGGER update_github_integrations_updated_at
BEFORE UPDATE ON public.github_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_github_repositories_updated_at
BEFORE UPDATE ON public.github_repositories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_requests_updated_at
BEFORE UPDATE ON public.collaboration_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();