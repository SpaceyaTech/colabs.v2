# Edge Functions

All edge functions are deployed to Supabase and located in `supabase/functions/`.

## `github-oauth`

**Path:** `supabase/functions/github-oauth/index.ts`

Handles the GitHub OAuth code exchange flow.

**Method:** POST

**Request Body:**

```json
{ "code": "string", "state": "string" }
```

**Auth:** Requires Supabase JWT in `Authorization` header.

**Flow:**

1. Exchange `code` for access token via GitHub OAuth API
2. Fetch GitHub user info (`/user` endpoint)
3. Verify Supabase JWT to get internal user ID
4. Upsert `github_integrations` record with access token

**Response:**

```json
{
  "success": true,
  "integration": { ... },
  "github_user": { "id": 123, "login": "username", "avatar_url": "..." }
}
```

**Required Env Vars:** `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## `github-repositories`

**Path:** `supabase/functions/github-repositories/index.ts`

Syncs and manages GitHub repository data.

**Auth:** Requires Supabase JWT.

### GET — Sync Repositories

Fetches all repos from GitHub API and upserts into `github_repositories`.

**Response:**

```json
{
  "success": true,
  "repositories": [ ... ],
  "synced_count": 42
}
```

### POST — Update Collaboration Settings

**Request Body:**

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

**Required Env Vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## `github-issues`

**Path:** `supabase/functions/github-issues/index.ts`

Fetches open issues from collaboration-enabled repositories.

**Method:** POST (invoked via `supabase.functions.invoke`)

**Auth:** Requires Supabase JWT.

**Flow:**

1. Verify user → Get `github_integrations` record
2. Query `github_repositories` where `allow_collaboration = true`
3. Fetch issues from each repo via GitHub API
4. Transform and categorize issues
5. Return sorted by newest first

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

**Required Env Vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## `github-project-data`

**Path:** `supabase/functions/github-project-data/index.ts`

Fetches public repository data for the project detail page. **No authentication required.**

**Method:** POST

**Request Body:**

```json
{ "repoUrl": "https://github.com/owner/repo" }
```

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

**Note:** Uses unauthenticated GitHub API calls (rate-limited to 60 req/hr per IP). Issues are sorted with "good first issues" prioritized.

---

## CORS

All edge functions include CORS headers:

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

All functions handle `OPTIONS` preflight requests.
