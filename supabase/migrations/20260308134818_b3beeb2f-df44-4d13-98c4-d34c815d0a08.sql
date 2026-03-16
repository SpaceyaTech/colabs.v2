
-- Create gigs table
CREATE TABLE public.gigs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL,
  title text NOT NULL,
  company text NOT NULL DEFAULT '',
  company_logo text,
  company_verified boolean NOT NULL DEFAULT false,
  company_rating numeric(2,1),
  company_review_count integer DEFAULT 0,
  budget text NOT NULL DEFAULT '',
  budget_value integer NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Remote',
  difficulty text NOT NULL DEFAULT 'Intermediate',
  category text,
  description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  requirements text[] NOT NULL DEFAULT '{}',
  deliverables text[] NOT NULL DEFAULT '{}',
  technologies text[] NOT NULL DEFAULT '{}',
  proposals_count integer NOT NULL DEFAULT 0,
  is_urgent boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  client_member_since text,
  client_total_spent text,
  client_hire_rate integer,
  client_open_jobs integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active gigs
CREATE POLICY "Anyone can view active gigs"
  ON public.gigs FOR SELECT
  USING (status = 'active');

-- Creators can manage their own gigs
CREATE POLICY "Creators can manage their own gigs"
  ON public.gigs FOR ALL
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Add updated_at trigger
CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON public.gigs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
