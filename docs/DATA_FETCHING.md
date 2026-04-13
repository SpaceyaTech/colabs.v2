# Data Fetching

All data fetching uses **TanStack React Query v5** for caching, background refetching, and loading/error state management. The Supabase client (`src/integrations/supabase/client.ts`) is used for all database and edge function calls.

For a full map of which hooks feed which components, see [DATA_FLOW.md](./DATA_FLOW.md).

---

## Table of Contents

- [Core Conventions](#core-conventions)
- [Query Key Naming](#query-key-naming)
- [Standard Patterns](#standard-patterns)
- [Hooks Reference](#hooks-reference)
- [Auth-Gated Queries](#auth-gated-queries)
- [Error Handling](#error-handling)
- [Mutations and Cache Invalidation](#mutations-and-cache-invalidation)
- [Edge Function Invocation](#edge-function-invocation)
- [Type Helpers](#type-helpers)
- [Anti-Patterns](#anti-patterns)

---

## Core Conventions

These rules apply to every hook in `src/hooks/`:

1. **One hook per file.** Each hook file exports one primary hook.
2. **No data fetching inside components.** Data fetching belongs in hooks; components receive data via props or by calling hooks.
3. **Always use `npm ci`-installed types.** All query return shapes must be typed against the auto-generated `src/integrations/supabase/types.ts`.
4. **Always default arrays.** Use `data ?? []` on every array-shaped query result.
5. **Gate queries with `enabled`.** Never fire a query before its dependencies are available.
6. **Throw errors, don't swallow them.** If the Supabase client returns an error, `throw error` — React Query will capture it in `isError`.
7. **Never use `SELECT *` on sensitive tables.** Always select explicit columns. The `github_integrations` table in particular must never return `access_token`.

---

## Query Key Naming

Query keys must be unique and descriptive. Follow this convention:

```ts
// Entity list
queryKey: ['gigs'];
queryKey: ['projects'];
queryKey: ['teams', userId]; // scoped to user

// Single entity by ID
queryKey: ['gig', gigId];
queryKey: ['project', projectId];

// Nested / related
queryKey: ['my-gigs', userId];
queryKey: ['proposals', gigId];
```

Use a shared constants file (`src/lib/queryKeys.ts`) if the number of keys grows large enough to cause typo-driven cache misses.

---

## Standard Patterns

### Read query

```tsx
export function useGigs() {
  return useQuery({
    queryKey: ['gigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select('id, title, company, budget, status, technologies, featured')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
```

### Conditional / dependent query

Disable the query until its dependency is available. RLS will return an empty array if the query fires before the session is established — but a fired query also wastes a round trip.

```tsx
export function useMyGigs(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-gigs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select('id, title, company, budget, status, technologies, featured, created_at')
        .eq('creator_id', userId!);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId, // query does not fire until userId is truthy
  });
}
```

### Single entity by ID

```tsx
export function useGigById(id: string | undefined) {
  return useQuery({
    queryKey: ['gig', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select('id, title, company, budget, status, technologies, description, created_at')
        .eq('id', id!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
```

---

## Hooks Reference

### `useAuth()` — `src/hooks/useAuth.tsx`

Authentication context. Wraps the entire app via `AuthProvider`.

```tsx
const { user, session, loading, signIn, signUp, signOut, signInWithOAuth } = useAuth();
```

| Property / Method                       | Description                                        |
| --------------------------------------- | -------------------------------------------------- |
| `user`                                  | Supabase `User` object — `null` if unauthenticated |
| `session`                               | Supabase `Session` — contains the JWT              |
| `loading`                               | `true` while the initial auth check is in flight   |
| `signUp(email, password)`               | Create account — triggers email confirmation       |
| `signIn(email, password)`               | Password-based login                               |
| `signInWithOAuth('github' \| 'google')` | OAuth provider login                               |
| `signOut()`                             | Sign out and clear session                         |

### `useGigs()` — `src/hooks/useGigs.tsx`

Active gig listings from the `gigs` table.

```tsx
const { data: gigs, isLoading, error } = useGigs();
```

Query key: `["gigs"]` · Filter: `status = 'active'` · Order: `created_at DESC`

### `useMyGigs(userId)` — `src/hooks/useGigs.tsx`

All gigs owned by a specific user (including paused and closed).

```tsx
const { data: myGigs, isLoading } = useMyGigs(user?.id);
```

Query key: `["my-gigs", userId]` · Enabled: `!!userId`

### `useGigById(id)` — `src/hooks/useGigs.tsx`

Single gig by ID.

```tsx
const { data: gig, isLoading } = useGigById(gigId);
```

Query key: `["gig", id]` · Returns `GigRow | null`

### `useGitHub()` — `src/hooks/useGitHub.tsx`

Full GitHub integration management. See [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) for the complete flow.

Key methods:

- `connectToGitHub()` — redirects to GitHub OAuth
- `syncRepositories()` — invokes `github-repositories` edge function
- `updateRepositoryCollaboration(ids, allow)` — toggles collaboration per repo
- `disconnectGitHub()` — soft-deletes by setting `is_active = false`
- `checkIntegration()` — checks for active integration record

### `useGitHubIssues()` — `src/hooks/useGitHubIssues.tsx`

Issues from the user's collaboration-enabled repos via the `github-issues` edge function.

```tsx
const { issues, repositories, loading, error, refetch } = useGitHubIssues();
```

Returns typed `GitHubIssue[]` with category, priority, label, and assignee info.

### `useClaimedIssues()` — `src/hooks/useClaimedIssues.tsx`

CRUD for the `claimed_issues` table.

```tsx
const { claimedIssues, claimIssue, unclaimIssue, updateStatus } = useClaimedIssues();
```

- `claimIssue(issue)` — inserts into `claimed_issues`, handles duplicates gracefully
- `unclaimIssue(issueId)` — removes claim
- `updateStatus(issueId, status)` — `todo → in-progress → in-review → done`
- `toUnifiedIssue(claimed)` — converts DB record to UI format

### `useOrganizations()` — `src/hooks/useOrganizations.tsx`

Organization management.

```tsx
const { organizations, createOrganization, joinOrganization, leaveOrganization } =
  useOrganizations();
```

Fetches orgs via `organization_members` join on `organizations`. `createOrganization()` creates the org and inserts the user as `owner` in a single transaction.

### `useTeams()` — `src/hooks/useTeams.tsx`

Team CRUD with React Query mutations.

```tsx
const { teams, isLoading, createTeam, deleteTeam, removeMember } = useTeams();
```

Query key: `["teams", userId]` · Fetches teams with members and projects in parallel · `createTeam` mutation invalidates `["teams", userId]`

### `useSubscription()` — `src/hooks/useSubscription.tsx`

Subscription state with auto-demotion check. See [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md) for full details.

```tsx
const { plan, isPro, isProPlus, canCreateGig, canCreateTeam } = useSubscription();
```

---

## Auth-Gated Queries

Queries that depend on the user being authenticated must use the `enabled` flag and pass `session?.access_token` in the headers of edge function calls.

```tsx
export function useProtectedData() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['protected-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('protected_table')
        .select('id, name, status, created_at');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!session, // don't fire until session exists
  });
}
```

For edge function calls that require authentication:

```tsx
const { data, error } = await supabase.functions.invoke('github-issues', {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

**Why `enabled: !!session` matters:** Without this guard, the query fires immediately on page load before Supabase has restored the session from storage. RLS returns an empty array (not an error) — leading to a brief empty state that snaps to populated data, which is jarring. The `enabled` flag prevents the first spurious empty render.

---

## Error Handling

### Supabase queries

Always destructure and throw the error. React Query captures it in `isError` and `error`.

```tsx
const { data, error } = await supabase.from('gigs').select('id, title, status');
if (error) throw error;
```

### Edge function calls

Edge functions return structured error objects. Check the response before using the data.

```tsx
const { data, error } = await supabase.functions.invoke('github-issues', {
  headers: { Authorization: `Bearer ${session.access_token}` },
});

if (error) throw new Error(error.message);
if (!data.success) throw new Error(data.error ?? 'Unknown error');
```

### In components

Use `isLoading`, `isError`, and the `error` object from the hook's return value:

```tsx
const { data: gigs, isLoading, isError, error } = useGigs();

if (isLoading) return <GigListSkeleton />;
if (isError) return <ErrorState message={error.message} />;
if (!gigs?.length) return <EmptyState message="No gigs found" />;

return <GigList gigs={gigs} />;
```

### RLS empty results

When RLS policies block access, Supabase returns an **empty array, not an error**. Always handle empty arrays explicitly with an `EmptyState` component — never assume a non-empty result.

---

## Mutations and Cache Invalidation

### Standard mutation

```tsx
const queryClient = useQueryClient();

const createGig = useMutation({
  mutationFn: async (input: CreateGigInput) => {
    const { data, error } = await supabase.from('gigs').insert(input).select().single();

    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    // Invalidate the list query so it refetches with the new item
    queryClient.invalidateQueries({ queryKey: ['gigs'] });
    queryClient.invalidateQueries({ queryKey: ['my-gigs', user?.id] });
    toast.success('Gig created');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### Optimistic update

For operations where immediate feedback matters (status changes, saves):

```tsx
const updateStatus = useMutation({
  mutationFn: async ({ id, status }: { id: string; status: string }) => {
    const { error } = await supabase.from('claimed_issues').update({ status }).eq('id', id);

    if (error) throw error;
  },
  onMutate: async ({ id, status }) => {
    // Cancel in-flight queries for this key
    await queryClient.cancelQueries({ queryKey: ['claimed-issues'] });

    // Snapshot the previous value for rollback
    const previous = queryClient.getQueryData(['claimed-issues']);

    // Optimistically update the cache
    queryClient.setQueryData(['claimed-issues'], (old: ClaimedIssue[]) =>
      old.map((issue) => (issue.id === id ? { ...issue, status } : issue))
    );

    return { previous };
  },
  onError: (_err, _vars, context) => {
    // Roll back to the snapshot on error
    queryClient.setQueryData(['claimed-issues'], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['claimed-issues'] });
  },
});
```

---

## Edge Function Invocation

```tsx
const { data, error } = await supabase.functions.invoke('function-name', {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
  body: { key: 'value' },
});
```

Always check `error` before using `data`. Edge function errors are returned as `error.message` from the Supabase client.

---

## Type Helpers

### `GigRow`

TypeScript interface matching the `gigs` table schema — auto-generated in `src/integrations/supabase/types.ts`.

### `gigRowToExploreGig(row: GigRow): ExploreGig`

Converts a `GigRow` database record to the `ExploreGig` UI interface used by card components. Maps database column names to UI-friendly prop names.

### `formatPostedAt(dateStr: string): string`

Converts ISO date strings to human-readable relative times: "Just now", "3 hours ago", "2 days ago".

---

## Anti-Patterns

| Anti-pattern                             | Why it's wrong                                               | Correct approach                                       |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| `SELECT *` on `github_integrations`      | Returns `access_token` to the client                         | Explicit column list — never include `access_token`    |
| `useEffect + useState` for data fetching | Bypasses React Query caching and loading states              | Use `useQuery`                                         |
| No `enabled` flag on dependent queries   | Query fires before its dependency is ready                   | Add `enabled: !!dependency`                            |
| Ignoring RLS empty results               | Leads to broken empty states                                 | Show `EmptyState` component for `[]`                   |
| Missing `if (error) throw error`         | Error is silently swallowed                                  | Always throw Supabase errors                           |
| Raw `fetch()` to Supabase REST           | Bypasses the client's auth handling and type safety          | Always use the `supabase` client from `@/integrations` |
| `Math.random()` in render for chart data | Changes on every render, making components non-deterministic | Use stable data from hooks or the DB                   |
| Fetching in presentational components    | Couples rendering to data fetching                           | Fetch in pages/containers; pass data via props         |
