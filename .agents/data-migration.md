# Data migration agent — Colabs

You are replacing mock/hardcoded data with live Supabase queries. This is one of the active tech debt items blocking the v1.0 launch. The full inventory of what is mocked and the migration plan is in `docs/DATA_FLOW.md`.

**This agent covers one job:** finding mock data, understanding what live data should replace it, and writing the correct query, hook, and component update.

---

## Table of Contents

- [What is mocked and where](#what-is-mocked-and-where)
- [Migration phases](#migration-phases)
- [Phase 1 — derive from existing data](#phase-1--derive-from-existing-data)
- [Phase 2 — GitHub API enrichment](#phase-2--github-api-enrichment)
- [Phase 3 — dedicated analytics tables](#phase-3--dedicated-analytics-tables)
- [Safe migration pattern](#safe-migration-pattern)
- [Migration checklist](#migration-checklist)

---

## What is mocked and where

From `docs/DATA_FLOW.md` — every mock that needs replacing:

| Mock                      | File                                                                 | Type                                   | Blocks                   |
| ------------------------- | -------------------------------------------------------------------- | -------------------------------------- | ------------------------ |
| `mockIssues` array        | `src/components/dashboard/OverviewTab.tsx`                           | Hardcoded array                        | Dashboard Issues tab     |
| `mockContributionStats`   | `src/pages/Profile.tsx`, `src/components/dashboard/AnalyticsTab.tsx` | Hardcoded object                       | Profile stats, Analytics |
| `mockTechStack`           | same files                                                           | Hardcoded array                        | Tech stack chart         |
| `generateHeatmapData()`   | same files                                                           | `Math.random()` — changes every render | Contribution heatmap     |
| `mockWeeklyData`          | `src/components/dashboard/AnalyticsTab.tsx`                          | Hardcoded array                        | Weekly activity chart    |
| `mockActivityData`        | same file                                                            | Hardcoded array                        | Monthly activity chart   |
| `recentActivity`          | `src/pages/Profile.tsx`                                              | Hardcoded array                        | Activity timeline        |
| `mockProjectsContributed` | `src/pages/Profile.tsx`                                              | Hardcoded array                        | Projects list on profile |
| `getProjectMeta()`        | `src/components/dashboard/OverviewTab.tsx`                           | Deterministic random                   | Project card stats       |
| Landing page stats        | `src/components/StatsSection.tsx`                                    | Hardcoded numbers                      | Marketing section        |

---

## Migration phases

The migration is split into three phases by data availability. Phase 1 requires no schema changes. Phases 2 and 3 require new edge functions or tables.

---

## Phase 1 — derive from existing data

These metrics can be computed from data already in the database. No schema changes needed.

### 1a. Replace `mockIssues` in OverviewTab

**Current code (find in `OverviewTab.tsx`):**

```tsx
const mockIssues = [
  { id: "1", title: "Fix login redirect", ... },
  // ... hardcoded array
];
```

**Replacement:**

```tsx
// Import the real hook
import { useClaimedIssues } from '@/hooks/useClaimedIssues';

// Inside the component
const { claimedIssues, isLoading } = useClaimedIssues();

// Pass live data — component already accepts this shape
<IssuesList issues={claimedIssues} isLoading={isLoading} />;
```

The `claimed_issues` table already has `id`, `title`, `status`, `repo_full_name`, and `html_url` — exactly what the UI needs.

---

### 1b. Replace `mockContributionStats`

**What it shows:** total PRs, total commits, hours contributed, projects contributed count.

**Phase 1 approximation** — derive from `claimed_issues`:

```typescript
// src/hooks/useContributionStats.ts
export function useContributionStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['contribution-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claimed_issues')
        .select('id, repo_full_name, status, created_at')
        .eq('user_id', userId!);

      if (error) throw error;
      const issues = data ?? [];

      return {
        totalPRs: 0, // Phase 2 — GitHub API
        totalCommits: 0, // Phase 2 — GitHub API
        hoursContributed: issues.filter(i => i.status === 'done').length * 4, // heuristic
        projectsContributed: new Set(issues.map(i => i.repo_full_name)).size,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
```

Update `Profile.tsx` and `AnalyticsTab.tsx` to use this hook instead of the hardcoded object.

---

### 1c. Replace `mockTechStack`

Tech stack can be aggregated from `projects.technologies` for projects the user has claimed issues in:

```typescript
// src/hooks/useTechStack.ts
export function useTechStack(userId: string | undefined) {
  return useQuery({
    queryKey: ['tech-stack', userId],
    queryFn: async () => {
      // Get repos the user has claimed issues from
      const { data: issues } = await supabase
        .from('claimed_issues')
        .select('repo_full_name')
        .eq('user_id', userId!);

      const repoNames = [...new Set(issues?.map(i => i.repo_full_name) ?? [])];

      // Get projects matching those repos
      const { data: projects } = await supabase
        .from('projects')
        .select('technologies')
        .in(
          'github_url',
          repoNames.map(r => `https://github.com/${r}`)
        );

      // Count technology occurrences
      const counts: Record<string, number> = {};
      projects?.forEach(p => {
        p.technologies?.forEach((tech: string) => {
          counts[tech] = (counts[tech] ?? 0) + 1;
        });
      });

      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([name, projects]) => ({
          name,
          projects,
          proficiency: Math.min(projects * 20, 100), // heuristic — Phase 3 replaces this
          color: techColor(name),
        }));
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}
```

---

### 1d. Replace `generateHeatmapData()` — highest priority

This function uses `Math.random()` in a render path. The heatmap re-generates completely on every render, causing non-deterministic flickering. This must be fixed immediately.

**Current code:**

```typescript
function generateHeatmapData() {
  return Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    count: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
  }));
}
```

**Phase 1 replacement** — use `claimed_issues.created_at` and `updated_at` as contribution events:

```typescript
// src/hooks/useContributionHeatmap.ts
export function useContributionHeatmap(userId: string | undefined) {
  return useQuery({
    queryKey: ['heatmap', userId],
    queryFn: async () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data, error } = await supabase
        .from('claimed_issues')
        .select('created_at, updated_at')
        .eq('user_id', userId!)
        .gte('created_at', oneYearAgo.toISOString());

      if (error) throw error;

      // Count events per calendar day
      const dayCounts: Record<string, number> = {};
      data?.forEach(issue => {
        const claimDay = issue.created_at.split('T')[0];
        dayCounts[claimDay] = (dayCounts[claimDay] ?? 0) + 1;
      });

      // Build 365-day array — zero for days with no activity
      return Array.from({ length: 365 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (364 - i));
        const dateStr = date.toISOString().split('T')[0];
        return { date: dateStr, count: dayCounts[dateStr] ?? 0 };
      });
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
}
```

---

### 1e. Replace `mockProjectsContributed`

```typescript
// src/hooks/useContributedProjects.ts
export function useContributedProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['contributed-projects', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claimed_issues')
        .select('repo_full_name, title, status')
        .eq('user_id', userId!);

      if (error) throw error;

      // Group by repository
      const repoMap: Record<string, { name: string; prsCount: number; commitsCount: number }> = {};
      data?.forEach(issue => {
        const [owner, name] = issue.repo_full_name.split('/');
        if (!repoMap[issue.repo_full_name]) {
          repoMap[issue.repo_full_name] = { name, prsCount: 0, commitsCount: 0 };
        }
        if (issue.status === 'done') repoMap[issue.repo_full_name].prsCount += 1;
      });

      return Object.entries(repoMap).map(([fullName, meta]) => ({
        id: fullName,
        name: meta.name,
        owner: fullName.split('/')[0],
        language: 'Unknown', // Phase 2: enrich from github_repositories
        stars: 0, // Phase 2: enrich from github_repositories
        prsCount: meta.prsCount,
        commitsCount: meta.commitsCount,
        role: 'contributor' as const,
      }));
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}
```

---

## Phase 2 — GitHub API enrichment

Phase 2 requires a new edge function: `github-user-stats`. It calls the GitHub Events API on behalf of the user to retrieve actual PR and commit counts.

### New edge function: `github-user-stats`

```typescript
// supabase/functions/github-user-stats/index.ts
// Fetches real contribution stats from GitHub Events API
//
// Returns:
//   - totalPRs: number of merged PRs in last 90 days
//   - totalCommits: number of push events in last 90 days
//   - recentActivity: last 20 events (PR, push, comment)

Deno.serve(async req => {
  // Standard auth + CORS boilerplate (see .agents/backend.md)
  // ...

  // Get the user's GitHub access token
  const { data: integration } = await adminClient
    .from('github_integrations')
    .select('access_token, github_username')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!integration?.access_token) {
    return new Response(JSON.stringify({ error: 'GitHub not connected' }), { status: 400 });
  }

  // GitHub Events API — last 90 days of public events
  const response = await fetch(
    `https://api.github.com/users/${integration.github_username}/events?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  const events = await response.json();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recent = events.filter((e: any) => new Date(e.created_at) > ninetyDaysAgo);

  return new Response(
    JSON.stringify({
      success: true,
      totalPRs: recent.filter(
        (e: any) =>
          e.type === 'PullRequestEvent' &&
          e.payload.action === 'closed' &&
          e.payload.pull_request?.merged
      ).length,
      totalCommits: recent
        .filter((e: any) => e.type === 'PushEvent')
        .reduce((sum: number, e: any) => sum + (e.payload.commits?.length ?? 0), 0),
      recentActivity: recent.slice(0, 20).map((e: any) => ({
        type: e.type,
        repo: e.repo.name,
        date: e.created_at,
        summary: summarizeEvent(e),
      })),
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
```

---

## Phase 3 — dedicated analytics tables

Phase 3 creates denormalized tables for performance at scale. Only needed when Phase 1 queries become slow (>200ms).

### New table: `contribution_snapshots`

```sql
-- Migration: create_contribution_snapshots
CREATE TABLE public.contribution_snapshots (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date   DATE        NOT NULL,
  commits_count   INTEGER     NOT NULL DEFAULT 0,
  prs_count       INTEGER     NOT NULL DEFAULT 0,
  issues_claimed  INTEGER     NOT NULL DEFAULT 0,
  repos_count     INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, snapshot_date)
);

ALTER TABLE public.contribution_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON public.contribution_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_snapshots_user_date
  ON public.contribution_snapshots(user_id, snapshot_date DESC);
```

### Populate via background job

A nightly edge function (`refresh-contribution-snapshots`) queries `claimed_issues` grouped by date and upserts into `contribution_snapshots`. The heatmap and charts then query this pre-aggregated table instead of the raw events table.

---

## Safe migration pattern

Always follow this pattern when replacing a mock with a live query. Never remove the mock until the live query is verified in staging.

### Step 1 — Add the hook with a mock fallback

```typescript
export function useContributionStats(userId: string | undefined) {
  const query = useQuery({
    /* ... live query ... */
  });

  // Fallback to mock while the feature is being validated
  if (query.isLoading || query.isError) {
    return {
      ...query,
      data: MOCK_CONTRIBUTION_STATS, // keep mock as fallback during transition
    };
  }
  return query;
}

// TODO: Remove MOCK_CONTRIBUTION_STATS fallback after staging validation
const MOCK_CONTRIBUTION_STATS = { totalPRs: 0, totalCommits: 0 /* ... */ };
```

### Step 2 — Update the component to handle loading and empty states

```tsx
// Add loading and empty state handling that wasn't needed with hardcoded data
const { data: stats, isLoading } = useContributionStats(user?.id);

if (isLoading) return <ContributionStatsSkeleton />;
if (!stats) return null;

return <ContributionStats stats={stats} />;
```

### Step 3 — Verify in staging, then remove the fallback

After confirming the live data query works in staging:

- Remove the `MOCK_*` constant
- Remove the fallback in the hook
- Update `docs/DATA_FLOW.md` to mark the item as ✅ Live

---

## Migration checklist

Track progress here. Update `docs/DATA_FLOW.md` after each item is completed.

### Phase 1 (no schema changes)

- [ ] Replace `mockIssues` in `OverviewTab.tsx` with `useClaimedIssues()`
- [ ] Add `useContributionStats()` hook — derive from `claimed_issues`
- [ ] Add `useContributionHeatmap()` hook — replace `generateHeatmapData()` (uses `Math.random()`) with live data
- [ ] Add `useTechStack()` hook — aggregate from `projects.technologies`
- [ ] Add `useContributedProjects()` hook — group `claimed_issues` by repo
- [ ] Replace `mockContributionStats` in `Profile.tsx` and `AnalyticsTab.tsx`
- [ ] Replace `mockTechStack` in `Profile.tsx` and `AnalyticsTab.tsx`
- [ ] Replace `mockWeeklyData` in `AnalyticsTab.tsx` with derived data
- [ ] Replace `recentActivity` in `Profile.tsx` with `claimed_issues` events
- [ ] Remove `getProjectMeta()` random function from `OverviewTab.tsx`
- [ ] Add loading and empty states to all replaced components
- [ ] Update `docs/DATA_FLOW.md` mock inventory table

### Phase 2 (new edge function)

- [ ] Create `github-user-stats` edge function
- [ ] Update `useContributionStats` to call edge function for PR and commit counts
- [ ] Enrich `useContributedProjects` with `stars` and `language` from `github_repositories`
- [ ] Update `recentActivity` to use GitHub Events API data

### Phase 3 (new tables — when Phase 1 queries are too slow)

- [ ] Create `contribution_snapshots` migration
- [ ] Create `user_tech_stack` migration
- [ ] Create `refresh-contribution-snapshots` edge function
- [ ] Schedule nightly refresh via pg_cron
- [ ] Update hooks to query snapshot tables instead of raw `claimed_issues`
