# GitHub Integration

Colabs integrates with GitHub for two independent purposes. Understanding the distinction between them is essential before working on anything in `src/hooks/useGitHub.tsx`, `src/hooks/useAuth.tsx`, or any of the GitHub edge functions.

---

## Table of Contents

- [Two Separate OAuth Flows](#two-separate-oauth-flows)
- [Sign In with GitHub (Auth)](#sign-in-with-github-auth)
- [GitHub Integration (Repository Sync)](#github-integration-repository-sync)
- [Repository Collaboration](#repository-collaboration)
- [Issue Fetching](#issue-fetching)
- [Client-Side Hooks](#client-side-hooks)
- [Local Testing](#local-testing)

---

## Two Separate OAuth Flows

|                      | Auth flow                                                               | Integration flow                                                                                  |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **What it does**     | Authenticates the user — creates or restores a Supabase session         | Connects a GitHub account to sync repos and fetch issues                                          |
| **When it runs**     | On `/sign-in` or `/sign-up`                                             | Inside Settings, after the user is already logged in                                              |
| **GitHub OAuth App** | GitHub Auth App (configured in Supabase)                                | GitHub Integration App (configured in GitHub)                                                     |
| **Callback URL**     | `https://<project>.supabase.co/auth/v1/callback`                        | Local: `http://localhost:5173/github-callback`<br>Prod: `https://your-domain.com/github-callback` |
| **Token stored**     | Supabase Auth JWT — managed by Supabase                                 | GitHub access token — stored in `github_integrations.access_token` (server-side only)             |
| **Client-side code** | `useAuth.tsx` → `supabase.auth.signInWithOAuth({ provider: 'github' })` | `useGitHub.tsx` → manual redirect → `github-oauth` edge function                                  |

**Why two separate apps?** A user can sign in with Google and still use the GitHub integration. A user can sign in with one GitHub account and connect a different GitHub account for repo syncing. Separating the flows keeps the scopes right-sized and the systems independently maintainable.

The two flows are completely independent code paths. Changes to auth must not affect the integration and vice versa.

---

## Sign In with GitHub (Auth)

### How it works

1. User clicks "Continue with GitHub" on `/sign-in` or `/sign-up`
2. Supabase redirects to GitHub's OAuth consent screen
3. User authorises the app
4. GitHub redirects to the Supabase Auth callback URL
5. Supabase creates or links the user account and returns a JWT session
6. The user is redirected to `/dashboard`

### Configuration

Configured entirely in the Supabase Dashboard:

1. Go to **Authentication → Providers → GitHub**
2. Enable the GitHub provider
3. Enter the **Client ID** and **Client Secret** from your GitHub Auth App
4. The **Redirect URL** (recorded in GitHub) is: `https://<your-project-ref>.supabase.co/auth/v1/callback`

### Client-side code (`src/hooks/useAuth.tsx`)

```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

---

## GitHub Integration (Repository Sync)

This is the flow for connecting a GitHub account to sync repositories and fetch issues. It is separate from authentication.

### Flow diagram

```
┌──────────┐  1. Redirect to GitHub OAuth  ┌───────────┐
│  Browser │ ─────────────────────────────→ │  GitHub   │
│          │ ←───────────────────────────── │  OAuth    │
└──────────┘  2. Redirect with code+state   └───────────┘
     │
     │  3. POST code to edge function
     ↓
┌──────────────────┐
│  github-oauth    │ → Exchange code for access token
│  (edge function) │ → Fetch GitHub user info (/user)
│                  │ → Upsert github_integrations record
└──────────────────┘
     │
     │  4. Auto-sync repositories
     ↓
┌──────────────────┐
│  github-repos    │ → Fetch user repos from GitHub API
│  (edge function) │ → Upsert into github_repositories table
└──────────────────┘
```

### Implementation details (`src/hooks/useGitHub.tsx`)

| Method                                      | What it does                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `connectToGitHub()`                         | Redirects to GitHub OAuth authorize URL with `repo,user:email` scopes        |
| `handleOAuthCallback(code, state)`          | Invokes `github-oauth` edge function with the code from GitHub               |
| `syncRepositories()`                        | Invokes `github-repositories` (GET) to fetch and sync repos                  |
| `updateRepositoryCollaboration(ids, allow)` | Invokes `github-repositories` (POST) to toggle per-repo collaboration        |
| `disconnectGitHub()`                        | Soft-deletes by setting `is_active = false` on the integration record        |
| `checkIntegration()`                        | Queries `github_integrations` for an active integration for the current user |
| `loadRepositories()`                        | Loads repos from `github_repositories` with collaboration request counts     |

### Callback page (`src/pages/GitHubCallback.tsx`)

After GitHub redirects back to `/github-callback`:

1. Extracts `code` and `state` from URL search params
2. Calls `handleOAuthCallback(code, state)`
3. Redirects to `/settings` on success

### Required secrets (Edge Functions)

| Secret                 | Where to set               | Value                               |
| ---------------------- | -------------------------- | ----------------------------------- |
| `GITHUB_CLIENT_ID`     | `npx supabase secrets set` | Integration OAuth App client ID     |
| `GITHUB_CLIENT_SECRET` | `npx supabase secrets set` | Integration OAuth App client secret |

The `VITE_GITHUB_CLIENT_ID` environment variable (in `.env`) is the same Client ID — safe to expose in the client because it is only used to construct the OAuth authorize URL. The Client Secret is always server-side only.

---

## Repository Collaboration

Users opt in individual repos by toggling `allow_collaboration = true`. When enabled:

- The repo's open issues become visible to other authenticated users on the `/issues` page
- Issues are fetched live via the `github-issues` edge function
- Other users can claim issues and track their status through `claimed_issues`
- The repo appears in the public repository discovery list

Toggling off (`allow_collaboration = false`) removes the repo's issues from the public feed immediately. Existing claimed issues from the repo are not deleted — they remain in the `claimed_issues` table.

---

## Issue Fetching

### From the user's own repos (`github-issues` edge function)

Fetches open issues from all collaboration-enabled repos for the authenticated user.

**Full flow:**

1. Verify JWT → retrieve the user's `github_integrations` record
2. Query `github_repositories` where `allow_collaboration = true` for this user
3. For each repo, call `GET /repos/{owner}/{repo}/issues?state=open`
4. Filter out pull requests (the GitHub Issues API returns PRs too)
5. Apply label-based categorisation and priority mapping (see [EDGE_FUNCTIONS.md](./EDGE_FUNCTIONS.md#github-issues))
6. Return sorted by `created_at` descending (newest first)

**Client hook:** `useGitHubIssues()` in `src/hooks/useGitHubIssues.tsx`

```tsx
const { issues, repositories, loading, error, refetch } = useGitHubIssues();
```

### From any public repo (`github-project-data` edge function)

Fetches live data for the project detail page. No authentication required.

**Endpoint:** POST with `{ repoUrl: "https://github.com/owner/repo" }`

**Returns:**

- Repository metadata (stars, forks, language, topics, license)
- Top 12 contributors
- Top 15 open issues (good first issues sorted to the top)
- README URL

---

## Client-Side Hooks

### `useGitHub()` — `src/hooks/useGitHub.tsx`

Full GitHub integration management. See method table above under [GitHub Integration (Repository Sync)](#github-integration-repository-sync).

### `useGitHubIssues()` — `src/hooks/useGitHubIssues.tsx`

Fetches issues from the user's collaboration-enabled repos via the edge function. Auto-fetches on mount when authenticated.

```tsx
const { issues, repositories, loading, error, message, refetch } = useGitHubIssues();
```

Returns `GitHubIssue[]` with `id`, `title`, `category`, `priority`, `labels`, `repo`, and `html_url`.

### `useClaimedIssues()` — `src/hooks/useClaimedIssues.tsx`

Manages the user's claimed issues (persisted in `claimed_issues`).

```tsx
const { claimedIssues, claimIssue, unclaimIssue, updateStatus } = useClaimedIssues();
```

- `claimIssue(issue)` — inserts into `claimed_issues`, handles duplicates
- `unclaimIssue(issueId)` — removes the claim
- `updateStatus(issueId, status)` — moves the issue through `todo → in-progress → in-review → done`

---

## Local Testing

### Testing the auth flow locally

1. Create a GitHub OAuth App with callback URL `http://localhost:5173` (not the Supabase URL — use localhost for local auth testing)
2. Add it to Supabase Auth providers in the dashboard
3. Run `npm run dev` and sign in with GitHub

### Testing the integration flow locally

1. Create a second GitHub OAuth App with callback URL `http://localhost:5173/github-callback`
2. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env.local`
3. Start the local Supabase stack: `npx supabase start`
4. Serve the edge function: `npx supabase functions serve github-oauth --env-file .env.local`
5. Run `npm run dev` and connect GitHub from Settings

### Testing edge functions directly with curl

```bash
# First, get a local JWT by signing in and copying it from the browser DevTools
# Application → Local Storage → supabase.auth.token → access_token

curl -X POST \
  http://localhost:54321/functions/v1/github-issues \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Common local testing issues

**"No integration found"** when testing `github-issues`:
The user has not connected their GitHub account. Go through the integration OAuth flow first.

**Callback redirects to an error page**:
Check that the Authorization callback URL in the GitHub OAuth App matches exactly. Local testing uses `http://localhost:5173/github-callback`, not the Supabase URL.

**Edge function returns `Unauthorized`**:
The JWT is expired or the function was not restarted after a secret change. Re-authenticate and restart `supabase functions serve`.
