# Subscription & Pricing Model

This document defines how Colabs manages user subscriptions, pricing tiers, plan enforcement, and automatic demotion when paid plans expire.

---

## Table of Contents

- [Overview](#overview)
- [Pricing Tiers](#pricing-tiers)
- [Database Schema](#database-schema)
- [Subscription Lifecycle](#subscription-lifecycle)
- [Auto-Demotion Logic](#auto-demotion-logic)
- [Feature Gating](#feature-gating)
- [Implementation Architecture](#implementation-architecture)
- [Edge Cases](#edge-cases)

---

## Overview

Colabs uses a **tier-based subscription model** with three plans. Every authenticated user defaults to the **Starter (free)** plan. Paid plans (Pro, Pro+) have expiration dates. When a paid plan expires, the user is **automatically demoted** to Starter with no data loss — only feature access is restricted.

```
┌─────────────────────────────────────────────────┐
│              Subscription Flow                   │
│                                                  │
│  Sign Up → Starter (free, no expiry)             │
│     ↓                                            │
│  Upgrade → Pro/Pro+ (sets expires_at)            │
│     ↓                                            │
│  Active? → Check expires_at > now()              │
│     │                                            │
│     ├── Yes → Full plan features                 │
│     └── No  → Auto-demote to Starter             │
│              (status='expired', new starter row) │
└─────────────────────────────────────────────────┘
```

---

## Pricing Tiers

| Plan | Price | Seats | Key Features | Expiry |
|---|---|---|---|---|
| **Starter** | Free | 1 | Basic leaderboard, community support, basic analytics, public repos only | Never |
| **Pro** | $20/mo | Up to 10 | Advanced leaderboard, priority support, advanced analytics, private repos, custom integrations, team management | 30 days from activation |
| **Pro+** | $30/mo | Unlimited | Full leaderboard customization, 24/7 support, enterprise analytics, API access, white-label, SLA guarantee | 30 days from activation |

### Feature Matrix

| Feature | Starter | Pro | Pro+ |
|---|---|---|---|
| Claim issues | ✅ | ✅ | ✅ |
| Create projects | ✅ (3 max) | ✅ (25 max) | ✅ (unlimited) |
| Create gigs | ❌ | ✅ | ✅ |
| Team management | ❌ | ✅ (3 teams) | ✅ (unlimited) |
| Private repositories | ❌ | ✅ | ✅ |
| Advanced analytics | ❌ | ✅ | ✅ |
| Custom integrations | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |
| White-label options | ❌ | ❌ | ✅ |
| SLA guarantee | ❌ | ❌ | ✅ |
| Priority/24-7 support | ❌ | Priority | 24/7 Dedicated |

---

## Database Schema

### `user_subscriptions` Table

```sql
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter',       -- 'starter' | 'pro' | 'pro_plus'
  status TEXT NOT NULL DEFAULT 'active',       -- 'active' | 'expired' | 'cancelled'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,                      -- NULL for starter (never expires)
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)                              -- One active subscription per user
);
```

### Key Design Decisions

1. **One row per user** (`UNIQUE(user_id)`) — the row is updated in-place on upgrade/downgrade/expiry, keeping queries simple.
2. **`expires_at IS NULL`** for Starter — free plans never expire.
3. **`status` column** tracks lifecycle without deleting rows — preserves audit trail.
4. **No foreign key to a `plans` table** — plan names are simple text values validated at the application layer to avoid over-engineering at this stage.

### RLS Policies

```sql
-- Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (initial creation)
CREATE POLICY "Users can create own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription (upgrade/cancel)
CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
```

> **Note**: Actual payment-triggered upgrades should use a **service role** edge function (not client-side updates) to prevent users from self-upgrading without payment. The client-side UPDATE policy exists for cancellation flows only.

---

## Subscription Lifecycle

### 1. User Signs Up → Auto-Create Starter

When a user signs up, a `user_subscriptions` row is created with `plan = 'starter'` and `expires_at = NULL`.

**Trigger**: Database trigger on `auth.users` insert, OR application-level creation in the `useAuth` hook on first sign-in detection.

### 2. User Upgrades → Update Plan + Set Expiry

```
UPDATE user_subscriptions
SET plan = 'pro',
    status = 'active',
    started_at = now(),
    expires_at = now() + INTERVAL '30 days',
    updated_at = now()
WHERE user_id = :user_id;
```

**Trigger**: Called from a payment confirmation edge function (e.g., Stripe webhook handler).

### 3. Plan Expires → Auto-Demote to Starter

The auto-demotion check happens at **two levels** for reliability:

#### Level 1: Client-Side Check (Immediate UX)

The `useSubscription()` hook checks `expires_at` on every load:

```typescript
const isExpired = subscription.expires_at && 
  new Date(subscription.expires_at) < new Date();

if (isExpired) {
  // Trigger server-side demotion
  await demoteToStarter(subscription.id);
}
```

#### Level 2: Database Function (Server-Side Truth)

A security definer function handles the demotion atomically:

```sql
CREATE OR REPLACE FUNCTION public.check_and_demote_subscription(_user_id UUID)
RETURNS public.user_subscriptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub public.user_subscriptions;
BEGIN
  SELECT * INTO sub FROM public.user_subscriptions WHERE user_id = _user_id;
  
  -- If paid plan has expired, demote to starter
  IF sub.plan != 'starter' AND sub.status = 'active' AND sub.expires_at < now() THEN
    UPDATE public.user_subscriptions
    SET plan = 'starter',
        status = 'active',
        expires_at = NULL,
        started_at = now(),
        updated_at = now()
    WHERE user_id = _user_id
    RETURNING * INTO sub;
  END IF;
  
  RETURN sub;
END;
$$;
```

#### Level 3: Scheduled CRON Job (Batch Cleanup)

A `pg_cron` job runs daily to catch any subscriptions missed by client-side checks:

```sql
-- Runs daily at midnight UTC
SELECT cron.schedule(
  'demote-expired-subscriptions',
  '0 0 * * *',
  $$
    UPDATE public.user_subscriptions
    SET plan = 'starter',
        status = 'active',
        expires_at = NULL,
        started_at = now(),
        updated_at = now()
    WHERE plan != 'starter'
      AND status = 'active'
      AND expires_at < now();
  $$
);
```

### 4. User Cancels → Mark Cancelled, Retain Access Until Expiry

```
UPDATE user_subscriptions
SET status = 'cancelled',
    cancelled_at = now(),
    updated_at = now()
WHERE user_id = :user_id;
```

Cancelled users keep access until `expires_at`. After expiry, the same demotion logic applies.

---

## Auto-Demotion Logic

### Flow Diagram

```
User opens app
  → useSubscription() fires
    → Calls check_and_demote_subscription(user_id) via RPC
      → DB function checks: is plan != 'starter' AND expires_at < now()?
        │
        ├── YES → Updates row to starter, returns updated sub
        │         → Hook shows toast: "Your Pro plan has expired"
        │         → UI restricts features immediately
        │
        └── NO  → Returns current sub as-is
                  → UI renders features based on plan
```

### Demotion Rules

| Condition | Action | User Impact |
|---|---|---|
| `plan = 'pro'` AND `expires_at < now()` | Demote to starter | Loses team mgmt, private repos, advanced analytics |
| `plan = 'pro_plus'` AND `expires_at < now()` | Demote to starter | Loses all premium features |
| `status = 'cancelled'` AND `expires_at < now()` | Demote to starter | Same as above |
| `plan = 'starter'` | No action | Already on free plan |
| `expires_at IS NULL` | No action | Free plan, never expires |

### Data Preservation

> **Critical**: Demotion NEVER deletes user data. Projects, teams, gigs, and issues remain intact. Only feature access is restricted. When a user re-upgrades, all their data is immediately accessible again.

---

## Feature Gating

### `useSubscription()` Hook

The primary interface for plan-based feature gating:

```typescript
interface SubscriptionState {
  plan: 'starter' | 'pro' | 'pro_plus';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt: string | null;
  isExpired: boolean;
  isPro: boolean;       // true for pro OR pro_plus
  isProPlus: boolean;   // true for pro_plus only
  isLoading: boolean;
  canCreateProject: boolean;
  canCreateGig: boolean;
  canCreateTeam: boolean;
  canAccessAdvancedAnalytics: boolean;
  canAccessApi: boolean;
}
```

### Component Usage Pattern

```tsx
const { isPro, canCreateGig } = useSubscription();

// Gate a feature
{canCreateGig ? (
  <CreateGigDialog />
) : (
  <UpgradePrompt plan="pro" feature="creating gigs" />
)}

// Gate a route
<Route path="/seller" element={
  <SubscriptionGuard requiredPlan="pro">
    <SellerDashboard />
  </SubscriptionGuard>
} />
```

### Pricing Page Integration

The Pricing page reads the user's current plan to:
1. Highlight the active plan with a "Current Plan" badge
2. Disable the button for the current plan
3. Show "Upgrade" for higher plans, "Downgrade" for lower plans
4. Show expiry date for paid plans

---

## Implementation Architecture

### Data Flow

```
┌────────────────────────────────────────────────────┐
│                    UI Layer                         │
│                                                     │
│  Pricing.tsx ←── useSubscription() ──→ UpgradePrompt│
│  SellerDashboard ←── SubscriptionGuard              │
│  Dashboard ←── canCreateTeam, canCreateProject      │
└──────────────────┬─────────────────────────────────┘
                   │
                   │ RPC / Direct query
                   │
┌──────────────────┴─────────────────────────────────┐
│               Supabase Backend                      │
│                                                     │
│  user_subscriptions table (RLS-protected)           │
│  check_and_demote_subscription() function           │
│  pg_cron daily cleanup job                          │
│  Payment webhook edge function (future: Stripe)     │
└────────────────────────────────────────────────────┘
```

### File Map

| File | Purpose |
|---|---|
| `src/hooks/useSubscription.tsx` | Subscription state hook with auto-demotion check |
| `src/components/SubscriptionGuard.tsx` | Route-level plan enforcement component |
| `src/components/UpgradePrompt.tsx` | Reusable upgrade CTA shown when features are gated |
| `src/pages/Pricing.tsx` | Pricing page with live plan state |
| `supabase/functions/payment-webhook/index.ts` | (Future) Stripe webhook handler for upgrades |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| User has no subscription row | `useSubscription` creates a starter row on first check |
| User upgrades mid-cycle | `started_at` and `expires_at` reset to new 30-day window |
| User downgrades Pro+ → Pro | Update plan, keep same `expires_at` |
| Multiple devices logged in | All devices read same DB row; demotion propagates via React Query refetch |
| Payment fails on renewal | Plan expires naturally; user sees demotion toast |
| User deletes account | `ON DELETE CASCADE` removes subscription row |
| Clock skew (client vs server) | Server-side `check_and_demote_subscription()` uses DB `now()`, not client time |

---

## Future Enhancements

| Feature | Description |
|---|---|
| Stripe integration | Automated billing, invoice generation, and webhook-driven plan updates. See [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md) for full implementation plan. |
| Grace period | 3-day grace after expiry before demotion |
| Annual plans | Discounted yearly billing with 365-day `expires_at` |
| Usage-based limits | Track seat count, project count against plan limits in real-time |
| Subscription history table | Separate `subscription_history` table for audit trail of all plan changes |
| Email notifications | Send emails 7 days and 1 day before expiry via Supabase edge function + email provider |
