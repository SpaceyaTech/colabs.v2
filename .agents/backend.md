# Backend agent — Colabs

You are working on the backend layer of Colabs. The backend is entirely Supabase — PostgreSQL with RLS, Edge Functions on the Deno runtime, and Storage. There is no custom server.

The frontend (React, TypeScript, Tailwind, React Query) is covered in `.agents/frontend.md`.
General project rules and commands are in `docs/AGENTS.md`.

---

## Table of Contents

- [Stack](#stack)
- [Mental model — how the backend works](#mental-model--how-the-backend-works)
- [Database — PostgreSQL](#database--postgresql)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Security definer functions](#security-definer-functions)
- [Migrations](#migrations)
- [Edge Functions — Deno](#edge-functions--deno)
- [GitHub API integration](#github-api-integration)
- [Supabase Storage](#supabase-storage)
- [Subscriptions and feature gating](#subscriptions-and-feature-gating)
- [Local development](#local-development)
- [Testing](#testing)
- [Backend anti-patterns](#backend-anti-patterns)

---

## Stack

| Layer          | Technology              | Notes                                     |
| -------------- | ----------------------- | ----------------------------------------- |
| Database       | PostgreSQL via Supabase | 15 tables, all RLS-enabled                |
| Auth           | Supabase Auth           | JWT-based, GitHub + Google OAuth          |
| Edge Functions | Deno (not Node.js)      | `supabase/functions/`                     |
| Storage        | Supabase Storage        | 2 buckets: `resumes`, `project-logos`     |
| GitHub API     | REST API v3             | Authenticated via stored access tokens    |
| Subscriptions  | PostgreSQL + pg_cron    | `user_subscriptions` table, auto-demotion |

---

## Mental model — how the backend works

### Request path for a browser query

```
Browser (React + Supabase client)
  → HTTPS request with JWT in Authorization header
    → Supabase API gateway
      → PostgreSQL evaluates RLS policies using auth.uid() from JWT
        → Returns only rows the policy allows
```

No server processes the request. RLS is the only security layer between the browser and the database. This is why RLS is non-negotiable — without it, every row in every table is accessible to any authenticated user.

### Request path for an edge function call

```
Browser
  → supabase.functions.invoke("function-name", { headers: { Authorization: "Bearer <jwt>" } })
    → Deno edge function
      → Verifies JWT manually (for authenticated endpoints)
      → Uses SUPABASE_SERVICE_ROLE_KEY to access DB (bypasses RLS)
      → May call GitHub API using stored access_token
      → Returns structured JSON response
```

The service role key bypasses RLS. This is intentional for server-side privileged operations, but it means edge functions must implement their own authorization checks before any write.

---

## Database — PostgreSQL

### Schema summary

Full schema with column details in `docs/DATABASE.md`. Summary:

| Table                    | Owner                | Access pattern                                      |
| ------------------------ | -------------------- | --------------------------------------------------- |
| `gigs`                   | `creator_id`         | Public read (active), owner write                   |
| `projects`               | `creator_id`         | Public read (public/unlisted), owner write          |
| `github_integrations`    | `user_id`            | Owner only; `access_token` never returned to client |
| `github_repositories`    | via `integration_id` | Public read (collaboration-enabled), owner write    |
| `claimed_issues`         | `user_id`            | Owner only                                          |
| `teams`                  | `creator_id`         | Member read, owner write                            |
| `team_members`           | —                    | Member read, team creator write                     |
| `team_projects`          | —                    | Member read, team creator write                     |
| `organizations`          | `owner_id`           | Member read, admin write                            |
| `organization_members`   | —                    | Member read, admin write                            |
| `proposals`              | `applicant_id`       | Owner + gig creator read                            |
| `proposal_milestones`    | via `proposal_id`    | Same as proposals                                   |
| `user_subscriptions`     | `user_id`            | Owner read; upgrades via webhook only               |
| `saved_jobs`             | `user_id`            | Owner only                                          |
| `collaboration_requests` | `user_id`            | Owner + repo owner read                             |

### Writing queries

Always select explicit columns. Never `SELECT *`. This is especially critical for `github_integrations`:

```typescript
// ✅ Safe — access_token not included
const { data } = await supabase
  .from('github_integrations')
  .select('id, user_id, github_username, avatar_url, is_active')
  .eq('user_id', userId)
  .single();

// ❌ Never — exposes access_token to caller
const { data } = await supabase.from('github_integrations').select('*').eq('user_id', userId);
```

---

## Row Level Security (RLS)

### Rules

- Every table has RLS enabled — no exceptions
- A table with RLS enabled but no policies returns **zero rows to everyone**
- Every new table must have RLS + at least one policy in the same migration
- RLS empty results are not errors — they mean the user has no access
- Never use inline subqueries in RLS policies — use security definer functions

### The four canonical patterns

Use these templates for all new tables. Full explanations in `docs/DATABASE.md`.

**Pattern 1 — Owner-only**

```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rows"
  ON public.your_table
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Pattern 2 — Public read, owner write**

```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public rows visible to all"
  ON public.your_table FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Creators can manage own rows"
  ON public.your_table FOR ALL
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
```

**Pattern 3 — Team membership**

```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can read"
  ON public.your_table FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

-- ⚠️  This EXISTS subquery queries 'public.teams', a *different* table — not the
--    same table this policy is attached to. Cross-table EXISTS is safe from
--    recursive RLS issues. Only inline subqueries on the *same* protected table
--    cause recursion. Use security definer functions for same-table membership.
CREATE POLICY "Team creator can write"
  ON public.your_table FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND creator_id = auth.uid()
    )
  );
```

**Pattern 4 — Organisation role-based**

```sql
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read"
  ON public.your_table FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

-- ✅ INSERT/UPDATE share the same check — one policy each
CREATE POLICY "Org admins can insert"
  ON public.your_table FOR INSERT
  WITH CHECK (
    get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin')
  );

CREATE POLICY "Org admins can update or delete"
  ON public.your_table FOR ALL
  USING (
    get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin')
  );
```

### Protecting sensitive columns

**RLS filters rows, not columns.** A SELECT policy controls _which rows_ a user can read — it has no ability to hide individual columns within those rows. There is no PostgreSQL RLS equivalent of a column-level filter.

For sensitive columns that must never reach the client (like `access_token`), the only reliable protection is a **DB-level restriction**: move sensitive columns to a separate table (e.g., `github_integration_secrets`) with RLS enabled but NO policies. This ensures that only the service role key can access them.

```typescript
// ✅ Client query — selects from the public metadata table
// Even if the client used .select('*'), the secrets are in a different table
supabase
  .from('github_integrations')
  .select('id, user_id, github_username, avatar_url, is_active')
  .eq('user_id', userId)
  .single();
```

The service role key bypasses all RLS. Inside Edge Functions, the service role client can join with the secrets table to retrieve tokens — and must never return them in the response body.

---

## Security definer functions

These functions run with elevated privileges (as the function owner, bypassing RLS) to safely evaluate membership and role checks in RLS policies. Never replace them with inline subqueries.

### Existing functions

```sql
-- Returns user's role in an org: 'owner' | 'admin' | 'member' | null
get_user_org_role(user_id UUID, org_id UUID) → TEXT

-- Returns true if user is a member of the org
is_organization_member(user_id UUID, org_id UUID) → BOOLEAN

-- Returns true if user is a member of the team (includes team creator)
is_team_member(user_id UUID, team_id UUID) → BOOLEAN

-- Auto-demotes expired subscription to starter; returns updated row
check_and_demote_subscription(user_id UUID) → user_subscriptions
```

### Writing a new security definer function

```sql
CREATE OR REPLACE FUNCTION public.your_function(param1 UUID, param2 UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public   -- required to prevent search_path injection
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.your_table
    WHERE column1 = param1 AND column2 = param2
  );
END;
$$;
```

`SECURITY DEFINER` + `SET search_path = public` is the required pair. Omitting `SET search_path` is a security vulnerability.

---

## Migrations

### Rules

- Migrations are append-only — never edit an existing file
- Always create a new migration for any schema change
- Every new table needs RLS + policy in the same migration
- Every migration must be tested with `supabase db reset` before being pushed

### Workflow

```bash
# 1. Create the migration file
npx supabase migration new descriptive_name

# 2. Write the SQL in the generated file
# supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql

# 3. Test locally — drops and recreates the local DB
npx supabase db reset

# 4. Verify with EXPLAIN ANALYZE on any new queries
# 5. Regenerate TypeScript types
npx supabase gen types typescript \
  --project-id your-project-ref \
  > src/integrations/supabase/types.ts

# 6. Commit migration + types.ts together in the same PR
```

### Migration template

```sql
-- Migration: descriptive_name
-- Author: your-github-handle
-- Date: YYYY-MM-DD
-- Description: one sentence explaining why this migration exists

-- Create table
CREATE TABLE public.your_table (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_your_table_user_id
  ON public.your_table(user_id);

-- updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.your_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rows"
  ON public.your_table
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Adding an index

Always use `CONCURRENTLY` in production to avoid table locks:

```sql
CREATE INDEX CONCURRENTLY idx_gigs_status_created
  ON public.gigs(status, created_at DESC);
```

In migrations (which run in a transaction), `CONCURRENTLY` is not allowed. Use it only for manually-run index additions on live databases. In migrations, use the plain form — the table will be locked briefly during initial migration only.

---

## Edge Functions — Deno

### Critical: Deno is not Node.js

```typescript
// Env vars
Deno.env.get("VAR_NAME")                              // ✅ Deno
process.env.VAR_NAME                                   // ❌ Node

// Imports — URL-based, no package.json
import Stripe from "https://esm.sh/stripe@14?target=deno"  // ✅
import Stripe from "stripe"                                  // ❌

// HTTP server
Deno.serve(async (req) => { ... })                     // ✅
app.listen(3000)                                        // ❌
```

### Automatically available env vars

Every edge function has access to these without configuration:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`

All other secrets must be set with `npx supabase secrets set KEY=value`.

### Required boilerplate for every function

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Authenticate (for non-webhook functions)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Service role client — bypasses RLS for privileged writes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Verify JWT and get user
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

    // 5. Parse body
    const body = await req.json();

    // 6. Business logic
    // ...

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 7. Never expose stack traces or internal errors
    console.error('[function-name] Error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Webhook functions (Stripe, GitHub)

Webhook endpoints have different requirements:

```toml
# supabase/config.toml
[functions.stripe-webhook]
verify_jwt = false   # Stripe sends raw POST, no JWT
```

```typescript
// Webhook functions MUST return 200 even on non-fatal errors
// Returning 4xx/5xx causes Stripe/GitHub to retry, which can cause duplicate processing

try {
  // Verify webhook signature FIRST before any processing
  const sig = req.headers.get('stripe-signature');
  const event = await stripe.webhooks.constructEventAsync(
    await req.text(),
    sig!,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  );

  // Process event...

  return new Response(JSON.stringify({ received: true }), { status: 200 });
} catch (err) {
  // Log the error but still return 200 for non-signature errors
  if (err.message.includes('signature')) {
    return new Response('Invalid signature', { status: 400 });
  }
  console.error('Webhook processing error:', err.message);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

### Adding a new edge function

```bash
# 1. Create
npx supabase functions new your-function-name

# 2. Set secrets if needed
npx supabase secrets set MY_SECRET=value

# 3. Add to config.toml if JWT verification needs changing
# supabase/config.toml
[functions.your-function-name]
verify_jwt = true   # default

# 4. Test locally
npx supabase functions serve your-function-name --env-file .env.local

# 5. Deploy
npx supabase functions deploy your-function-name

# 6. Update docs/EDGE_FUNCTIONS.md with the new function reference
```

---

## GitHub API integration

### Authentication

The `github-issues` and `github-repositories` functions use the stored OAuth access token from `github_integrations`:

```typescript
// Retrieve access token server-side — never returned to client
const { data: integration } = await supabase
  .from('github_integrations')
  .select('access_token, github_username') // explicit columns
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single();

// Use token in GitHub API calls
const response = await fetch('https://api.github.com/user/repos', {
  headers: {
    Authorization: `Bearer ${integration.access_token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});
```

### Rate limit handling

GitHub REST API: 5,000 authenticated requests/hour.

```typescript
// Always check rate limit headers in responses
const remaining = response.headers.get('X-RateLimit-Remaining');
const resetAt = response.headers.get('X-RateLimit-Reset');

if (remaining === '0') {
  const retryAfter = parseInt(resetAt!) - Math.floor(Date.now() / 1000);
  return new Response(
    JSON.stringify({
      error: 'GitHub API rate limit reached',
      retry_after_seconds: retryAfter,
    }),
    { status: 429, headers: corsHeaders }
  );
}
```

### ETag caching to reduce API calls

```typescript
// Store ETag from previous response in github_repositories
const cachedEtag = repository.github_etag;

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
    'If-None-Match': cachedEtag ?? '',
  },
});

if (response.status === 304) {
  // Not modified — use cached data, does not count against rate limit
  return cachedData;
}

// Store new ETag for next call
const newEtag = response.headers.get('ETag');
await supabase.from('github_repositories').update({ github_etag: newEtag }).eq('id', repository.id);
```

### Parallel fetching across repos

```typescript
// ✅ All repos fetched in parallel
const results = await Promise.allSettled(
  repos.map((repo) => fetchIssuesForRepo(repo.full_name, token))
);

// Filter out failed repos — log but don't fail the whole request
const issues = results
  .filter((r) => r.status === 'fulfilled')
  .flatMap((r) => (r as PromiseFulfilledResult<Issue[]>).value);
```

### Two OAuth apps — never confuse them

| App             | Purpose               | Scopes                  | Callback                                  |
| --------------- | --------------------- | ----------------------- | ----------------------------------------- |
| Auth app        | Sign in with GitHub   | `read:user, user:email` | `<supabase>.supabase.co/auth/v1/callback` |
| Integration app | Sync repos and issues | `repo, user:email`      | `<app-url>/github-callback`               |

The `github-oauth` edge function handles the integration app flow only. Supabase Auth handles the auth app flow internally.

---

## Supabase Storage

### Buckets

| Bucket          | Public | Allowed types        | Max size |
| --------------- | ------ | -------------------- | -------- |
| `project-logos` | Yes    | JPEG, PNG, WebP, GIF | 2 MB     |
| `resumes`       | No     | PDF, DOC, DOCX       | 10 MB    |

### Upload validation

Always validate before writing to storage. Validate all three: MIME type, file extension, and file size.

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

function validateProjectLogo(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed: ${file.type}`);
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum is 2 MB.`);
  }
}
```

### Filename sanitization

Never use the user-supplied filename directly. Sanitize to prevent path traversal:

```typescript
function sanitizeFilename(original: string): string {
  const ext = original.split('.').pop()?.toLowerCase() ?? '';
  // Use a UUID-based name — completely removes user-controlled path segments
  return `${crypto.randomUUID()}.${ext}`;
}

const safeName = sanitizeFilename(file.name);
const path = `${userId}/${safeName}`;

const { error } = await supabase.storage
  .from('project-logos')
  .upload(path, file, { contentType: file.type });
```

---

## Subscriptions and feature gating

Full lifecycle in `docs/SUBSCRIPTIONS.md`. Key rules for backend work:

### Plan upgrades go through webhooks only

The client-side `user_subscriptions` RLS policy allows UPDATE for cancellation. It must never be used for upgrades. Upgrades happen exclusively through the Stripe webhook handler:

```sql
-- ✅ Webhook handler (service role, bypasses RLS)
UPDATE public.user_subscriptions
SET plan = 'pro', status = 'active',
    started_at = now(), expires_at = now() + interval '30 days'
WHERE user_id = :user_id;

-- ❌ Client-side update — a user could self-upgrade without paying
-- (The RLS UPDATE policy should only allow status = 'cancelled' updates)
```

### Auto-demotion function

The `check_and_demote_subscription()` function is called via RPC from `useSubscription()` on every load. It atomically demotes expired plans to Starter.

If you modify the subscription lifecycle, test the demotion at all three levels:

1. Client-side check in `useSubscription()`
2. Database function `check_and_demote_subscription()`
3. Daily `pg_cron` batch job

### pg_cron job

```sql
-- Runs daily at midnight UTC — catches any missed client-side demotions
SELECT cron.schedule(
  'demote-expired-subscriptions',
  '0 0 * * *',
  $$
    UPDATE public.user_subscriptions
    SET plan = 'starter', status = 'active',
        expires_at = NULL, started_at = now(), updated_at = now()
    WHERE plan != 'starter'
      AND status = 'active'
      AND expires_at < now();
  $$
);
```

---

## Local development

```bash
# Start local Supabase stack (Postgres + Auth + Edge runtime + Storage)
npx supabase start

# Terminal output shows:
#   API URL, DB URL, Studio URL, local service keys

# Apply all migrations to local DB
npx supabase db push

# Reset local DB (drop + reapply all migrations)
npx supabase db reset

# Serve a single edge function with local secrets
npx supabase functions serve github-oauth --env-file .env.local

# Access local edge function
# http://localhost:54321/functions/v1/github-oauth

# View local DB in browser
# http://localhost:54323 (Supabase Studio)
```

### `.env.local` for edge function secrets

```env
GITHUB_CLIENT_ID=your-integration-app-client-id
GITHUB_CLIENT_SECRET=your-integration-app-client-secret
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-provided by supabase start
```

### Testing an edge function with curl

```bash
# Get a local JWT from the browser after signing in:
# DevTools → Application → Local Storage → supabase.auth.token → access_token

curl -X POST http://localhost:54321/functions/v1/github-issues \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Testing

From `docs/PRD.md` §9:

### Integration tests for hooks

```typescript
// Use MSW to mock Supabase responses
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('*/rest/v1/gigs*', () => {
    return HttpResponse.json([mockGig]);
  })
);

it('useGigs returns active gigs', async () => {
  const { result } = renderHook(() => useGigs(), { wrapper: QueryClientWrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(1);
});
```

### Edge function tests

Test edge functions by calling them via the local Supabase stack in integration tests, or by unit-testing the business logic functions extracted from the main handler:

```typescript
// Extract business logic from the Deno handler for unit testability
export function categorizeByLabel(labels: string[]): IssueCategory {
  if (labels.some((l) => l.includes('bug'))) return 'bug';
  if (labels.some((l) => l.includes('docs'))) return 'documentation';
  return 'feature';
}

// Unit test
it('categorizes bug labels correctly', () => {
  expect(categorizeByLabel(['bug', 'priority-high'])).toBe('bug');
});
```

---

## Backend anti-patterns

| Anti-pattern                                           | Correct approach                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `SELECT *` on any table                                | Explicit columns — never include `access_token`                        |
| Table without RLS policy                               | Add `ENABLE ROW LEVEL SECURITY` + at least one policy in the migration |
| Inline subquery in RLS policy                          | Use security definer function                                          |
| `process.env` in edge function                         | `Deno.env.get()`                                                       |
| Node-style package import in edge function             | URL-based import via `esm.sh`                                          |
| Secrets in `.env` with `VITE_` prefix                  | Set with `npx supabase secrets set`                                    |
| Editing an existing migration file                     | Create a new migration                                                 |
| Returning `access_token` from any query                | Column-level RLS filtering excludes it                                 |
| Plan upgrade via client-side DB update                 | Upgrades through Stripe webhook handler only                           |
| Webhook function returning 4xx on non-signature errors | Return 200 to prevent retry loops                                      |
| `SECURITY DEFINER` without `SET search_path`           | Always pair them — prevents search_path injection                      |
| Sequential GitHub API calls across repos               | `Promise.allSettled()` for parallel execution                          |
| User-supplied filename used directly in storage path   | Sanitize to UUID-based name                                            |
| Missing `CONCURRENTLY` on production index creation    | Prevents table lock on live databases                                  |
