# Data Flow & Display Architecture

This document maps how every data entity in Colabs is **sourced**, **fetched**, **transformed**, and **rendered** in the UI — ensuring the display layer never breaks regardless of data state.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Data Source Inventory](#data-source-inventory)
- [Page-by-Page Data Flow](#page-by-page-data-flow)
- [Component Data Contracts](#component-data-contracts)
- [Mock vs Live Data Audit](#mock-vs-live-data-audit)
- [Error & Empty State Handling](#error--empty-state-handling)
- [Design System Compliance](#design-system-compliance)
- [Migration Plan: Mock → Live](#migration-plan-mock--live)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│  Pages → Sections → Components → UI Primitives          │
│  (shadcn/ui + Tailwind semantic tokens)                 │
└────────────────────┬────────────────────────────────────┘
                     │ Props (typed interfaces)
┌────────────────────┴────────────────────────────────────┐
│                  Data Layer                              │
│  Custom Hooks (useGigs, useTeams, useClaimedIssues...)   │
│  TanStack React Query (cache, background refetch)       │
│  Supabase Client (direct queries)                       │
│  Edge Functions (GitHub API proxy)                      │
└────────────────────┬────────────────────────────────────┘
                     │ SQL / HTTP
┌────────────────────┴────────────────────────────────────┐
│                Backend Layer                             │
│  Supabase PostgreSQL (15 tables, RLS-protected)         │
│  Supabase Edge Functions (Deno, 4 functions)            │
│  Supabase Storage (2 buckets)                           │
│  GitHub REST API (via edge functions)                   │
└─────────────────────────────────────────────────────────┘
```

### Key Principle

> **Components receive data via typed props — they never fetch data themselves.**  
> Pages and container components own the data lifecycle; presentational components render whatever they receive.

---

## Data Source Inventory

| Data Entity | Source | Fetch Method | Hook | Caching |
|---|---|---|---|---|
| Auth User | Supabase Auth | `onAuthStateChange` listener | `useAuth()` | Context (app-wide) |
| Gigs (active) | `gigs` table | Direct query | `useGigs()` | React Query `["gigs"]` |
| Gigs (user's) | `gigs` table | Direct query | `useMyGigs(userId)` | React Query `["my-gigs", userId]` |
| Single Gig | `gigs` table | Direct query | `useGigById(id)` | React Query `["gig", id]` |
| GitHub Integration | `github_integrations` table | Direct query (safe columns only) | `useGitHub()` | Local state |
| GitHub Repositories | `github_repositories` table + edge fn | Edge function + direct query | `useGitHub()` | Local state |
| GitHub Issues | GitHub API via edge function | `supabase.functions.invoke('github-issues')` | `useGitHubIssues()` | Local state |
| Project Data (GitHub) | GitHub API via edge function | `supabase.functions.invoke('github-project-data')` | Direct invocation | None |
| Claimed Issues | `claimed_issues` table | Direct query | `useClaimedIssues()` | Local state |
| Projects | `projects` table | Direct query | Inline `useQuery` | React Query `["projects"]` |
| Teams | `teams` + `team_members` + `team_projects` | Direct query (parallel) | `useTeams()` | React Query `["teams", userId]` |
| Organizations | `organizations` + `organization_members` | Join query | `useOrganizations()` | Local state |
| Proposals | `proposals` + `proposal_milestones` | Direct query | Inline queries | React Query |
| Saved Jobs | `saved_jobs` table | Direct query | Inline queries | React Query |
| Contribution Stats | **Mock data** | Hardcoded constants | None | N/A |
| Tech Stack | **Mock data** | Hardcoded constants | None | N/A |
| Activity Charts | **Mock data** | Hardcoded constants | None | N/A |
| Contribution Heatmap | **Mock data** | `Math.random()` generator | None | N/A |
| Weekly Activity | **Mock data** | Hardcoded constants | None | N/A |
| Dashboard Issues | **Mock data** | Hardcoded constants | None | N/A |
| Recent Activity Feed | **Mock data** | Hardcoded constants | None | N/A |

---

## Page-by-Page Data Flow

### `/` — Landing Page

```
Index.tsx
├── HeroSection          → Static content (no data fetch)
├── StatsSection         → Static content (hardcoded numbers)
├── AnalyticsSection     → Static content (feature cards)
├── FeaturedGigsCarousel → useGigs() → filters featured=true → ExploreGigCard[]
├── TestimonialsSection  → Static content
├── FAQSection           → Static content
└── CTASection           → Static content
```

**Data flow**: Only `FeaturedGigsCarousel` fetches live data. All other sections are static marketing content.

---

### `/dashboard` — Dashboard (OverviewTab default)

```
Dashboard.tsx
├── useAuth()          → user context
├── useQuery(projects) → projects[] from Supabase
│
├── OverviewTab
│   ├── mockIssues[]           → ⚠️ MOCK — hardcoded issue list
│   ├── projects (prop)        → ✅ LIVE — from useQuery
│   └── getProjectMeta()       → ⚠️ MOCK — deterministic random stats
│
├── ProjectsTab
│   └── projects (prop)        → ✅ LIVE — from useQuery
│
├── IssuesTab
│   └── useClaimedIssues()     → ✅ LIVE — from claimed_issues table
│
├── GigsTab
│   └── useMyGigs(userId)      → ✅ LIVE — from gigs table
│
├── TeamsTab
│   └── useTeams()             → ✅ LIVE — from teams + members + projects
│
├── AnalyticsTab
│   ├── mockContributionStats  → ⚠️ MOCK
│   ├── mockTechStack          → ⚠️ MOCK
│   ├── mockActivityData       → ⚠️ MOCK
│   ├── mockWeeklyData         → ⚠️ MOCK
│   └── generateHeatmapData() → ⚠️ MOCK (random)
│
└── SettingsTab                → Static form
```

---

### `/profile` — User Profile

```
Profile.tsx
├── useAuth()                → ✅ LIVE — user email, avatar, created_at
├── mockContributionStats    → ⚠️ MOCK — PRs, commits, hours, projects count
├── mockTechStack            → ⚠️ MOCK — language proficiency bars
├── mockProjectsContributed  → ⚠️ MOCK — project list with stars/PRs/commits
├── recentActivity           → ⚠️ MOCK — activity timeline
└── generateHeatmapData()   → ⚠️ MOCK — random heatmap grid
```

**Key insight**: The Profile page is almost entirely mock data. Only the user header (name, email, avatar, join date) comes from Supabase Auth.

---

### `/marketplace` — Gig Marketplace

```
Marketplace.tsx
├── useGigs()              → ✅ LIVE — active gigs from Supabase
├── Client-side filtering  → category, difficulty, budget range, search text
└── ExploreGigCard[]       → gigRowToExploreGig() transforms DB row → UI shape
```

**Transform function**: `gigRowToExploreGig(row: GigRow): ExploreGig` maps database column names to UI-friendly prop names.

---

### `/projects` — Explore Projects

```
Projects.tsx
├── useQuery(["projects"]) → ✅ LIVE — public/unlisted projects from Supabase
├── Client-side filtering  → technology, experience level, category, search
└── ProjectCard[]          → Direct prop mapping from project row
```

---

### `/issues` — All Issues

```
AllIssues.tsx
├── useGitHubIssues()      → ✅ LIVE — issues via github-issues edge function
├── useClaimedIssues()     → ✅ LIVE — user's claimed issues
├── Client-side filtering  → repository, labels, priority, search
└── IssueRow[] + IssueSidePanel
```

**Edge function flow**:
```
User browser
  → useGitHubIssues() hook
    → supabase.functions.invoke('github-issues')
      → Edge function queries github_integrations for user's token
        → Queries github_repositories for collaboration-enabled repos
          → Fetches issues from GitHub API per repo
            → Maps labels to categories & priority
              → Returns { issues[], repositories[] }
```

---

### `/gig/:id` — Gig Detail

```
GigDetails.tsx
├── useGigById(id)  → ✅ LIVE — single gig from Supabase
└── Full gig details rendered (company info, deliverables, requirements, budget)
```

---

### `/organizations` — Organization Listings

```
Organizations.tsx
├── useOrganizations() → ✅ LIVE — user's orgs via organization_members join
└── Organization cards with name, slug, avatar, description
```

---

## Component Data Contracts

Each analytics/data component accepts data via strictly typed props. This ensures the UI never breaks regardless of data source (mock or live).

### ContributionStats

```typescript
interface ContributionStatsProps {
  stats: {
    totalPRs: number;
    totalCommits: number;
    hoursContributed: number;
    projectsContributed: number;
  };
}
```

**Renders**: 4-card stat grid with icons. All values are plain numbers — no data transformation needed.

### ContributionHeatmap

```typescript
interface ContributionHeatmapProps {
  data: Array<{ date: string; count: number }>;
}
```

**Renders**: GitHub-style heatmap grid. Color intensity mapped via `count` thresholds:
- `0` → `bg-muted`
- `1-2` → `bg-primary/30`
- `3-5` → `bg-primary/50`
- `6-8` → `bg-primary/70`
- `9+` → `bg-primary`

**Design compliance**: All colors use semantic tokens (`bg-muted`, `bg-primary` with opacity modifiers).

### TechStackChart

```typescript
interface TechStackChartProps {
  techStack: Array<{
    name: string;
    proficiency: number;  // 0-100
    projects: number;
    color: string;        // HEX or HSL color for dot indicator
  }>;
}
```

**Renders**: Recharts RadarChart + Progress bars. Chart colors use `hsl(var(--primary))` and `hsl(var(--border))`.

### ActivityChart

```typescript
interface ActivityChartProps {
  activityData: Array<{
    month: string;
    commits: number;
    prs: number;
  }>;
}
```

**Renders**: Recharts LineChart with dual lines (commits + PRs). Grid and axis colors from semantic tokens.

### WeeklyActivityChart

```typescript
interface WeeklyActivityChartProps {
  weeklyData: Array<{
    day: string;
    hours: number;
  }>;
}
```

**Renders**: Recharts BarChart. Peak day highlighted with full `hsl(var(--primary))`, others at 50% opacity.

### ProjectsContributedList

```typescript
interface ProjectsContributedListProps {
  projects: Array<{
    id: string;
    name: string;
    owner: string;
    avatar?: string;
    language: string;
    stars: number;
    prsCount: number;
    commitsCount: number;
    role: "contributor" | "maintainer" | "owner";
  }>;
}
```

**Renders**: List rows with avatar, repo name, role badge, PR/commit counts.

---

## Mock vs Live Data Audit

### ✅ Live Data (Supabase / Edge Functions)

| Feature | Hook | Table / Source | Status |
|---|---|---|---|
| User auth state | `useAuth()` | Supabase Auth | Production-ready |
| Active gigs | `useGigs()` | `gigs` | Production-ready |
| User's gigs | `useMyGigs()` | `gigs` | Production-ready |
| Gig detail | `useGigById()` | `gigs` | Production-ready |
| GitHub integration | `useGitHub()` | `github_integrations` | Production-ready |
| GitHub repos | `useGitHub()` | `github_repositories` + edge fn | Production-ready |
| GitHub issues | `useGitHubIssues()` | Edge function → GitHub API | Production-ready |
| Claimed issues | `useClaimedIssues()` | `claimed_issues` | Production-ready |
| Projects | `useQuery` | `projects` | Production-ready |
| Teams | `useTeams()` | `teams` + `team_members` + `team_projects` | Production-ready |
| Organizations | `useOrganizations()` | `organizations` + `organization_members` | Production-ready |
| Proposals | `useQuery` | `proposals` + `proposal_milestones` | Production-ready |
| Saved jobs | `useQuery` | `saved_jobs` | Production-ready |
| File uploads | Direct Supabase Storage | `project-logos`, `resumes` buckets | Production-ready |

### ⚠️ Mock Data (Hardcoded / Random)

| Feature | Location | Mock Type | Impact |
|---|---|---|---|
| Contribution stats (PRs, commits, hours) | `Profile.tsx`, `AnalyticsTab.tsx` | Hardcoded object | Shows static numbers |
| Tech stack proficiency | `Profile.tsx`, `AnalyticsTab.tsx` | Hardcoded array | Fake language skills |
| Contribution heatmap | `Profile.tsx`, `AnalyticsTab.tsx` | `Math.random()` | Changes on every render |
| Weekly activity (hours/day) | `AnalyticsTab.tsx` | Hardcoded array | Static chart |
| Monthly activity (commits/PRs) | `AnalyticsTab.tsx` | Hardcoded array | Static chart |
| Dashboard "My Issues" | `OverviewTab.tsx` | Hardcoded array (`mockIssues`) | Fake issue list |
| Recent activity feed | `Profile.tsx` | Hardcoded array | Static timeline |
| Projects contributed | `Profile.tsx` | Hardcoded array | Fake project list |
| Project card meta (stars, forks) | `OverviewTab.tsx` | Deterministic random | Consistent but fake |
| Landing page stats | `StatsSection.tsx` | Hardcoded numbers | Marketing numbers |

---

## Error & Empty State Handling

### Loading States

All hooks that use React Query automatically provide `isLoading` which should gate rendering:

```tsx
// ✅ Correct — skeleton fallback
if (isLoading) return <Skeleton className="h-40 w-full" />;

// ✅ Correct — empty state
if (!data?.length) return <EmptyState message="No gigs found" />;
```

### Error States

Edge functions return errors that are caught and displayed via `sonner` toasts:

```tsx
// useGitHubIssues pattern
if (data.error) throw new Error(data.error);
// Caught in hook → toast.error(message)
```

### Null Safety Rules

1. **Always default arrays**: `data ?? []` on every query result
2. **Always default objects**: Use optional chaining and fallbacks in components
3. **Never assume data shape**: Check for existence before accessing nested properties
4. **Use `enabled` flag**: Disable queries until dependencies are available

```tsx
// ✅ Safe pattern
useQuery({
  queryKey: ["my-gigs", userId],
  queryFn: async () => { ... },
  enabled: !!userId,  // Don't fire until userId exists
});
```

### RLS Empty Results

When RLS policies block access, Supabase returns **empty arrays** (not errors). Handle gracefully:

```tsx
// User hasn't created any teams → empty array, not an error
const { data: teams } = useTeams();
// teams === [] → show EmptyState component
```

---

## Design System Compliance

### Chart Color Rules

All Recharts components **must** use semantic CSS custom properties:

| Use | Token | Example |
|---|---|---|
| Primary data line/bar | `hsl(var(--primary))` | Main metric |
| Grid lines | `hsl(var(--border))` | CartesianGrid |
| Axis text | `hsl(var(--muted-foreground))` | XAxis/YAxis labels |
| Empty cells | `bg-muted` | Heatmap zero state |
| Background | `bg-card` | Chart card wrapper |

### Card Wrapper Pattern

Every data visualization is wrapped in a `Card` from shadcn/ui:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Chart Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-[300px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        {/* Recharts component */}
      </ChartContainer>
    </div>
  </CardContent>
</Card>
```

### Responsive Chart Sizing

- Charts use fixed height containers: `h-[200px]`, `h-[280px]`, `h-[300px]`
- `ChartContainer` wraps `ResponsiveContainer` from Recharts
- Grid layouts use `md:grid-cols-2` for side-by-side charts on desktop

---

## Migration Plan: Mock → Live

### Phase 1 — Derive from Existing Data (No Schema Changes)

These metrics can be computed from data already in the database:

| Mock Metric | Derivation Strategy |
|---|---|
| `projectsContributed` | `COUNT(DISTINCT repo_full_name)` from `claimed_issues` |
| Dashboard "My Issues" | Replace `mockIssues` with `useClaimedIssues()` data |
| Tech stack | Aggregate `technologies[]` from `projects` user contributed to |
| Projects contributed list | Query `claimed_issues` grouped by `repo_full_name` |

### Phase 2 — GitHub API Enrichment (Edge Function Updates)

| Mock Metric | Live Source | Required Work |
|---|---|---|
| Total PRs | GitHub Events API | New edge function: `github-user-stats` |
| Total commits | GitHub Events API | Same edge function |
| Contribution heatmap | GitHub Contributions API | New edge function or GraphQL query |
| Recent activity feed | GitHub Events API | New edge function: `github-activity` |
| Hours coded | Estimated from commit timestamps | Heuristic calculation |

### Phase 3 — Dedicated Analytics Tables

For performance at scale, denormalize into analytics tables:

```sql
-- Daily contribution snapshots
CREATE TABLE contribution_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  commits_count INTEGER DEFAULT 0,
  prs_count INTEGER DEFAULT 0,
  issues_claimed INTEGER DEFAULT 0,
  repos_contributed INTEGER DEFAULT 0,
  UNIQUE(user_id, snapshot_date)
);

-- Aggregated tech stack per user
CREATE TABLE user_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  language TEXT NOT NULL,
  project_count INTEGER DEFAULT 0,
  proficiency_score INTEGER DEFAULT 0, -- 0-100
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, language)
);
```

### Migration Checklist

- [ ] Replace `mockIssues` in `OverviewTab.tsx` with `useClaimedIssues()` hook
- [ ] Replace `mockContributionStats` with computed values from `claimed_issues`
- [ ] Replace `mockTechStack` with aggregation from `projects.technologies`
- [ ] Replace `mockProjectsContributed` with `claimed_issues` grouped by repo
- [ ] Replace `recentActivity` in `Profile.tsx` with claimed issue events
- [ ] Replace `generateHeatmapData()` with real contribution dates from `claimed_issues.claimed_at`
- [ ] Create `github-user-stats` edge function for PR/commit counts
- [ ] Create `contribution_snapshots` table for historical analytics
- [ ] Create `user_tech_stack` table for proficiency tracking
- [ ] Add background job to refresh snapshots daily

---

## Data Fetching Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Pattern |
|---|---|
| Fetching inside presentational components | Fetch in page/container, pass via props |
| Using `select('*')` on sensitive tables | Explicit column list (e.g., `github_integrations`) |
| No `enabled` flag on dependent queries | Always gate with `enabled: !!dependency` |
| Ignoring RLS empty results | Show `EmptyState` component for empty arrays |
| Hardcoded colors in chart components | Use `hsl(var(--primary))` and semantic tokens |
| Raw `fetch()` to Supabase | Always use `supabase` client from `@/integrations` |
| Missing error boundaries around charts | Wrap chart sections in error boundaries |
| `Math.random()` in render for visual data | Use stable mock data or real data |
