-- Fix function search path security issues
-- Update existing functions to include proper search_path

DROP FUNCTION IF EXISTS public.get_user_org_role(uuid, uuid);
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

DROP FUNCTION IF EXISTS public.is_organization_member(uuid, uuid);
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

DROP FUNCTION IF EXISTS public.update_updated_at_column();
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