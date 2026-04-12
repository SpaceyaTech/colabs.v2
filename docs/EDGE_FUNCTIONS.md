# Edge Functions

Supabase Edge Functions are server-side functions that run on the **Deno** runtime. They are deployed to Supabase's infrastructure and called from the frontend via `supabase.functions.invoke()` or directly via HTTPS.

All edge functions live in `supabase/functions/`, one directory per function.

---

## Table of Contents

- [Deno vs Node — Key Differences](#deno-vs-node--key-differences)
- [Running Functions Locally](#running-functions-locally)
- [Function Reference](#function-reference)
- [Shared Patterns](#shared-patterns)
- [How to Add a New Edge Function](#how-to-add-a-new-edge-function)
- [Testing with curl](#testing-with-curl)

---

## Deno vs Node — Key Differences

If you are familiar with Node.js, these are the key differences you will encounter when working with Supabase Edge Functions:

|                           | Node.js                            | Deno (Edge Functions)                                                       |
| ------------------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| **Module imports**        | `require('x')` / `import from 'x'` | `import from 'https://...'` or `npm:` specifier                             |
| **Environment variables** | `process.env.VAR`                  | `Deno.env.get('VAR')`                                                       |
| **HTTP server**           | `express`, `fastify`, etc.         | `Deno.serve(async (req) => { ... })`                                        |
| **File system**           | `fs.readFile(...)`                 | `Deno.readFile(...)` — usually not needed in edge functions                 |
| **Standard library**      | npm packages                       | `https://deno.land/std/`                                                    |
| **External packages**     | `npm install <pkg>`                | Import via URL: `import Stripe from "https://esm.sh/stripe@14?target=deno"` |
| **package.json**          | Used for dependencies              | Not used — imports are URL-based                                            |
| **TypeScript**            | Requires compilation step          | Natively supported — no build step needed                                   |

### Importing packages

Use [esm.sh](https://esm.sh/) for npm packages in edge functions:

```typescript
// ✅ Correct — Deno-compatible import with pinned version
import Stripe from 'https://esm.sh/stripe@14.17.0?target=deno';

// ❌ Wrong — Node-style import
import Stripe from 'stripe';
```

### Accessing secrets

```typescript
// ✅ Correct
const secret = Deno.env.get('GITHUB_CLIENT_SECRET');

// ❌ Wrong
const secret = process.env.GITHUB_CLIENT_SECRET;
```

---

## Running Functions Locally

### Start the local Supabase stack

```bash
npx supabase start
```

This starts a local Postgres, Auth, and Edge Function runtime. The terminal output shows your local service keys.

### Serve a function locally

```bash
npx supabase functions serve github-oauth --env-file .env.local
```

The function is available at:

```
http://localhost:54321/functions/v1/github-oauth
```

### Create a `.env.local` file for local secrets

This file is never committed. Add it to `.gitignore` if it is not already there.

```env
GITHUB_CLIENT_ID=your-integration-app-client-id
GITHUB_CLIENT_SECRET=your-integration-app-client-secret
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<printed by supabase start>
```

### Deploy to Supabase

```bash
npx supabase functions deploy <function-name>
```

Deploy all functions at once:

```bash
for fn in github-oauth github-repositories github-issues github-project-data; do
  npx supabase functions deploy $fn
done
```

---

## Function Reference

### `github-oauth`

**Path:** `supabase/functions/github-oauth/index.ts`

Handles the GitHub OAuth code exchange for the integration flow (not the auth login).

**Method:** POST · **Auth:** Supabase JWT required

**Request body:**

```json
{ "code": "string", "state": "string" }
```

**Flow:**

1. Exchange `code` for GitHub access token via `https://github.com/login/oauth/access_token`
2. Fetch the authenticated GitHub user via `GET /user`
3. Verify the Supabase JWT in the `Authorization` header to get the internal user ID
4. Upsert the `github_integrations` record — stores the access token server-side

**Response:**

```json
{
  "success": true,
  "integration": {
    "id": "...",
    "user_id": "...",
    "github_user_id": "...",
    "github_username": "...",
    "avatar_url": "...",
    "is_active": true
  },
  "github_user": { "id": "...", "login": "...", "avatar_url": "..." }
}
```

**Required secrets:** `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

### `github-repositories`

**Path:** `supabase/functions/github-repositories/index.ts`

Syncs and manages GitHub repository data for the authenticated user.

**Auth:** Supabase JWT required

#### GET — Sync repositories

Fetches all repos from the GitHub API using the stored access token and upserts them into `github_repositories`.

**Response:**

```json
{
  "success": true,
  "repositories": [ ... ],
  "synced_count": 42
}
```

#### POST — Update collaboration settings

Toggles `allow_collaboration` on one or more repos.

**Request body:**

```json
{
  "repositoryIds": ["uuid1", "uuid2"],
  "allowCollaboration": true
}
```

**Response:**

```json
{
  "success": true,
  "updated_repositories": [ ... ]
}
```

**Required secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

### `github-issues`

**Path:** `supabase/functions/github-issues/index.ts`

Fetches open issues from the user's collaboration-enabled repositories.

**Method:** POST (invoked via `supabase.functions.invoke`) · **Auth:** Supabase JWT required

**Flow:**

1. Verify the JWT → retrieve the user's `github_integrations` record
2. Query `github_repositories` where `allow_collaboration = true`
3. For each repo, fetch open issues from `GET /repos/{owner}/{repo}/issues?state=open`
4. Filter out pull requests (GitHub returns PRs in the issues endpoint)
5. Categorise issues by label (bug, feature, documentation, help-wanted)
6. Assign priority based on labels (urgent, high, medium, low)
7. Return sorted by newest first

**Response:**

```json
{
  "success": true,
  "issues": [
    {
      "id": "repo-name-42",
      "title": "Fix login bug",
      "category": "bug",
      "priority": "high",
      "labels": ["bug", "high-priority"],
      "repo": { "name": "repo", "owner": "user", "full_name": "user/repo" },
      "html_url": "https://github.com/user/repo/issues/42"
    }
  ],
  "repositories": [{ "id": "uuid", "name": "repo", "full_name": "user/repo" }]
}
```

**Label → Category mapping:**

| Label contains          | Category      |
| ----------------------- | ------------- |
| `bug`                   | bug           |
| `documentation`, `docs` | documentation |
| `enhancement`           | enhancement   |
| `help wanted`           | help-wanted   |
| (default)               | feature       |

**Label → Priority mapping:**

| Label contains       | Priority |
| -------------------- | -------- |
| `urgent`, `critical` | urgent   |
| `high`, `important`  | high     |
| `low`                | low      |
| (default)            | medium   |

**Required secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

### `github-project-data`

**Path:** `supabase/functions/github-project-data/index.ts`

Fetches public repository data for the project detail page. **No authentication required.**

**Method:** POST

**Request body:**

```json
{ "repoUrl": "https://github.com/owner/repo" }
```

**Flow:**

1. Parse the `owner` and `repo` from the URL
2. Fetch repo metadata from `GET /repos/{owner}/{repo}` (unauthenticated)
3. Fetch top 12 contributors from `GET /repos/{owner}/{repo}/contributors`
4. Fetch top 15 open issues — sort "good first issues" to the top
5. Construct the README URL

**Response:**

```json
{
  "success": true,
  "data": {
    "repo": {
      "full_name": "owner/repo",
      "description": "...",
      "stars": 1234,
      "forks": 56,
      "language": "TypeScript",
      "topics": ["react", "typescript"],
      "license": "MIT"
    },
    "contributors": [{ "login": "user", "avatar_url": "...", "contributions": 100 }],
    "issues": [{ "number": 42, "title": "...", "is_good_first_issue": true }],
    "readme_url": "https://github.com/owner/repo#readme"
  }
}
```

**Note:** Uses unauthenticated GitHub API calls, which are rate-limited to 60 requests per hour per IP. This function is only called on the project detail page — not on any list view — to minimise rate limit impact.

**Required secrets:** None (unauthenticated calls)

---

## Shared Patterns

### CORS headers

Every edge function must include these CORS headers and handle `OPTIONS` preflight requests:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  // Always handle OPTIONS first
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ... function logic
});
```

### Rate-limit mitigation

To avoid hitting rate limits of external APIs (e.g., GitHub, Stripe), use these strategies:

1. **Database caching**: Store the external data in a local table with an `expires_at` column. Only hit the external API when the cached data is stale or missing.
2. **ETag usage**: Store the `ETag` or `Last-Modified` header from the external API. On subsequent requests, send `if-none-match` or `if-modified-since`. If the API returns `304 Not Modified`, use your local cache. This does not count against your rate limit for many APIs.
3. **Fanning out**: Use `Promise.allSettled()` instead of sequential awaits when fetching data from multiple sources.

### Standard function template

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.41.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate — verify JWT and extract user ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create a service role client for privileged DB access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Verify the user's JWT
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

    // 4. Parse request body
    const body = await req.json();

    // 5. Business logic here
    // ...

    // 6. Return success response
    return new Response(JSON.stringify({ success: true, data: {} }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 7. Return structured error — never expose stack traces
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## How to Add a New Edge Function

### Step 1: Create the function directory

```bash
npx supabase functions new your-function-name
```

This creates `supabase/functions/your-function-name/index.ts`.

### Step 2: Write the function

Use the standard template above. Key checklist:

- [ ] CORS headers at the top
- [ ] OPTIONS preflight handler
- [ ] JWT verification (unless the function is intentionally public)
- [ ] Use service role client for DB writes — never the anon key inside an edge function
- [ ] Structured error responses — never expose stack traces or internal error messages
- [ ] `return 200` on webhook functions even on non-fatal errors (prevents infinite retry loops from Stripe/GitHub)

### Step 3: Add required secrets

```bash
npx supabase secrets set MY_SECRET_VALUE=...
```

List current secrets (names only, not values):

```bash
npx supabase secrets list
```

### Step 4: Test locally

```bash
npx supabase functions serve your-function-name --env-file .env.local
```

### Step 5: Deploy

```bash
npx supabase functions deploy your-function-name
```

### Step 6: If the function does not require JWT (e.g. webhooks)

Add an entry to `supabase/config.toml`:

```toml
[functions.your-function-name]
verify_jwt = false
```

---

## Testing with curl

Test a function locally with curl:

```bash
# Authenticated function (include JWT from Supabase Auth)
curl -X POST \
  http://localhost:54321/functions/v1/github-issues \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Public function (no auth required)
curl -X POST \
  http://localhost:54321/functions/v1/github-project-data \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/SpaceyaTech/colabs.v2"}'
```

To get a JWT for local testing, sign in to the local Supabase instance via the browser and copy the `access_token` from the session object in `localStorage`.
