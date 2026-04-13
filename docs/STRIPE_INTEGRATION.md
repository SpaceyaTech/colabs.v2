# Stripe Payment Integration

This document defines the full Stripe integration plan for Colabs subscription billing, marketplace purchases, and webhook-driven lifecycle management.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Stripe Products & Prices](#stripe-products--prices)
- [Subscription Checkout Flow](#subscription-checkout-flow)
- [Webhook Handling](#webhook-handling)
- [Marketplace Payments](#marketplace-payments)
- [Edge Functions Required](#edge-functions-required)
- [Database Changes Required](#database-changes-required)
- [Frontend Integration Points](#frontend-integration-points)
- [Security Considerations](#security-considerations)
- [Testing Checklist](#testing-checklist)

---

## Overview

Colabs uses Stripe for:

1. **Subscription billing** — Pro ($20/mo) and Pro+ ($30/mo) plan upgrades
2. **Marketplace purchases** — One-time project purchases with optional M-PESA via Stripe
3. **Webhook-driven lifecycle** — Automated plan activation, renewal, cancellation, and expiry demotion

```
┌──────────────────────────────────────────────────────────┐
│                    Payment Flow                           │
│                                                           │
│  User clicks "Upgrade to Pro"                             │
│    → Frontend calls create-checkout-session edge fn       │
│      → Edge fn creates Stripe Checkout Session            │
│        → User redirected to Stripe hosted checkout        │
│          → Payment succeeds                               │
│            → Stripe fires checkout.session.completed       │
│              → stripe-webhook edge fn receives event      │
│                → Updates user_subscriptions table          │
│                  → User sees Pro features immediately     │
└──────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before implementing, the following must be configured:

| Requirement                                | Status  | Notes                                                |
| ------------------------------------------ | ------- | ---------------------------------------------------- |
| Stripe account created                     | ❌ TODO | Create at https://dashboard.stripe.com               |
| Stripe secret key added as Supabase secret | ❌ TODO | Add `STRIPE_SECRET_KEY` via Lovable secrets tool     |
| Stripe publishable key added to `.env`     | ❌ TODO | Add `VITE_STRIPE_PUBLISHABLE_KEY` to codebase        |
| Stripe webhook endpoint secret             | ❌ TODO | Add `STRIPE_WEBHOOK_SECRET` via Lovable secrets tool |
| Stripe products/prices created             | ❌ TODO | Create via edge function or Stripe dashboard         |
| Supabase connected                         | ✅ Done | Project `rzldibgzlvhrnwjhngmy`                       |

### Required Supabase Secrets

```
STRIPE_SECRET_KEY        — sk_live_... or sk_test_... (NEVER expose in frontend)
STRIPE_WEBHOOK_SECRET    — whsec_... (for verifying webhook signatures)
```

### Required Frontend Environment Variable

```
VITE_STRIPE_PUBLISHABLE_KEY — pk_live_... or pk_test_... (safe for frontend)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                                                                  │
│  Pricing.tsx ──→ calls create-checkout-session edge fn           │
│  Checkout.tsx ──→ Stripe.js Elements or redirect to hosted      │
│  useSubscription() ──→ reads user_subscriptions (auto-refresh)  │
│  PurchaseSuccess.tsx ──→ confirms via session_id query param    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ supabase.functions.invoke()
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                   Edge Functions (Deno)                          │
│                                                                  │
│  create-checkout-session/index.ts                                │
│    → Creates Stripe Checkout Session                             │
│    → Returns session URL for redirect                            │
│                                                                  │
│  stripe-webhook/index.ts                                         │
│    → Receives Stripe events (POST)                               │
│    → Verifies webhook signature                                  │
│    → Updates user_subscriptions on payment success/failure       │
│                                                                  │
│  create-portal-session/index.ts                                  │
│    → Creates Stripe Customer Portal session                      │
│    → Allows users to manage billing, cancel, update payment      │
│                                                                  │
│  stripe-products/index.ts  (one-time setup)                      │
│    → Creates Stripe Products + Prices for Pro and Pro+           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Stripe SDK (stripe-node via esm.sh)
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                      Stripe API                                  │
│                                                                  │
│  Products: colabs_pro, colabs_pro_plus                           │
│  Prices: $20/mo recurring, $30/mo recurring                     │
│  Customers: mapped to Supabase user_id                           │
│  Subscriptions: managed by Stripe billing cycle                  │
│  Webhooks: → POST to stripe-webhook edge function               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stripe Products & Prices

Create these in Stripe (via dashboard or setup edge function):

| Product     | Product ID (metadata) | Price      | Interval | Stripe Price ID      |
| ----------- | --------------------- | ---------- | -------- | -------------------- |
| Colabs Pro  | `colabs_pro`          | $20.00 USD | Monthly  | ❌ TODO: `price_xxx` |
| Colabs Pro+ | `colabs_pro_plus`     | $30.00 USD | Monthly  | ❌ TODO: `price_xxx` |

### Metadata Convention

Each Stripe Product should include metadata:

```json
{
  "colabs_plan": "pro" // or "pro_plus"
}
```

This metadata is read by the webhook handler to determine which plan to activate.

---

## Subscription Checkout Flow

### Step 1: User Clicks "Upgrade" on Pricing Page

```tsx
// src/pages/Pricing.tsx — handleSelectPlan()
// TODO: Replace toast placeholder with actual Stripe checkout
const handleSelectPlan = async (planKey: PlanType) => {
  // 1. Call create-checkout-session edge function
  // 2. Pass: planKey, user.id, user.email
  // 3. Receive: Stripe Checkout Session URL
  // 4. Redirect user to Stripe hosted checkout
  //    window.location.href = data.url;
};
```

### Step 2: Edge Function Creates Checkout Session

```typescript
// supabase/functions/create-checkout-session/index.ts
// TODO: Implement this edge function
//
// Expected behavior:
// 1. Authenticate user via JWT
// 2. Look up or create Stripe Customer for this user
// 3. Create Stripe Checkout Session with:
//    - price_id based on planKey
//    - mode: 'subscription'
//    - success_url: {origin}/pricing?session_id={CHECKOUT_SESSION_ID}
//    - cancel_url: {origin}/pricing
//    - metadata: { user_id, plan: planKey }
//    - customer: stripe_customer_id
// 4. Return { url: session.url }
```

### Step 3: User Completes Payment on Stripe

Stripe handles PCI compliance, card validation, 3D Secure, etc.

### Step 4: Stripe Fires Webhook → Edge Function Updates DB

See [Webhook Handling](#webhook-handling) below.

### Step 5: User Redirected Back → UI Refreshes

```tsx
// On success_url, useSubscription() refetches via React Query
// The webhook will have already updated user_subscriptions
// User sees their new plan immediately
```

---

## Webhook Handling

### Edge Function: `stripe-webhook/index.ts`

```typescript
// supabase/functions/stripe-webhook/index.ts
// TODO: Implement this edge function
//
// CRITICAL: This is the source of truth for subscription state.
// Never trust client-side plan changes — only webhook-confirmed updates.
//
// Events to handle:
//
// checkout.session.completed
//   → User just paid. Extract metadata.user_id and metadata.plan
//   → UPDATE user_subscriptions SET plan = :plan, status = 'active',
//     started_at = now(), expires_at = now() + interval '30 days'
//     WHERE user_id = :user_id
//
// invoice.payment_succeeded
//   → Recurring payment succeeded (renewal)
//   → UPDATE user_subscriptions SET expires_at = now() + interval '30 days',
//     status = 'active', updated_at = now()
//     WHERE user_id = :user_id
//
// invoice.payment_failed
//   → Payment failed on renewal attempt
//   → Optional: send notification, mark status = 'past_due'
//   → Stripe retries automatically per retry settings
//
// customer.subscription.deleted
//   → Subscription cancelled (end of billing period)
//   → UPDATE user_subscriptions SET plan = 'starter', status = 'active',
//     expires_at = NULL, updated_at = now()
//     WHERE user_id = :user_id
//
// customer.subscription.updated
//   → Plan changed (upgrade/downgrade mid-cycle)
//   → Update plan and expires_at accordingly
//
// SECURITY:
// - Verify webhook signature using STRIPE_WEBHOOK_SECRET
// - Use service role key for DB updates (bypass RLS)
// - Return 200 even on errors to prevent Stripe retries on bad data
```

### Webhook URL Configuration

After deploying the `stripe-webhook` edge function, configure in Stripe Dashboard:

```
Webhook URL: https://rzldibgzlvhrnwjhngmy.supabase.co/functions/v1/stripe-webhook
Events:
  - checkout.session.completed
  - invoice.payment_succeeded
  - invoice.payment_failed
  - customer.subscription.deleted
  - customer.subscription.updated
```

### Config.toml Entry

```toml
# TODO: Add to supabase/config.toml
[functions.stripe-webhook]
verify_jwt = false    # Stripe sends raw POST, not JWT-authenticated

[functions.create-checkout-session]
verify_jwt = true     # Must be authenticated user

[functions.create-portal-session]
verify_jwt = true     # Must be authenticated user
```

---

## Marketplace Payments

For one-time project purchases in the Marketplace:

### Current State (Simulated)

`src/pages/Checkout.tsx` currently simulates payments with a fake delay and mock transaction IDs.

### TODO: Stripe Integration for Marketplace

```typescript
// src/pages/Checkout.tsx — handleSubmit()
// TODO: Replace simulated payment with Stripe
//
// Option A: Stripe Checkout (hosted)
//   1. Call create-marketplace-checkout edge function
//   2. Pass: project details, amount, user info
//   3. Redirect to Stripe Checkout
//   4. On success, redirect to /purchase-success?session_id=xxx
//
// Option B: Stripe Payment Intents (embedded)
//   1. Call create-payment-intent edge function
//   2. Use @stripe/react-stripe-js Elements in Checkout.tsx
//   3. Confirm payment client-side
//   4. Webhook confirms and records purchase
//
// Recommended: Option A (Stripe Checkout) for faster implementation
// and PCI compliance without handling card data.
```

---

## Edge Functions Required

| Function                      | Purpose                                             | JWT    | Status  |
| ----------------------------- | --------------------------------------------------- | ------ | ------- |
| `create-checkout-session`     | Creates Stripe Checkout for subscriptions           | ✅ Yes | ❌ TODO |
| `stripe-webhook`              | Receives Stripe events, updates DB                  | ❌ No  | ❌ TODO |
| `create-portal-session`       | Opens Stripe Customer Portal for billing management | ✅ Yes | ❌ TODO |
| `create-marketplace-checkout` | Creates Stripe Checkout for one-time purchases      | ✅ Yes | ❌ TODO |

### Edge Function Template

All Stripe edge functions should follow this pattern:

```typescript
// supabase/functions/<name>/index.ts
import Stripe from 'https://esm.sh/stripe@14.x?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ... implementation
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Database Changes Required

### Add `stripe_customer_id` to `user_subscriptions`

```sql
-- TODO: Run this migration when implementing Stripe
ALTER TABLE public.user_subscriptions
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN stripe_price_id TEXT;

-- Index for webhook lookups
CREATE INDEX idx_user_subs_stripe_customer
  ON public.user_subscriptions(stripe_customer_id);

CREATE INDEX idx_user_subs_stripe_subscription
  ON public.user_subscriptions(stripe_subscription_id);
```

### Add `purchases` Table (for Marketplace)

```sql
-- TODO: Create when implementing marketplace payments
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'refunded'
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Frontend Integration Points

### Files to Update

| File                               | What to Add                                        | Priority |
| ---------------------------------- | -------------------------------------------------- | -------- |
| `src/pages/Pricing.tsx`            | Replace toast with `create-checkout-session` call  | High     |
| `src/pages/Checkout.tsx`           | Replace mock payment with Stripe Checkout redirect | Medium   |
| `src/pages/PurchaseSuccess.tsx`    | Verify session_id with Stripe on load              | Medium   |
| `src/hooks/useSubscription.tsx`    | Add refetch on return from Stripe checkout         | High     |
| `src/components/UpgradePrompt.tsx` | Wire "Upgrade" button to checkout flow             | High     |
| `src/pages/Settings.tsx`           | Add "Manage Billing" button → Customer Portal      | Low      |

### NPM Package

```bash
# TODO: Install when implementing
# @stripe/stripe-js — Stripe.js loader for frontend
# @stripe/react-stripe-js — React components (only if using embedded Elements)
```

---

## Security Considerations

| Concern                           | Mitigation                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| Stripe secret key exposure        | Store as Supabase secret, only used in edge functions                               |
| Webhook spoofing                  | Verify signature using `STRIPE_WEBHOOK_SECRET`                                      |
| Plan self-upgrade without payment | Client-side UPDATE policy exists only for cancellation; upgrades go through webhook |
| Price manipulation                | Price IDs are server-side constants, not client-provided                            |
| Double-charging                   | Use Stripe's idempotency keys in checkout session creation                          |
| PCI compliance                    | Use Stripe Checkout (hosted) — no card data touches our servers                     |

---

## Testing Checklist

| Test                         | Method                                        | Status  |
| ---------------------------- | --------------------------------------------- | ------- |
| Stripe test mode checkout    | Use `sk_test_` key + test cards               | ❌ TODO |
| Webhook receives events      | Use Stripe CLI: `stripe listen --forward-to`  | ❌ TODO |
| Plan upgrade reflected in UI | Check `useSubscription()` after webhook fires | ❌ TODO |
| Plan expiry + auto-demotion  | Set short `expires_at`, verify demotion       | ❌ TODO |
| Cancel via Customer Portal   | Verify `customer.subscription.deleted` event  | ❌ TODO |
| Marketplace purchase flow    | Test one-time payment + purchase record       | ❌ TODO |
| Failed payment handling      | Use test card `4000000000000002`              | ❌ TODO |

### Stripe Test Cards

```
Success:          4242 4242 4242 4242
Requires auth:    4000 0025 0000 3155
Declined:         4000 0000 0000 0002
Insufficient:     4000 0000 0000 9995
```

---

## Implementation Order

1. **Add Stripe secrets** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
2. **Create `create-checkout-session` edge function**
3. **Create `stripe-webhook` edge function**
4. **Update Pricing.tsx** to call checkout session
5. **Run DB migration** to add Stripe columns
6. **Configure webhook URL** in Stripe Dashboard
7. **Test end-to-end** with Stripe test mode
8. **Create `create-portal-session`** for billing management
9. **Update Checkout.tsx** for marketplace payments
10. **Go live** — switch to `sk_live_` keys
