
CREATE TABLE public.claimed_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  issue_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  assignee_name text NOT NULL DEFAULT 'Unassigned',
  assignee_avatar text NOT NULL DEFAULT '',
  repo_name text NOT NULL,
  repo_owner text NOT NULL,
  repo_full_name text NOT NULL DEFAULT '',
  labels text[] NOT NULL DEFAULT '{}',
  category text,
  comments integer NOT NULL DEFAULT 0,
  is_good_first_issue boolean NOT NULL DEFAULT false,
  html_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, issue_id)
);

ALTER TABLE public.claimed_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own claimed issues"
  ON public.claimed_issues FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can claim issues"
  ON public.claimed_issues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their claimed issues"
  ON public.claimed_issues FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unclaim issues"
  ON public.claimed_issues FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
