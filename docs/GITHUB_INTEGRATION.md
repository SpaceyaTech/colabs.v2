# GitHub Integration

The app integrates with GitHub via OAuth for repository management, issue tracking, and project data fetching.

## Sign Up / Sign In with GitHub

Users can authenticate using their GitHub account through Supabase Auth's built-in GitHub provider.

### How It Works

1. On the **Sign Up** or **Sign In** page, the user clicks **"Continue with GitHub"**
2. Supabase redirects to GitHub's OAuth consent screen
3. The user authorizes the app
4. GitHub redirects back to the app with a session token
5. Supabase creates or links the user account automatically

### Configuration

GitHub OAuth as an auth provider is configured in the **Supabase Dashboard**:

1. Go to **Authentication → Providers → GitHub**
2. Enable the GitHub provider
3. Set the **Client ID** and **Client Secret** from your [GitHub OAuth App](https://github.com/settings/developers)
4. Set the **Redirect URL** to: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`

### Client-Side Usage (`src/hooks/useAuth.tsx`)

```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

> **Note:** This is separate from the GitHub **integration** OAuth flow below, which connects a user's GitHub account for repository syncing and issue tracking after they are already signed in.

---

## Integration OAuth Flow (Repository Sync)

```
┌──────────┐    1. Redirect     ┌──────────┐
│  Browser  │ ─────────────────→ │  GitHub   │
│           │                    │  OAuth    │
│           │ ←───────────────── │           │
└──────────┘    2. Code + State  └──────────┘
      │
      │ 3. POST code to edge function
      ▼
┌──────────────────┐
│ github-oauth     │ ← Exchange code for access token
│ (edge function)  │ ← Fetch GitHub user info
│                  │ ← Upsert github_integrations record
└──────────────────┘
      │
      │ 4. Auto-sync repositories
      ▼
┌──────────────────┐
│ github-repos     │ ← Fetch user repos from GitHub API
│ (edge function)  │ ← Upsert into github_repositories
└──────────────────┘
```

### Implementation Details

**Client-side** (`src/hooks/useGitHub.tsx`):

1. `connectToGitHub()` — Redirects to GitHub OAuth authorize URL with `repo,user:email` scopes
2. `handleOAuthCallback(code, state)` — Invokes `github-oauth` edge function, stores integration
3. `syncRepositories()` — Invokes `github-repositories` GET to fetch and sync repos
4. `updateRepositoryCollaboration()` — Invokes `github-repositories` POST to toggle collaboration
5. `disconnectGitHub()` — Soft-deletes by setting `is_active = false`
6. `checkIntegration()` — Queries `github_integrations` for active connection
7. `loadRepositories()` — Loads repos from DB with collaboration request counts

**Callback page** (`src/pages/GitHubCallback.tsx`):
- Extracts `code` and `state` from URL params
- Calls `handleOAuthCallback()` and redirects to `/settings`

### Required Secrets

| Secret | Where Set | Purpose |
|---|---|---|
| `GITHUB_CLIENT_ID` | Edge function env | OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | Edge function env | OAuth App client secret |

The client-side uses a publishable client ID hardcoded in `useGitHub.tsx`.

## Repository Collaboration

Users can toggle `allow_collaboration` on individual repositories. When enabled:
- The repository's open issues become visible to other authenticated users
- Issues are fetched via the `github-issues` edge function
- Other users can claim issues and track progress

## Issue Fetching

### From User's Repositories (`github-issues` edge function)

Fetches open issues from all collaboration-enabled repos for the authenticated user.

**Flow:**
1. Verify JWT → Get user's `github_integrations` record
2. Query `github_repositories` where `allow_collaboration = true`
3. For each repo, call `GET /repos/{owner}/{repo}/issues?state=open`
4. Filter out PRs, categorize by labels, determine priority
5. Return sorted issues (newest first)

**Label → Category Mapping:**
| Label Contains | Category |
|---|---|
| `bug` | bug |
| `documentation`, `docs` | documentation |
| `enhancement` | enhancement |
| `help wanted` | help-wanted |
| (default) | feature |

**Label → Priority Mapping:**
| Label Contains | Priority |
|---|---|
| `urgent`, `critical` | urgent |
| `high`, `important` | high |
| `low` | low |
| (default) | medium |

### From Any Public Repository (`github-project-data` edge function)

Fetches live data for the project detail page (no auth required):

**Endpoint:** POST with `{ repoUrl: "https://github.com/owner/repo" }`

**Returns:**
- Repository metadata (stars, forks, language, topics, license)
- Contributors list (top 12)
- Open issues (top 15, sorted with "good first issues" first)
- README URL

## Client-Side Hooks

### `useGitHub()`

Full GitHub integration management hook. See methods above.

### `useGitHubIssues()`

Fetches issues from the user's collaboration-enabled repos.

```tsx
const { issues, repositories, loading, error, message, refetch } = useGitHubIssues();
```

- Auto-fetches on mount when authenticated
- Returns typed `GitHubIssue[]` with category, priority, and assignee info

### `useClaimedIssues()`

Manages the user's claimed issues (persisted in `claimed_issues` table).

```tsx
const { claimedIssues, claimIssue, unclaimIssue, updateStatus } = useClaimedIssues();
```

- `claimIssue(issue)` — Inserts into `claimed_issues`, handles duplicates
- `unclaimIssue(issueId)` — Removes claim
- `updateStatus(issueId, status)` — Updates issue status (todo → in-progress → done)
- `toUnifiedIssue(claimed)` — Converts DB record to UI format
