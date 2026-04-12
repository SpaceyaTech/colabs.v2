# Stripe Payment Integration

This document defines the full Stripe integration plan for Colabs subscription billing, marketplace purchases, and webhook-driven lifecycle management.

> **Status:** Planned (Phase 2). None of the edge functions described here exist yet. This document captures the architecture decisions before implementation begins to prevent common mistakes (like exposing the Stripe secret key on the client).

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Architecture](#architecture)
- [Stripe Products and Prices](#stripe-products-and-prices)
- [Subscription Checkout Flow](#subscription-checkout-flow)
- [Webhook Handling](#webhook-handling)
- [Marketplace Payments](#marketplace-payments)
- [Edge Functions Required](#edge-functions-required)
- [Database Changes Required](#database-changes-required)
- [Frontend Integration Points](#frontend-integration-points)
- [Security Considerations](#security-considerations)
- [Testing Checklist](#testing-checklist)
- [Implementation Order](#implementation-order)

---

## Overview

Colabs will use Stripe for:

1. **Subscription billing** — Pro ($20/mo) and Pro+ ($30/mo) plan upgrades
2. **Marketplace purchases** — one-time project purchases with optional M-PESA via Stripe
3. **Webhook-driven lifecycle** — automated plan activation, renewal, cancellation, and expiry demotion

```
User clicks "Upgrade to Pro"
  → Frontend calls create-checkout-session edge function
    → Edge function creates a Stripe Checkout Session
      → User is redirected to Stripe hosted checkout
        → Payment succeeds
          → Stripe fires checkout.session.completed webhook
            → stripe-webhook edge function receives the event
              → Updates user_subscriptions table
                → User sees Pro features immediately
```

---

## Prerequisites

Before starting implementation, configure the following:

| Requirement                                           | Status  | Notes                                                           |
| ----------------------------------------------------- | ------- | --------------------------------------------------------------- |
| Stripe account created                                | ❌ TODO | Create at [dashboard.stripe.com](https://dashboard.stripe.com)  |
| `STRIPE_SECRET_KEY` added as Supabase secret          | ❌ TODO | `npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...`        |
| `STRIPE_WEBHOOK_SECRET`                               | ❌ TODO | Obtain from Stripe Dashboard (after deploying/creating webhook) |
| `VITE_STRIPE_PUBLISHABLE_KEY` added to `.env.example` | ❌ TODO | Safe for the client — starts with `pk_`                         |
| Stripe Products and Prices created                    | ❌ TODO | See [Stripe Products and Prices](#stripe-products-and-prices)   |
| Supabase project connected                            | ✅ Done | —                                                               |

### Required Supabase secrets

```bash
# Never put these in .env — they are server-side only
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### Required frontend environment variable

```env
# Safe for the client — this is the publishable key, not the secret key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Architecture

```
┌────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│                                                     │
│  Pricing.tsx ──→ calls create-checkout-session      │
│  useSubscription() ──→ reads user_subscriptions     │
│  Settings.tsx ──→ calls create-portal-session       │
└───────────────────────┬────────────────────────────┘
                        │ supabase.functions.invoke()
┌───────────────────────┴────────────────────────────┐
│              Edge Functions (Deno)                  │
│                                                     │
│  create-checkout-session  → Stripe Checkout Session │
│  stripe-webhook           → Stripe event handler   │
│  create-portal-session    → Stripe Customer Portal  │
└───────────────────────┬────────────────────────────┘
                        │ Stripe SDK (via esm.sh)
┌───────────────────────┴────────────────────────────┐
│                   Stripe API                        │
│                                                     │
│  Products: colabs_pro, colabs_pro_plus              │
│  Prices: $20/mo recurring, $30/mo recurring        │
│  Customers: mapped to Supabase user_id              │
│  Webhooks: POST → stripe-webhook edge function     │
└────────────────────────────────────────────────────┘
```

---

## Stripe Products and Prices

Create the following in the Stripe Dashboard (or via a one-time setup edge function):

| Product     | Metadata key              | Price      | Interval |
| ----------- | ------------------------- | ---------- | -------- |
| Colabs Pro  | `colabs_plan: "pro"`      | $20.00 USD | Monthly  |
| Colabs Pro+ | `colabs_plan: "pro_plus"` | $30.00 USD | Monthly  |

Add metadata to each Stripe Product:

```json
{
  "colabs_plan": "pro"
}
```

The webhook handler reads this metadata to determine which plan to activate after payment.

---

## Subscription Checkout Flow

### Step 1: User clicks "Upgrade" on the Pricing page

```tsx
// src/pages/Pricing.tsx — handleSelectPlan()
// TODO: Replace toast placeholder with actual Stripe checkout
const [isCheckingOut, setIsCheckingOut] = useState(false);

const handleSelectPlan = async (planKey: 'pro' | 'pro_plus') => {
  if (isCheckingOut) return;
  setIsCheckingOut(true);

  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: { planKey },
    });

    if (error || !data.url) {
      toast.error('Could not start checkout. Please try again.');
      return;
    }

    window.location.href = data.url;
  } finally {
    setIsCheckingOut(false);
  }
};
```

### Step 2: Edge function creates a Checkout Session

```typescript
// supabase/functions/create-checkout-session/index.ts
// TODO: Implement this edge function
//
// 1. Authenticate user via JWT
// 2. Look up or create a Stripe Customer for this user
//    - Store stripe_customer_id in user_subscriptions for future lookups
// 3. Create a Stripe Checkout Session:
//    - mode: 'subscription'
//    - price_id: based on planKey (Pro or Pro+ price ID)
//    - success_url: {origin}/pricing?session_id={CHECKOUT_SESSION_ID}
//    - cancel_url: {origin}/pricing
//    - metadata: { user_id, plan: planKey }
//    - customer: stripe_customer_id
// 4. Return { url: session.url }
```

### Step 3: User completes payment on Stripe

Stripe handles PCI compliance, card validation, and 3D Secure. No card data touches Colabs servers.

### Step 4: Stripe webhook fires → edge function updates the database

See [Webhook Handling](#webhook-handling).

### Step 5: User is redirected back → UI refreshes

On the success URL, `useSubscription()` refetches via React Query.

> **Important:** Stripe webhook delivery is asynchronous. The user may land on the success page before the `stripe-webhook` edge function has finished processing. Do not assume the subscription record has already been updated. The success page should either:
>
> - Poll `useSubscription()` with a short refetch interval until `plan` changes from `'starter'`, or
> - Display a "processing" state and let React Query's background refetch pick it up.

Never show confirmed plan upgrade UI until `useSubscription()` actually returns the new plan.

---

## Webhook Handling

### Edge function: `stripe-webhook/index.ts`

```typescript
// supabase/functions/stripe-webhook/index.ts
// TODO: Implement this edge function
//
// CRITICAL RULES:
// 1. This is the ONLY source of truth for subscription state changes.
//    Never trust client-side plan changes — only webhook-confirmed updates.
// 2. Always verify the webhook signature before processing any event.
//    Use STRIPE_WEBHOOK_SECRET and stripe.webhooks.constructEvent().
// 3. Return HTTP 200 even on non-fatal errors to prevent Stripe retry loops.
//    Log the error but do not return 4xx/5xx unless signature verification fails.
// 4. Use the service role key for DB updates — this bypasses RLS.
//
// Events to handle:
//
//   checkout.session.completed
//   Payment just succeeded. Activate the plan.
//   The authoritative expiry comes from Stripe's subscription object, NOT a fixed interval.
//   INSERT INTO user_subscriptions (user_id, plan, status, started_at, expires_at, stripe_subscription_id)
//   VALUES (
//     metadata.user_id,
//     metadata.colabs_plan,
//     'active',
//     now(),
//     to_timestamp(subscription.current_period_end),   -- from Stripe payload
//     subscription.id
//   )
//   ON CONFLICT (user_id) DO UPDATE
//     SET plan = EXCLUDED.plan, status = 'active',
//         started_at = now(),
//         expires_at = to_timestamp(subscription.current_period_end),
//         stripe_subscription_id = EXCLUDED.stripe_subscription_id
//
// invoice.payment_succeeded
//   Recurring renewal succeeded. Extend expiry using Stripe's period end.
//   UPDATE user_subscriptions
//     SET expires_at = to_timestamp(subscription.current_period_end), status = 'active'
//     WHERE stripe_subscription_id = subscription.id
//
// invoice.payment_failed
//   Renewal payment failed. Stripe retries automatically.
//   Optionally: update status = 'past_due', send notification email.
//
// customer.subscription.deleted
//   Subscription cancelled at end of billing period.
//   UPDATE user_subscriptions
//     SET plan = 'starter', status = 'active', expires_at = NULL
//     WHERE stripe_subscription_id = subscription.id
//
// customer.subscription.updated
//   Plan changed mid-cycle (upgrade or downgrade).
//   Update plan and expires_at based on new price metadata.
```

### Webhook URL configuration

After deploying the `stripe-webhook` edge function, add the webhook in the Stripe Dashboard:

```
Webhook URL: https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook

Events to listen for:
  - checkout.session.completed
  - invoice.payment_succeeded
  - invoice.payment_failed
  - customer.subscription.deleted
  - customer.subscription.updated
```

### `supabase/config.toml` entry

```toml
# stripe-webhook receives raw POST from Stripe — not JWT-authenticated
[functions.stripe-webhook]
verify_jwt = false

# All other Stripe functions require an authenticated user
[functions.create-checkout-session]
verify_jwt = true

[functions.create-portal-session]
verify_jwt = true
```

---

## Marketplace Payments

`src/pages/Checkout.tsx` currently simulates payments with a fake delay and a mock transaction ID. This must be replaced with real Stripe integration in Phase 2.

**Recommended approach:** Stripe Checkout (hosted). Avoids handling card data and is PCI compliant by default.

```typescript
// supabase/functions/create-marketplace-checkout/index.ts
// TODO: Implement for one-time project purchases
//
// 1. Authenticate user
// 2. Create a Stripe Checkout Session:
//    - mode: 'payment' (one-time, not subscription)
//    - line_items: [{ price_data: { unit_amount, currency, product_data } }]
//    - success_url: {origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}
//    - cancel_url: {origin}/checkout
//    - metadata: { user_id, project_id }
// 3. On webhook confirmation (checkout.session.completed):
//    - Insert into purchases table
//    - Grant access to the project
```

---

## Edge Functions Required

| Function                      | Purpose                                              | JWT | Status  |
| ----------------------------- | ---------------------------------------------------- | --- | ------- |
| `create-checkout-session`     | Creates Stripe Checkout Session for subscriptions    | Yes | ❌ TODO |
| `stripe-webhook`              | Receives Stripe events, updates `user_subscriptions` | No  | ❌ TODO |
| `create-portal-session`       | Opens Stripe Customer Portal for billing management  | Yes | ❌ TODO |
| `create-marketplace-checkout` | Creates Stripe Checkout for one-time purchases       | Yes | ❌ TODO |

### Edge function template for Stripe functions

```typescript
import Stripe from 'https://esm.sh/stripe@14.x?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Stripe Idempotency Keys to prevent double-charging on retries
// const session = await stripe.checkout.sessions.create(params, {
//   idempotencyKey: `checkout_${user.id}_${planKey}`,
// });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ... implementation
  } catch (error) {
    console.error('Stripe function error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Database Changes Required

### Add Stripe columns to `user_subscriptions`

```sql
-- Migration: add_stripe_columns_to_user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN stripe_price_id TEXT;

CREATE INDEX idx_user_subs_stripe_customer
  ON public.user_subscriptions(stripe_customer_id);

CREATE INDEX idx_user_subs_stripe_subscription
  ON public.user_subscriptions(stripe_subscription_id);
```

### Add `purchases` table for marketplace payments

```sql
-- Migration: create_purchases_table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | completed | refunded
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

| File                               | What to add                                        | Priority |
| ---------------------------------- | -------------------------------------------------- | -------- |
| `src/pages/Pricing.tsx`            | Replace toast with `create-checkout-session` call  | High     |
| `src/hooks/useSubscription.tsx`    | Add refetch on return from Stripe checkout         | High     |
| `src/components/UpgradePrompt.tsx` | Wire "Upgrade" button to checkout flow             | High     |
| `src/pages/Checkout.tsx`           | Replace mock payment with Stripe Checkout redirect | Medium   |
| `src/pages/PurchaseSuccess.tsx`    | Verify `session_id` with Stripe on load            | Medium   |
| `src/pages/Settings.tsx`           | Add "Manage Billing" button → Customer Portal      | Low      |

### NPM packages to install when implementing

```bash
npm install @stripe/stripe-js
# @stripe/react-stripe-js — only needed if using embedded Stripe Elements
```

---

## Security Considerations

| Concern                    | Mitigation                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stripe secret key exposure | Stored as Supabase secret — only used inside edge functions via `Deno.env.get()`                                                                  |
| Webhook replay attacks     | The `constructEvent` method uses a timestamp in the signature. Reject payloads where the `Stripe-Signature` timestamp is more than 5 minutes old. |
| Rate-limit / DoS           | Implement per-user rate limiting for `create-checkout-session` using database-backed transaction counters.                                        |
| Double-charging            | Use Stripe idempotency keys in `create-checkout-session`.                                                                                         |
| PCI compliance             | Use Stripe Checkout (hosted). Colabs never touches raw PAN data.                                                                                  |

---

## Testing Checklist

| Checkout flow (test mode) | Use `sk_test_` keys + Stripe test cards | ❌ TODO |
| Webhook receives events | `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook` | ❌ TODO |
| Subscription lifecycle | Test: cancel -> grace period -> expired -> auto-demotion | ❌ TODO |
| Plan upgrade reflected in UI | Check `useSubscription()` after webhook fires | ❌ TODO |
| Replay attack protection | Re-send a valid webhook payload manually; expect 400 after 5m | ❌ TODO |
| Marketplace purchase flow | Test one-time payment + `purchases` record | ❌ TODO |
| Failed payment handling | Use test card `4000 0000 0000 0002` | ❌ TODO |
| Webhook signature verification | Send a tampered payload — expect 400 | ❌ TODO |

### Stripe test cards

```
Success:             4242 4242 4242 4242
Requires 3D Secure:  4000 0025 0000 3155
Declined:            4000 0000 0000 0002
Insufficient funds:  4000 0000 0000 9995
```

---

## Implementation Order

1. Add Stripe secrets via `npx supabase secrets set`
2. Create `create-checkout-session` edge function
3. Update `Pricing.tsx` to call the checkout session function
4. Create `stripe-webhook` edge function
5. Configure webhook URL in Stripe Dashboard
6. Run the database migration to add Stripe columns
7. Test end-to-end in test mode with Stripe CLI
8. Create `create-portal-session` for billing management
9. Update `Checkout.tsx` for marketplace one-time payments
10. Switch to `sk_live_` keys for production
