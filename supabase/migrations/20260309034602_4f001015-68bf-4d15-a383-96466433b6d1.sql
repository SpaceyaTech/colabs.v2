
-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-demotion function
CREATE OR REPLACE FUNCTION public.check_and_demote_subscription(_user_id UUID)
RETURNS SETOF public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub public.user_subscriptions;
BEGIN
  SELECT * INTO sub FROM public.user_subscriptions WHERE user_id = _user_id;
  
  -- No subscription row: create starter
  IF sub.id IS NULL THEN
    INSERT INTO public.user_subscriptions (user_id, plan, status, expires_at)
    VALUES (_user_id, 'starter', 'active', NULL)
    RETURNING * INTO sub;
    RETURN NEXT sub;
    RETURN;
  END IF;
  
  -- If paid plan has expired, demote to starter
  IF sub.plan != 'starter' AND sub.expires_at IS NOT NULL AND sub.expires_at < now() THEN
    UPDATE public.user_subscriptions
    SET plan = 'starter',
        status = 'active',
        expires_at = NULL,
        started_at = now(),
        updated_at = now()
    WHERE user_id = _user_id
    RETURNING * INTO sub;
  END IF;
  
  RETURN NEXT sub;
  RETURN;
END;
$$;

-- Updated_at trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
