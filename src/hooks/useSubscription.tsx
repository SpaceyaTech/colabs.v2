import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { toast } from 'sonner';

export type PlanType = 'starter' | 'pro' | 'pro_plus';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface SubscriptionState {
  plan: PlanType;
  status: SubscriptionStatus;
  expiresAt: string | null;
  startedAt: string;
  isExpired: boolean;
  isPro: boolean;
  isProPlus: boolean;
  isLoading: boolean;
  canCreateProject: boolean;
  canCreateGig: boolean;
  canCreateTeam: boolean;
  canAccessAdvancedAnalytics: boolean;
  canAccessApi: boolean;
  daysRemaining: number | null;
}

const PLAN_LIMITS = {
  starter: { projects: 3, teams: 0, gigs: false, advancedAnalytics: false, api: false },
  pro: { projects: 25, teams: 3, gigs: true, advancedAnalytics: true, api: false },
  pro_plus: { projects: Infinity, teams: Infinity, gigs: true, advancedAnalytics: true, api: true },
} as const;

/**
 * TODO: STRIPE INTEGRATION - Subscription State Hook
 *
 * After Stripe checkout completes, the user is redirected back to the app.
 * This hook should detect the return and refetch subscription data:
 *
 * 1. Check for session_id in URL on mount
 * 2. If present, immediately invalidate and refetch subscription
 * 3. Optionally verify session with stripe-webhook has processed
 *
 * Add this effect after implementing Stripe:
 *
 * useEffect(() => {
 *   const searchParams = new URLSearchParams(window.location.search);
 *   const sessionId = searchParams.get('session_id');
 *   if (sessionId) {
 *     // Webhook may have already updated the DB
 *     queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
 *     // Clean URL
 *     window.history.replaceState({}, '', window.location.pathname);
 *   }
 * }, [queryClient, user?.id]);
 *
 * See docs/STRIPE_INTEGRATION.md for full implementation details.
 */
export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // TODO: Add session_id detection for post-Stripe checkout refetch
  // useEffect(() => {
  //   const searchParams = new URLSearchParams(window.location.search);
  //   if (searchParams.get('session_id')) {
  //     queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
  //     window.history.replaceState({}, '', window.location.pathname);
  //   }
  // }, [queryClient, user?.id]);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Call the security definer function which handles auto-demotion
      const { data, error } = await supabase.rpc('check_and_demote_subscription' as any, {
        _user_id: user.id,
      });

      if (error) {
        console.error('Subscription check failed:', error);
        // Fallback: direct query
        const { data: fallback } = await (supabase as any)
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        return fallback;
      }

      return Array.isArray(data) ? (data[0] ?? null) : data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Show toast when demotion is detected
  useEffect(() => {
    if (!subscription) return;
    const wasExpired =
      subscription.expires_at &&
      new Date(subscription.expires_at) < new Date() &&
      subscription.plan === 'starter';
    // The RPC already handled demotion, but we can detect it happened
    // by checking if the plan changed in cache
  }, [subscription]);

  const plan = (subscription?.plan as PlanType) ?? 'starter';
  const status = (subscription?.status as SubscriptionStatus) ?? 'active';
  const expiresAt = subscription?.expires_at ?? null;
  const isExpired = !!(expiresAt && new Date(expiresAt) < new Date());
  const limits = PLAN_LIMITS[plan];

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    plan,
    status,
    expiresAt,
    startedAt: subscription?.started_at ?? new Date().toISOString(),
    isExpired,
    isPro: plan === 'pro' || plan === 'pro_plus',
    isProPlus: plan === 'pro_plus',
    isLoading,
    canCreateProject: true, // All plans can create projects (limit differs)
    canCreateGig: limits.gigs,
    canCreateTeam: limits.teams > 0,
    canAccessAdvancedAnalytics: limits.advancedAnalytics,
    canAccessApi: limits.api,
    daysRemaining,
  };
}
