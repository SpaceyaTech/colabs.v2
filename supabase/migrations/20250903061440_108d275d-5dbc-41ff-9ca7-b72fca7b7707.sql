-- Create projects table
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  logo_url text,
  technologies text[] NOT NULL DEFAULT '{}',
  project_type text NOT NULL CHECK (project_type IN ('open-source', 'private', 'hybrid')),
  visibility text NOT NULL CHECK (visibility IN ('public', 'unlisted', 'invite-only')),
  is_paid boolean NOT NULL DEFAULT false,
  compensation_type text CHECK (compensation_type IN ('fixed', 'hourly', 'equity', 'hybrid')),
  budget text,
  currency text DEFAULT 'USD',
  team_size text NOT NULL DEFAULT '1-3',
  experience_level text NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration text NOT NULL DEFAULT '1-3months' CHECK (duration IN ('1week', '1month', '1-3months', '3-6months', '6months+')),
  allow_applications boolean NOT NULL DEFAULT true,
  requires_approval boolean NOT NULL DEFAULT true,
  invite_emails text[] DEFAULT '{}',
  category text,
  industry text,
  launch_readiness text DEFAULT 'concept' CHECK (launch_readiness IN ('concept', 'mvp', 'beta', 'production')),
  creator_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Anyone can view public projects"
ON public.projects
FOR SELECT
USING (visibility = 'public' OR visibility = 'unlisted');

CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = creator_id);

CREATE POLICY "Users can create projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = creator_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for project logos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-logos', 'project-logos', true);

-- Create storage policies for project logos
CREATE POLICY "Anyone can view project logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-logos');

CREATE POLICY "Users can upload project logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own project logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own project logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-logos' AND auth.uid() IS NOT NULL);