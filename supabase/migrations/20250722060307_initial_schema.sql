-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create enum for organization roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create organization integrations table
CREATE TABLE public.organization_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'slack', 'github', 'clickup', 'figma'
  integration_name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- Store API keys, webhooks, etc
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_by UUID NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_type, integration_name)
);

-- Enable RLS
ALTER TABLE public.organization_integrations ENABLE ROW LEVEL SECURITY;

-- Create organization workflows table
CREATE TABLE public.organization_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'slack_message', 'github_pr', 'clickup_task', etc
  trigger_config JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]', -- Array of actions to perform
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_workflows ENABLE ROW LEVEL SECURITY;

-- Create function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members 
    WHERE user_id = _user_id AND organization_id = _org_id
  );
$$;

-- Create function to get user role in organization
CREATE OR REPLACE FUNCTION public.get_user_org_role(_user_id UUID, _org_id UUID)
RETURNS org_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.organization_members 
  WHERE user_id = _user_id AND organization_id = _org_id
  LIMIT 1;
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations
FOR SELECT
USING (public.is_organization_member(auth.uid(), id));

CREATE POLICY "Organization owners/admins can update their organization"
ON public.organizations
FOR UPDATE
USING (public.get_user_org_role(auth.uid(), id) IN ('owner', 'admin'));

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for organization_members
CREATE POLICY "Users can view members of organizations they belong to"
ON public.organization_members
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization owners can manage all members"
ON public.organization_members
FOR ALL
USING (public.get_user_org_role(auth.uid(), organization_id) = 'owner');

CREATE POLICY "Organization admins can manage members (except owners)"
ON public.organization_members
FOR ALL
USING (
  public.get_user_org_role(auth.uid(), organization_id) = 'admin' 
  AND role != 'owner'
);

CREATE POLICY "Users can join organizations"
ON public.organization_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for organization_integrations
CREATE POLICY "Organization members can view integrations"
ON public.organization_integrations
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization owners/admins can manage integrations"
ON public.organization_integrations
FOR ALL
USING (public.get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- RLS Policies for organization_workflows
CREATE POLICY "Organization members can view workflows"
ON public.organization_workflows
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization owners/admins can manage workflows"
ON public.organization_workflows
FOR ALL
USING (public.get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_integrations_updated_at
BEFORE UPDATE ON public.organization_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_workflows_updated_at
BEFORE UPDATE ON public.organization_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();