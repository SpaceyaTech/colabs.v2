-- Fix function search path security issues with CASCADE
-- Update existing functions to include proper search_path

DROP FUNCTION IF EXISTS public.get_user_org_role(uuid, uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_org_role(_user_id uuid, _org_id uuid)
RETURNS org_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role 
  FROM public.organization_members 
  WHERE user_id = _user_id AND organization_id = _org_id
  LIMIT 1;
$function$;

DROP FUNCTION IF EXISTS public.is_organization_member(uuid, uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members 
    WHERE user_id = _user_id AND organization_id = _org_id
  );
$function$;

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate the organization policies that were dropped
-- Organization members policies
CREATE POLICY "Organization admins can manage members (except owners)" 
ON public.organization_members 
FOR ALL
USING ((get_user_org_role(auth.uid(), organization_id) = 'admin'::org_role) AND (role <> 'owner'::org_role));

CREATE POLICY "Organization owners can manage all members" 
ON public.organization_members 
FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) = 'owner'::org_role);

-- Organization integrations policies
CREATE POLICY "Organization owners/admins can manage integrations" 
ON public.organization_integrations 
FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role]));

-- Organization workflows policies
CREATE POLICY "Organization owners/admins can manage workflows" 
ON public.organization_workflows 
FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role]));

-- Organizations policies
CREATE POLICY "Organization owners/admins can update their organization" 
ON public.organizations 
FOR UPDATE
USING (get_user_org_role(auth.uid(), id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role]));

-- Recreate triggers that were dropped
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
BEFORE UPDATE ON public.organization_members
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