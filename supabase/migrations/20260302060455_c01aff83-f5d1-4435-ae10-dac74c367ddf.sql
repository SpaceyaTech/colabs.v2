
-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'pending',
  joined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team projects junction table
CREATE TABLE public.team_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, project_id)
);

ALTER TABLE public.team_projects ENABLE ROW LEVEL SECURITY;

-- Security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  ) OR EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = _team_id AND created_by = _user_id
  );
$$;

-- Teams RLS policies
CREATE POLICY "Team creators can do everything" ON public.teams
FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Team members can view their teams" ON public.teams
FOR SELECT USING (public.is_team_member(auth.uid(), id));

-- Team members RLS policies
CREATE POLICY "Team creators can manage members" ON public.team_members
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid()
));

CREATE POLICY "Members can view fellow members" ON public.team_members
FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

-- Team projects RLS policies
CREATE POLICY "Team creators can manage team projects" ON public.team_projects
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.teams WHERE id = team_projects.team_id AND created_by = auth.uid()
));

CREATE POLICY "Members can view team projects" ON public.team_projects
FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

-- Timestamp trigger
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
