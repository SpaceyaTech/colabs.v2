# Data Fetching

All data fetching uses **TanStack React Query** for caching, background refetching, and loading/error state management. The Supabase client (`src/integrations/supabase/client.ts`) is used for all database operations.

## Hooks Reference

### `useAuth()` — `src/hooks/useAuth.tsx`

Authentication context provider wrapping the entire app.

```tsx
const { user, session, loading, signIn, signUp, signOut, signInWithOAuth } = useAuth();
```

| Method                                  | Description                        |
| --------------------------------------- | ---------------------------------- |
| `signUp(email, password)`               | Create account with email redirect |
| `signIn(email, password)`               | Password-based login               |
| `signInWithOAuth('github' \| 'google')` | OAuth provider login               |
| `signOut()`                             | Sign out                           |

### `useGigs()` — `src/hooks/useGigs.tsx`

Fetches active gig listings from the `gigs` table.

```tsx
const { data: gigs, isLoading, error } = useGigs();
```

- Query key: `["gigs"]`
- Filters: `status = 'active'`, ordered by `created_at DESC`

### `useMyGigs(userId)` — `src/hooks/useGigs.tsx`

Fetches all gigs owned by a specific user (including paused/closed).

```tsx
const { data: myGigs, isLoading } = useMyGigs(user?.id);
```

- Query key: `["my-gigs", userId]`
- Enabled only when `userId` is truthy

### `useGigById(id)` — `src/hooks/useGigs.tsx`

Fetches a single gig by ID.

```tsx
const { data: gig, isLoading } = useGigById(gigId);
```

- Query key: `["gig", id]`
- Returns `GigRow | null`

### `useGitHub()` — `src/hooks/useGitHub.tsx`

GitHub integration management. See [GitHub Integration](./GITHUB_INTEGRATION.md).

### `useGitHubIssues()` — `src/hooks/useGitHubIssues.tsx`

Fetches GitHub issues via the `github-issues` edge function.

### `useClaimedIssues()` — `src/hooks/useClaimedIssues.tsx`

CRUD operations for the `claimed_issues` table.

### `useOrganizations()` — `src/hooks/useOrganizations.tsx`

Organization management hook.

```tsx
const { organizations, createOrganization, joinOrganization, leaveOrganization } =
  useOrganizations();
```

- Fetches orgs via `organization_members` join on `organizations`
- Auto-fetches on user change
- `createOrganization()` — Creates org + inserts user as `owner`

### `useTeams()` — `src/hooks/useTeams.tsx`

Team CRUD with React Query mutations.

```tsx
const { teams, isLoading, createTeam, deleteTeam, removeMember } = useTeams();
```

- Query key: `["teams", userId]`
- Fetches teams with members and projects in parallel
- `createTeam` mutation auto-invalidates team queries

## Type Helpers

### `GigRow`

TypeScript interface matching the `gigs` table schema.

### `gigRowToExploreGig(row)`

Converts a `GigRow` database record to the `ExploreGig` UI interface used by card components.

### `formatPostedAt(dateStr)`

Converts ISO date strings to human-readable relative times ("Just now", "3 hours ago", "2 days ago", etc.).

## Query Patterns

### Standard Query

```tsx
export function useMyData() {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      return data ?? [];
    },
  });
}
```

### Mutation with Cache Invalidation

```tsx
const mutation = useMutation({
  mutationFn: async input => {
    const { error } = await supabase.from('table').insert(input);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['my-data'] });
  },
});
```

### Edge Function Invocation

```tsx
const { data, error } = await supabase.functions.invoke('function-name', {
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: { key: 'value' },
});
```
