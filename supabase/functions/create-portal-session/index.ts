/**
 * Edge Function: create-portal-session
 *
 * Opens a Stripe Customer Portal session for the authenticated user.
 * The portal allows users to:
 *   - Update payment methods
 *   - View and download invoices
 *   - Cancel or modify their subscription
 *   - View billing history
 *
 * ──────────────────────────────────────────────────────────────────
 * TODO: STRIPE INTEGRATION — activate this function when Stripe is set up
 * ──────────────────────────────────────────────────────────────────
 *
 * REQUIRED SECRETS (add via Lovable secrets panel):
 *   STRIPE_SECRET_KEY      — sk_live_... or sk_test_...
 *   STRIPE_WEBHOOK_SECRET  — whsec_... (for stripe-webhook fn, not this one)
 *
 * REQUIRED DB COLUMN (run migration first):
 *   ALTER TABLE public.user_subscriptions ADD COLUMN stripe_customer_id TEXT;
 *
 * HOW IT WORKS:
 *   1. User clicks "Manage Billing" in Settings → Billing
 *   2. Frontend calls this edge function with the user's JWT
 *   3. Function looks up the user's stripe_customer_id from user_subscriptions
 *   4. Creates a Stripe Customer Portal session for that customer
 *   5. Returns { url } — frontend redirects user to Stripe's hosted portal
 *   6. After managing billing, Stripe redirects back to return_url
 *
 * See docs/STRIPE_INTEGRATION.md for the complete implementation plan.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Authentication ──────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims(token);

  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub;

  // ── TODO: Activate when STRIPE_SECRET_KEY secret is configured ──
  // Uncomment the block below after:
  //   1. Adding STRIPE_SECRET_KEY via the Lovable secrets panel
  //   2. Running the migration to add stripe_customer_id column
  //   3. Updating supabase/config.toml (already done in the TODO block)

  /*
  import Stripe from "https://esm.sh/stripe@14.x?target=deno";

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  // Fetch the user's stripe_customer_id from the DB
  // (requires stripe_customer_id column on user_subscriptions)
  const { data: sub, error: subError } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id, plan")
    .eq("user_id", userId)
    .maybeSingle();

  if (subError || !sub?.stripe_customer_id) {
    // User has no Stripe customer yet — they're on the free Starter plan
    // and have never paid. Direct them to the pricing page to upgrade first.
    return new Response(
      JSON.stringify({
        error: "no_customer",
        message: "No billing account found. Please upgrade to a paid plan first.",
      }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Parse return_url from request body (falls back to pricing page)
  const { return_url } = await req.json().catch(() => ({}));
  const portalReturnUrl = return_url || `${req.headers.get("origin")}/settings?section=billing`;

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: portalReturnUrl,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
  */

  // ── Temporary placeholder response (remove when Stripe is active) ──
  return new Response(
    JSON.stringify({
      error: "stripe_not_configured",
      message:
        "Stripe integration is not yet configured. Add your STRIPE_SECRET_KEY secret and enable the integration to use this feature.",
    }),
    {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
