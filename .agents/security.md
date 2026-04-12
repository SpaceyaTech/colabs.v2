# Security agent — Colabs

You are reviewing or writing code that touches security-sensitive surfaces in Colabs. This file covers every layer of the security model: RLS, authentication, secrets, input validation, file uploads, OAuth token handling, webhook verification, and the planned Stripe integration.

Read `docs/SECURITY.md` for the disclosure policy and the current security measures inventory.
General project rules are in `docs/AGENTS.md`.

---

## Table of Contents

- [Security model overview](#security-model-overview)
- [Threat model](#threat-model)
- [RLS — the primary defence layer](#rls--the-primary-defence-layer)
- [Authentication and session security](#authentication-and-session-security)
- [OAuth token handling](#oauth-token-handling)
- [Secrets management](#secrets-management)
- [Input validation and sanitisation](#input-validation-and-sanitisation)
- [File upload security](#file-upload-security)
- [Edge function security](#edge-function-security)
- [Webhook verification](#webhook-verification)
- [XSS prevention](#xss-prevention)
- [IDOR prevention](#idor-prevention)
- [Subscription and payment security](#subscription-and-payment-security)
- [Content Security Policy](#content-security-policy)
- [Security review checklist](#security-review-checklist)
- [How to report a vulnerability](#how-to-report-a-vulnerability)
- [Security anti-patterns](#security-anti-patterns)

---

## Security model overview

Colabs is a client-only SPA. There is no application server sitting between the browser and Supabase. The complete security architecture is:

```
Browser (React SPA)
  │
  │  JWT in Authorization header on every request
  ▼
Supabase API gateway
  │
  │  PostgreSQL evaluates RLS policies against auth.uid()
  ▼
Database rows the policy allows — nothing else

Browser (React SPA)
  │
  │  JWT + body via supabase.functions.invoke()
  ▼
Deno Edge Function
  │
  │  Verifies JWT manually
  │  Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) for privileged writes
  ▼
External APIs (GitHub, Stripe)
```

**Consequences of this architecture:**

- RLS is the only thing preventing one authenticated user from reading another user's data in direct queries. If an RLS policy is wrong, there is no fallback layer.
- The service role key bypasses every RLS policy on every table. It must never reach the browser.
- Edge functions are trusted because Supabase infrastructure controls them. They must still verify the user's identity before acting — the service role key grants DB access but does not prove who the caller is.

---

## Threat model

These are the realistic attack surfaces for Colabs. Know them before reviewing any PR.

| Threat                    | Surface                                                     | Impact if exploited                                                                                  |
| ------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| RLS bypass                | Any table with incorrect policy                             | Full access to another user's data — proposals, claimed issues, team membership, subscription status |
| Access token leakage      | `github_integrations.access_token`                          | Attacker controls victim's GitHub account — can push code, read private repos                        |
| Subscription self-upgrade | `user_subscriptions` UPDATE policy                          | Attacker unlocks Pro/Pro+ features without paying                                                    |
| IDOR                      | Any resource ID in URL parameters                           | Access to other users' proposals, resumes, gigs, org data                                            |
| XSS via user content      | Any field rendered as HTML or via `dangerouslySetInnerHTML` | Session hijacking, credential theft, phishing                                                        |
| File upload abuse         | Supabase Storage                                            | Path traversal, malicious file execution if served without content-type enforcement                  |
| Webhook spoofing          | Stripe webhook endpoint                                     | Fake payment confirmation → free subscription upgrade                                                |
| OAuth state CSRF          | GitHub OAuth callback                                       | Account takeover via forged OAuth flow                                                               |
| Secret exposure           | Any `VITE_` env variable                                    | Attacker reads secrets bundled in the client JS                                                      |
| JWT manipulation          | Auth header on edge function calls                          | Bypass authorization checks if JWT not properly verified                                             |
| Open redirect             | OAuth `redirectTo` parameter                                | Phishing via trusted domain redirect                                                                 |

---

## RLS — the primary defence layer

### The rule with no exceptions

Every table must have `ENABLE ROW LEVEL SECURITY` and at least one policy. A table with RLS enabled but no policies returns zero rows to everyone — which looks like a bug, not a security measure, and gets "fixed" by disabling RLS.

```sql
-- ✅ Every migration that creates a table must include this
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy name"
  ON public.your_table
  USING ( /* filter condition */ )
  WITH CHECK ( /* insert/update condition */ );
```

### Verify policies exist before merging

```sql
-- Run this after applying a migration — every table should have at least one row
SELECT
  t.tablename,
  count(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY t.tablename
HAVING count(p.policyname) = 0;
-- This query must return zero rows
```

### Policy USING vs WITH CHECK

Both clauses must be correct. `USING` filters rows returned by SELECT and targeted by UPDATE/DELETE. `WITH CHECK` validates rows on INSERT and UPDATE.

```sql
-- ✅ Both clauses protect the row lifecycle correctly
CREATE POLICY "Users manage own gigs"
  ON public.gigs FOR ALL
  USING (auth.uid() = creator_id)           -- filters reads and write targets
  WITH CHECK (auth.uid() = creator_id);     -- validates new/updated rows

-- ⚠️  Missing WITH CHECK — users can INSERT rows for other users
CREATE POLICY "Users manage own gigs"
  ON public.gigs FOR ALL
  USING (auth.uid() = creator_id);          -- no WITH CHECK
```

### Never use inline subqueries in RLS policies

Inline subqueries referencing protected tables from within a policy on that same table cause recursive RLS evaluation:

```sql
-- ❌ Recursive — evaluating this policy requires querying team_members,
--    which triggers THIS policy again
CREATE POLICY "Team members can access"
  ON public.team_projects FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = team_projects.team_id
    )
  );

-- ✅ Security definer function breaks the recursion
CREATE POLICY "Team members can access"
  ON public.team_projects FOR SELECT
  USING (is_team_member(auth.uid(), team_id));
```

### Separation between SELECT policies

When splitting policies by operation (SELECT, INSERT, UPDATE, DELETE), verify they cannot be combined to produce an unexpected result. A permissive SELECT policy does not restrict writes.

### The service role key bypasses everything

```typescript
// This client ignores every RLS policy on every table
const adminClient = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// ← Any query on adminClient has unrestricted access
// ← The edge function MUST implement its own authorization before using adminClient
```

Before every write using the service role client, verify the caller is who they claim to be:

```typescript
// ✅ Verify the JWT first — get the actual user_id
const {
  data: { user },
  error,
} = await adminClient.auth.getUser(token);
if (error || !user) return unauthorizedResponse();

// NOW safe to use adminClient with the verified user.id
await adminClient.from('gigs').update({ status: 'active' }).eq('creator_id', user.id); // still scope to the verified user
```

---

## Authentication and session security

### JWT verification in edge functions

Every authenticated edge function must verify the JWT before any action. Never trust the request body for user identity.

```typescript
// ✅ Verify the token — extract real user_id from JWT
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

const token = authHeader.replace('Bearer ', '');
const {
  data: { user },
  error,
} = await supabase.auth.getUser(token);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// user.id is now verified — safe to use as the actor's identity
```

### OAuth state parameter (CSRF protection)

The GitHub integration OAuth flow uses a `state` parameter to prevent CSRF. Verify it on the callback:

```typescript
// When initiating OAuth — generate and store a state value
const state = crypto.randomUUID();
sessionStorage.setItem('oauth_state', state);

const authorizeUrl =
  `https://github.com/login/oauth/authorize?` +
  `client_id=${clientId}&scope=repo,user:email&state=${state}`;

// On callback — verify the state matches before exchanging the code
const returnedState = new URL(window.location.href).searchParams.get('state');
const storedState = sessionStorage.getItem('oauth_state');

if (!returnedState || returnedState !== storedState) {
  throw new Error('OAuth state mismatch — possible CSRF attack');
}
sessionStorage.removeItem('oauth_state');
```

### Open redirect prevention

The OAuth `redirectTo` parameter must always resolve to the application's own origin. Never pass a `redirectTo` value from user-controlled input.

```typescript
// ✅ Hardcoded application URL
await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: { redirectTo: `${import.meta.env.VITE_APP_URL}/dashboard` },
});

// ❌ User-supplied redirect — open redirect vulnerability
const next = new URLSearchParams(window.location.search).get('next');
await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: { redirectTo: next }, // attacker can set next=https://evil.com
});
```

If you need to redirect to a path after login, validate the path is relative (starts with `/`) and matches a known route:

```typescript
const ALLOWED_REDIRECTS = ['/dashboard', '/marketplace', '/issues', '/profile'];

function safeRedirect(next: string | null): string {
  if (!next) return '/dashboard';
  if (ALLOWED_REDIRECTS.includes(next)) return next;
  return '/dashboard';
}
```

### Session expiry handling

When `AuthProvider` detects a 401 response (expired session), redirect to `/sign-in` with a `?redirect` param so the user returns to their original page after re-authenticating. Never silently fail.

---

## OAuth token handling

The `access_token` column in `github_integrations` is the highest-sensitivity credential in the database. It grants write access to the user's GitHub repositories.

### Column must never be returned to the client

```typescript
// ❌ Never — SELECT * on this table returns access_token
supabase.from('github_integrations').select('*');

// ✅ Always explicit columns — access_token excluded
supabase
  .from('github_integrations')
  .select('id, user_id, github_username, avatar_url, is_active, github_user_id')
  .eq('user_id', userId)
  .single();
```

**RLS does not filter columns — it filters rows.** There is no way to use a policy to hide a specific column from a query that explicitly selects it. Protection for `access_token` is enforced entirely at the query level:

````typescript
// ✅ Never include access_token in any client-side SELECT list
supabase
  .from('github_integrations')
  .select('id, user_id, github_username, avatar_url, is_active, github_user_id')
  .eq('user_id', userId)
  .single();

### Token reads inside edge functions only

Any code path that needs to call the GitHub API on behalf of a user must do so inside a Deno edge function using the service role client:

```typescript
// ✅ Inside edge function only — service role bypasses RLS to read the token
const { data: integration } = await adminClient
  .from('github_integrations')
  .select('access_token, github_username')
  .eq('user_id', verifiedUserId)
  .eq('is_active', true)
  .single();

// Use the token only within this function — never return it in the response
const response = await fetch('https://api.github.com/repos/...', {
  headers: { Authorization: `Bearer ${integration.access_token}` },
});

// Return only the data the client needs — never the token
return new Response(JSON.stringify({ repos: data }));
````

### Token deletion on disconnect

When a user disconnects their GitHub integration, the token must be deleted or invalidated — not just `is_active = false`:

```sql
-- Preferred: delete the token value while keeping the audit record
UPDATE public.github_integrations
SET access_token = null,
    is_active = false,
    updated_at = now()
WHERE user_id = :user_id;
```

---

## Secrets management

### Classification of all secrets

| Secret                        | Sensitivity  | Location                           | Accessible by                     |
| ----------------------------- | ------------ | ---------------------------------- | --------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`   | Critical     | Edge function env (auto)           | Edge functions only               |
| `GITHUB_CLIENT_SECRET`        | High         | `npx supabase secrets set`         | `github-oauth` edge function only |
| `STRIPE_SECRET_KEY`           | Critical     | `npx supabase secrets set`         | Stripe edge functions only        |
| `STRIPE_WEBHOOK_SECRET`       | High         | `npx supabase secrets set`         | `stripe-webhook` only             |
| `SUPABASE_ANON_KEY`           | Low (public) | `.env` as `VITE_SUPABASE_ANON_KEY` | Client — this is intentional      |
| `VITE_GITHUB_CLIENT_ID`       | Low (public) | `.env`                             | Client — this is intentional      |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Low (public) | `.env`                             | Client — this is intentional      |

### The `VITE_` prefix rule

Vite bundles every `VITE_` prefixed variable into the client JavaScript bundle. That bundle is publicly readable by anyone who visits the site. **Only publishable, non-secret values may use the `VITE_` prefix.**

```bash
# ✅ Safe — publishable keys
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GITHUB_CLIENT_ID=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_APP_URL=...

# ❌ Never — these must go through supabase secrets set
VITE_GITHUB_CLIENT_SECRET=...
VITE_STRIPE_SECRET_KEY=...
VITE_SUPABASE_SERVICE_ROLE_KEY=...
```

### Setting edge function secrets

```bash
npx supabase secrets set GITHUB_CLIENT_SECRET=your-secret
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### Rotation policy

From `docs/SECURITY.md`: secrets must be rotated every 90 days and immediately after any suspected exposure.

When rotating:

1. Generate the new secret in the provider (GitHub / Stripe dashboard)
2. `npx supabase secrets set KEY=new-value`
3. Redeploy all affected edge functions: `npx supabase functions deploy function-name`
4. Verify the new secret works before revoking the old one

### Detecting accidental secret commits

The CI `security.yml` workflow runs Gitleaks on every PR. It scans the full git history — a secret added in one commit and removed in a later commit is still flagged.

If a secret is accidentally committed:

1. Rotate the secret immediately — the git history is public
2. Force-push to remove the commit is not enough — forks and caches may already have it
3. File a GitHub Security Advisory via the private channel in `docs/SECURITY.md`

---

## Input validation and sanitisation

### All user input goes through Zod

Every form field, URL parameter, and request body must be validated against a Zod schema before use.

```typescript
// Client-side form validation
const createGigSchema = z.object({
  title: z.string().min(1).max(100),
  budget_value: z.number().int().positive().max(1_000_000),
  difficulty: z.enum(['entry', 'intermediate', 'expert']),
  technologies: z.array(z.string().min(1)).min(1).max(20),
  duration: z.string().min(1).max(50),
});

// Edge function body validation — same approach in Deno
const bodySchema = z.object({
  repositoryIds: z.array(z.string().uuid()).min(1).max(100),
  allowCollaboration: z.boolean(),
});

const parsed = bodySchema.safeParse(await req.json());
if (!parsed.success) {
  return new Response(
    JSON.stringify({ error: 'Invalid request body', details: parsed.error.flatten() }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### URL parameters and path segments

Never use a URL parameter as a raw database value without validation:

```typescript
// ❌ Raw URL param passed to query — SQL injection via Supabase's text encoding
const gigId = params.id;
supabase.from('gigs').select().eq('id', gigId);

// ✅ Validate UUID format first
const gigId = z.string().uuid().parse(params.id);
supabase.from('gigs').select().eq('id', gigId);
```

### Numeric values

Always validate budget, amounts, and counts are within expected bounds. Postgres will enforce the column type but validation should happen before the query:

```typescript
z.number().int().positive().max(10_000_000); // $10M max budget — prevents overflow exploits
```

---

## File upload security

### Three-layer validation

Every file upload must validate all three layers. Validating only one is insufficient.

```typescript
// Layer 1: MIME type (from browser — can be spoofed, but filters basic cases)
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
  throw new Error(`File type not allowed: ${file.type}`);
}

// Layer 2: File extension
const ext = file.name.split('.').pop()?.toLowerCase();
const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if (!ext || !ALLOWED_IMAGE_EXT.includes(ext)) {
  throw new Error('File extension not allowed');
}

// Layer 3: File size
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
if (file.size > MAX_IMAGE_BYTES) {
  throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 2 MB.`);
}
```

### Filename sanitisation — prevent path traversal

User-supplied filenames can contain path traversal sequences: `../../etc/passwd`, `../../../admin`. Always replace the filename with a UUID:

```typescript
// ✅ UUID-based name — user has no control over the storage path
function sanitizeFilename(original: string): string {
  const ext = original.split('.').pop()?.toLowerCase() ?? 'bin';
  return `${crypto.randomUUID()}.${ext}`;
}

const storagePath = `${verifiedUserId}/${sanitizeFilename(file.name)}`;
```

### Private bucket access for resumes

Resumes are private to their owner. Access must use time-limited signed URLs — never a permanent public URL:

```typescript
// ✅ Signed URL expires in 1 hour — prevents link sharing
const { data: signedUrl } = await supabase.storage
  .from('resumes')
  .createSignedUrl(resumePath, 3600); // 3600 seconds = 1 hour

// ❌ Never — permanent URL bypasses the private bucket access control
const { data: publicUrl } = supabase.storage.from('resumes').getPublicUrl(resumePath);
```

### Storage RLS policies

Verify storage RLS policies restrict access correctly:

```sql
-- resumes bucket — owner only
CREATE POLICY "Users can upload own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Edge function security

### Standard authorization pattern

```typescript
// Step 1 — Reject requests without an Authorization header immediately
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Step 2 — Verify the token with Supabase Auth
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
if (authError || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Step 3 — Verify the user is allowed to perform this specific action
// e.g. verify they own the resource they are trying to modify
const { data: gig } = await adminClient.from('gigs').select('creator_id').eq('id', gigId).single();

if (gig?.creator_id !== user.id) {
  return new Response(JSON.stringify({ error: 'Forbidden' }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

### Never expose internal errors

```typescript
// ❌ Leaks implementation details — attacker learns your schema
return new Response(
  JSON.stringify({ error: error.message }), // e.g. "column github_integrations.access_token does not exist"
  { status: 500 }
);

// ✅ Generic message — log internally, return safe response
console.error(`[github-issues] Error for user ${user.id}:`, error.message);
return new Response(JSON.stringify({ error: 'Internal server error' }), {
  status: 500,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
```

### Rate limiting edge functions

Edge functions do not have built-in rate limiting. For sensitive operations (OAuth exchange, file operations), add a simple per-user rate check using the database:

```typescript
// Check: has this user called this function more than N times in the last M minutes?
const { count } = await adminClient
  .from('rate_limit_log')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('function_name', 'github-oauth')
  .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

if ((count ?? 0) >= 5) {
  return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in 15 minutes.' }), {
    status: 429,
  });
}
```

---

## Webhook verification

### Stripe webhook — signature must be verified first

The Stripe webhook endpoint (`stripe-webhook`) sets `verify_jwt = false` — it receives raw POST requests from Stripe. This means anyone on the internet can POST to it. Signature verification is the only thing distinguishing a real Stripe event from an attacker's request.

```typescript
// ✅ Verify signature BEFORE reading or acting on any data
const sig = req.headers.get('stripe-signature');
if (!sig) {
  return new Response('Missing stripe-signature header', { status: 400 });
}

let event: Stripe.Event;
try {
  event = await stripe.webhooks.constructEventAsync(
    await req.text(), // raw body — must be read BEFORE parsing as JSON
    sig,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  );
} catch (err) {
  console.error('Webhook signature verification failed:', err.message);
  return new Response(`Webhook signature invalid: ${err.message}`, { status: 400 });
}

// Only now is it safe to process the event
switch (event.type) {
  case 'checkout.session.completed':
  // ...
}
```

### Return 200 on non-fatal errors

Stripe retries webhook delivery when it receives a non-200 response. This can cause duplicate processing (double-charging, double-activation). Always return 200 except for signature failures:

```typescript
try {
  // verify signature (can return 400 on failure)
  // process event
  return new Response(JSON.stringify({ received: true }), { status: 200 });
} catch (processingError) {
  // Log but DO NOT return 4xx/5xx — Stripe would retry
  console.error('Event processing error:', processingError.message);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

### Idempotency

Stripe can deliver the same event more than once. Handle duplicate events gracefully:

```typescript
// Use the Stripe event ID to check for duplicates
const { data: existing } = await adminClient
  .from('processed_stripe_events')
  .select('id')
  .eq('stripe_event_id', event.id)
  .single();

if (existing) {
  // Already processed — return 200 without re-processing
  return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
}

// Process the event, then record it
await adminClient.from('processed_stripe_events').insert({ stripe_event_id: event.id });
```

---

## XSS prevention

### React is safe by default — but has escape hatches

React's JSX template engine escapes all string values. The only XSS risks are explicit escape hatches:

```tsx
// ❌ Direct HTML injection — allows XSS if content is user-controlled
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Sanitise with DOMPurify before using dangerouslySetInnerHTML
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ Even better — render plain text, not HTML
<p>{userContent}</p>
```

### Never render markdown as raw HTML

If the project adds markdown rendering in future, always sanitise after parsing:

```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const safeHtml = DOMPurify.sanitize(marked.parse(markdownContent));
```

### URL values from user input

Never set `href` or `src` from user input without validation. `javascript:` URIs are valid URLs:

```tsx
// ❌ Allows href="javascript:alert(1)"
<a href={userProvidedUrl}>Portfolio</a>;

// ✅ Validate URL scheme before rendering
function safeSrc(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

<a href={safeSrc(userProvidedUrl)}>Portfolio</a>;
```

---

## IDOR prevention

Insecure Direct Object Reference — accessing another user's resource by changing an ID in a URL or request body.

### RLS is the primary defence

For direct Supabase queries, RLS prevents IDOR automatically if policies are correct. An attacker changing `gigId` in a request gets an empty result — not the other user's gig.

### Edge functions need explicit owner checks

Edge functions bypass RLS (service role key). They must explicitly check ownership:

```typescript
// ❌ Trusts the caller-supplied gigId without ownership check
const { data: gig } = await adminClient.from('gigs').select('*').eq('id', body.gigId).single();

// ✅ Verify the authenticated user owns the resource
const { data: gig } = await adminClient
  .from('gigs')
  .select('id, title, creator_id')
  .eq('id', body.gigId)
  .eq('creator_id', user.id) // ownership enforced at query level
  .single();

if (!gig) {
  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  // Return 404, not 403 — don't confirm the resource exists
}
```

### Returning 404 vs 403

When a user tries to access a resource they don't own, return `404 Not Found`, not `403 Forbidden`. Returning 403 confirms the resource exists — 404 reveals nothing.

---

## Subscription and payment security

### Plan upgrades are webhook-only

The `user_subscriptions` table has a client-side UPDATE policy (for cancellation). This must never be used for plan upgrades. If a user could set `plan = 'pro'` via the client, they would get Pro features without paying.

```sql
-- ✅ The UPDATE policy should ONLY allow cancellation
-- Not plan upgrades or status changes to 'active'
CREATE POLICY "Users can cancel own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'cancelled'           -- can only set status to cancelled
    -- NOT: plan changes are blocked at the policy level
  );
```

Upgrades happen exclusively through the Stripe webhook handler using the service role key, after verifying the Stripe event signature.

### Price IDs are server-side constants

The `create-checkout-session` edge function determines the Stripe price ID from the plan name — it does not accept a `priceId` from the request body. A client cannot manipulate the price by sending a different ID.

```typescript
// ✅ Server determines price — client only sends plan name
const PRICE_IDS: Record<string, string> = {
  pro: Deno.env.get('STRIPE_PRICE_PRO')!,
  pro_plus: Deno.env.get('STRIPE_PRICE_PRO_PLUS')!,
};

const planKey = z.enum(['pro', 'pro_plus']).parse(body.planKey);
const priceId = PRICE_IDS[planKey]; // attacker cannot override this

// ❌ Never accept priceId from the client
const priceId = body.priceId; // attacker sets this to a $0 price
```

---

## Content Security Policy

A CSP header is configured for production deployment. When adding new features, verify they do not require relaxing the policy.

Common CSP violations to watch for:

| Violation     | Common cause                          | Fix                                                    |
| ------------- | ------------------------------------- | ------------------------------------------------------ |
| `script-src`  | Inline `<script>` tag or `eval()`     | Use external scripts; avoid `eval()`                   |
| `style-src`   | Inline `style={}` with dynamic values | Use CSS classes; avoid runtime style injection         |
| `connect-src` | New API endpoint not in the allowlist | Add the domain to `connect-src` in the CSP config      |
| `img-src`     | External avatar URL not in allowlist  | Add GitHub/Supabase CDN domains to `img-src`           |
| `frame-src`   | Stripe.js iframes                     | `stripe.com` must be in `frame-src` when adding Stripe |

When Stripe is implemented, the CSP must include:

```
script-src 'self' https://js.stripe.com;
frame-src https://js.stripe.com;
connect-src 'self' https://api.stripe.com;
```

---

## Security review checklist

Use this checklist on every PR that touches auth, database, edge functions, file uploads, or payments.

### Database / RLS

- [ ] Every new table has `ENABLE ROW LEVEL SECURITY`
- [ ] Every new table has at least one policy
- [ ] No policy uses inline subqueries — security definer functions used instead
- [ ] All policies have both `USING` and `WITH CHECK` where applicable
- [ ] `github_integrations` is never queried with `SELECT *`
- [ ] No `access_token` column appears in any SELECT

### Secrets and environment

- [ ] No new `VITE_` variables contain secrets
- [ ] New secrets are documented in `docs/SETUP.md` and `.env.example`
- [ ] Edge function secrets set via `npx supabase secrets set`
- [ ] `.env` file is not committed (check `.gitignore`)

### Edge functions

- [ ] JWT verified before any action
- [ ] Ownership verified before any resource modification
- [ ] Error responses return generic messages — no internal details
- [ ] No `access_token` returned in any response body
- [ ] CORS headers present on all responses including errors

### Webhooks

- [ ] Stripe webhook verifies signature before processing
- [ ] Non-fatal errors return 200 to prevent retry loops
- [ ] Idempotency check using event ID

### File uploads

- [ ] MIME type checked against allowlist
- [ ] File extension checked against allowlist
- [ ] File size checked against limit
- [ ] Filename replaced with UUID — user has no control over storage path
- [ ] Private files (resumes) accessed via signed URLs only

### Auth / OAuth

- [ ] `redirectTo` parameter is a hardcoded application URL
- [ ] OAuth `state` parameter generated and verified
- [ ] No user-controlled values passed to `redirectTo`
- [ ] Session expiry handled with redirect to sign-in

### Payments

- [ ] Plan upgrades only through verified Stripe webhook
- [ ] Price IDs are server-side constants — not client-supplied
- [ ] `user_subscriptions` UPDATE policy limited to cancellation only

---

## How to report a vulnerability

Do not open a public GitHub issue. Use the private channels documented in `docs/SECURITY.md`:

- GitHub Private Security Advisory: `https://github.com/SpaceyaTech/colabs.v2/security/advisories/new`
- Email: `security@colabs.dev`

---

## Security anti-patterns

| Anti-pattern                                | Why it's dangerous                          | Correct approach                                   |
| ------------------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `SELECT *` on `github_integrations`         | Returns `access_token` to the client        | Explicit columns — never include `access_token`    |
| Table with no RLS policy                    | All authenticated users can read all rows   | Always add a policy in the same migration          |
| Inline subquery in RLS policy               | Recursive evaluation — policy may fail open | Use `is_team_member()`, `get_user_org_role()`      |
| Secret in `VITE_` variable                  | Bundled into public JS — readable by anyone | Use `npx supabase secrets set`                     |
| Stripe webhook without signature check      | Anyone can spoof payment confirmations      | Verify `stripe-signature` header before processing |
| `redirectTo` from user input                | Open redirect → phishing                    | Hardcode to `VITE_APP_URL`                         |
| Returning 403 on IDOR attempt               | Confirms resource exists                    | Return 404                                         |
| No `WITH CHECK` on write policy             | Users can insert rows owned by others       | Always pair `USING` with `WITH CHECK`              |
| `dangerouslySetInnerHTML` with user content | XSS                                         | Sanitise with DOMPurify or render as plain text    |
| User-supplied filename in storage path      | Path traversal                              | Replace with `crypto.randomUUID().ext`             |
| Plan upgrade via client-side UPDATE         | Free Pro access                             | Webhook-only upgrades with service role client     |
| `process.env` in edge function              | Undefined in Deno                           | `Deno.env.get()`                                   |
| Returning stack traces from edge functions  | Information disclosure                      | Generic error message; log internally              |
