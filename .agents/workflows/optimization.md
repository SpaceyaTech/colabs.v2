---
description: optimization
---

# Optimization agent — Colabs

You are working on a React 18 + Vite 5 SPA backed by Supabase. There is no custom backend server. Performance work spans three surfaces: the React client, the Supabase data layer, and the Supabase Edge Functions.

**Performance targets from the PRD:**

- LCP (Largest Contentful Paint): < 3 seconds on a 3G connection
- Time to Interactive: < 5 seconds on a 3G connection
- Client-side navigation: < 300 ms
- Viewport support: 320 px – 2560 px

---

## Table of Contents

- [Before you start](#before-you-start)
- [Bundle optimization](#bundle-optimization)
- [React rendering](#react-rendering)
- [TanStack Query cache tuning](#tanstack-query-cache-tuning)
- [Supabase query performance](#supabase-query-performance)
- [Edge function performance](#edge-function-performance)
- [Image and asset optimization](#image-and-asset-optimization)
- [Core Web Vitals checklist](#core-web-vitals-checklist)
- [What not to optimize prematurely](#what-not-to-optimize-prematurely)

---

## Before you start

Always measure before changing anything. Guessing at bottlenecks wastes time and can introduce regressions.

**Measure first:**

```bash
# Bundle analysis — find what is large
npm run build
npx vite-bundle-analyzer dist/

# Lighthouse CLI against the preview build
npm run preview &
npx lighthouse http://localhost:4173 --view

# React DevTools Profiler
# Open DevTools → Profiler → Record → interact → stop
# Look for components that re-render frequently or take > 2ms to render

# Supabase query timing
# Supabase Dashboard → SQL Editor → run EXPLAIN ANALYZE on slow queries
```

**Read first:**

- `docs/DATA_FLOW.md` — understand which data is live vs mock before optimizing fetches
- `docs/DATA_FETCHING.md` — understand the existing React Query patterns

---

## Bundle optimization

### Route-level code splitting

All page components must be lazy-loaded. This is already the pattern in `src/App.tsx` — do not regress it.

```tsx
// ✅ Correct — lazy loaded route
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// ❌ Wrong — eagerly loaded page adds to initial bundle
import Marketplace from './pages/Marketplace';
```

Wrap lazy routes in `<Suspense>` with a skeleton fallback:

```tsx
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/marketplace" element={<Marketplace />} />
  </Routes>
</Suspense>
```

### Heavy library splitting

These libraries are large and should only load when needed:

| Library             | Size    | Strategy                                                          |
| ------------------- | ------- | ----------------------------------------------------------------- |
| Recharts            | ~500 KB | Already in analytics/profile only — keep it there                 |
| Framer Motion       | ~100 KB | Lazy-load animation-heavy sections; avoid importing on every page |
| `@hello-pangea/dnd` | ~60 KB  | Only used in Teams kanban — keep lazy                             |
| shadcn/ui           | Varies  | Already tree-shaken per component — no action needed              |

Check for accidental barrel imports that defeat tree-shaking:

```tsx
// ❌ Imports the entire recharts bundle
import * as Recharts from 'recharts';

// ✅ Named imports — only bundles what is used
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
```

### Vite chunk strategy

Add to `vite.config.ts` to keep vendor chunks separate and cacheable:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        "vendor-react":   ["react", "react-dom", "react-router-dom"],
        "vendor-query":   ["@tanstack/react-query"],
        "vendor-supabase": ["@supabase/supabase-js"],
        "vendor-charts":  ["recharts"],
        "vendor-motion":  ["framer-motion"],
        "vendor-dnd":     ["@hello-pangea/dnd"],
      },
    },
  },
},
```

### Bundle size budgets

Add to `vite.config.ts` to warn when chunks exceed targets:

```ts
build: {
  chunkSizeWarningLimit: 300, // KB — warn if any chunk exceeds this
}
```

Target: initial JS bundle (excluding lazy routes) < 200 KB gzipped.

---

## React rendering

### Identifying unnecessary re-renders

Use React DevTools Profiler. A component re-rendering with the same props is a candidate for memoization.

Before memoizing, ask: **is this component actually slow?** Memoization has overhead — only apply it to components that are visually expensive (charts, long lists) or re-render frequently due to a parent's state changes.

### Memoization — when and where

**Chart components** — Recharts renders are expensive. Wrap with `React.memo` and memoize data transforms:

```tsx
// ✅ Memoize expensive chart data transformation
const chartData = useMemo(() => activityData.map(transformForChart), [activityData]);

// ✅ Stable callback reference for mutation handlers
const handleSave = useCallback((id: string) => saveGig.mutate(id), [saveGig]);
```

**List items** — Only memoize list item components when the list is long (50+ items) and the parent re-renders frequently. For short lists, the memo overhead can exceed the render cost.

**Never memoize everything by default.** Profile first.

### Virtualization for long lists

If any list renders more than 100 items (gig listings, issue lists, repo lists), add virtualization:

```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: gigs.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120, // estimated row height in px
});
```

### Animation performance

Framer Motion animations must only animate `transform` and `opacity` properties. Animating `height`, `width`, `top`, `left`, or `padding` triggers layout reflow on every frame.

```tsx
// ✅ GPU-accelerated — no layout reflow
animate={{ opacity: 1, x: 0, scale: 1 }}

// ❌ Triggers layout reflow on every frame
animate={{ height: "auto", marginTop: 16 }}
```

Respect reduced motion:

```tsx
// ✅ Reactive listener for user system preferences
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

const prefersReducedMotion = usePrefersReducedMotion();

<motion.div animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }} />;
```

---

## TanStack Query cache tuning

The default React Query `staleTime` is 0 (data is immediately stale). For Colabs, data freshness requirements vary significantly by type.

### Recommended `staleTime` values

```tsx
// Active gig listings — change infrequently, OK to cache for 5 minutes
useQuery({
  queryKey: ['gigs'],
  queryFn: fetchGigs,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
});

// Single gig detail — changes rarely, cache aggressively
useQuery({
  queryKey: ['gig', id],
  queryFn: () => fetchGigById(id),
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
});

// Claimed issues — user-specific, changes with user actions
useQuery({
  queryKey: ['claimed-issues'],
  queryFn: fetchClaimedIssues,
  staleTime: 30 * 1000, // 30 seconds — fresher
  gcTime: 5 * 60 * 1000,
});

// GitHub issues — fetched from external API via edge function
// Cache aggressively to avoid GitHub rate limits
useQuery({
  queryKey: ['github-issues'],
  queryFn: fetchGitHubIssues,
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false, // don't hit GitHub API on every tab switch
});

// User subscription — check on every mount, short cache
useQuery({
  queryKey: ['subscription', userId],
  queryFn: fetchSubscription,
  staleTime: 60 * 1000, // 1 minute
  refetchOnWindowFocus: true, // re-check when user returns to tab
});
```

### Prefetching for navigation

Prefetch data for likely-next pages when the user hovers a navigation link:

```tsx
const queryClient = useQueryClient();

<Link
  to="/marketplace"
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['gigs'],
      queryFn: fetchGigs,
      staleTime: 5 * 60 * 1000,
    });
  }}
>
  Marketplace
</Link>;
```

### Background refetch strategy

Disable `refetchOnWindowFocus` for data that comes from external APIs (GitHub issues) or changes rarely (gig details, project listings). Enable it for user-specific data that changes in other tabs (subscription status, claimed issues).

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // change the default — enable per-query where needed
      retry: 1, // reduce retries — Supabase errors are usually permanent
    },
  },
});
```

---

## Supabase query performance

### Identify slow queries

```sql
-- In Supabase SQL Editor — find queries taking > 100ms
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Index strategy

Add indexes for every column used in `.eq()`, `.filter()`, or `.order()` in the codebase:

```sql
-- claimed_issues — filtered by user_id on every load
CREATE INDEX CONCURRENTLY idx_claimed_issues_user_id
  ON public.claimed_issues(user_id);

-- gigs — filtered by status, ordered by created_at
CREATE INDEX CONCURRENTLY idx_gigs_status_created
  ON public.gigs(status, created_at DESC);

-- github_repositories — filtered by integration_id and allow_collaboration
CREATE INDEX CONCURRENTLY idx_github_repos_integration_collab
  ON public.github_repositories(integration_id, allow_collaboration)
  WHERE allow_collaboration = true;

-- organization_members — membership checks in RLS policies
CREATE INDEX CONCURRENTLY idx_org_members_user_org
  ON public.organization_members(user_id, organization_id);

-- team_members — membership checks in RLS policies
CREATE INDEX CONCURRENTLY idx_team_members_user_team
  ON public.team_members(user_id, team_id);
```

Use `CONCURRENTLY` to avoid locking the table during index creation in production.

### Avoid N+1 query patterns

The `useTeams()` hook fetches teams, then members, then projects in parallel — this is correct. Watch for patterns where a list query fires individual queries per row:

```tsx
// ❌ N+1 — one query per gig
const gigDetails = await Promise.all(
  gigIds.map((id) => supabase.from('gigs').select('*').eq('id', id).single())
);

// ✅ Single query with IN filter
const { data } = await supabase.from('gigs').select('id, title, status').in('id', gigIds);
```

### Pagination for large result sets

Any query that can return more than 50 rows needs pagination:

```tsx
// Offset-based pagination — simple, but degrades on large datasets (>10k rows)
// Upgrade to cursor-based (keyset) pagination when rows exceed this threshold
useQuery({
  queryKey: ['gigs', page],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('gigs')
      .select('id, title, company, budget, technologies')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) throw error;
    return data ?? [];
  },
});
```

### Select only needed columns

Every query must select only the columns the component actually uses. Never `SELECT *` in production queries.

```tsx
// ✅ Minimal — only what the GigCard needs
.select("id, title, company, budget, technologies, difficulty, is_urgent, featured")

// ❌ Fetches all 20 columns including full_description — not needed for a card
.select("*")
```

---

## Edge function performance

### Cold start mitigation

Supabase Edge Functions cold-start on the first invocation after a period of inactivity. The `github-issues` function is the most expensive because it fans out to multiple GitHub API calls.

Strategies:

1. **Cache responses in the database.** The `github_repositories` table already caches repo data. Extend the cache TTL to 15 minutes — only hit the GitHub API on explicit user-triggered syncs, not on every page load.
2. **Warm critical functions** with a lightweight ping before the user navigates to the issues page (prefetch pattern using React Query).
3. **Parallel fetching.** When calling multiple GitHub repos, use `Promise.allSettled()` instead of sequential awaits:

```typescript
// ✅ Parallel — all repos fetched simultaneously
const results = await Promise.allSettled(repos.map((repo) => fetchIssuesForRepo(repo, token)));

// ❌ Sequential — each repo waits for the previous
for (const repo of repos) {
  const issues = await fetchIssuesForRepo(repo, token);
}
```

---

## Image and asset optimization

### Project logos (Supabase Storage)

Project logos are stored in the `project-logos` bucket. Use Supabase's image transformation API for responsive sizes:

```tsx
// ✅ Request the right size for the context
const logoUrl = supabase.storage.from('project-logos').getPublicUrl(path, {
  transform: {
    width: 48,
    height: 48,
    resize: 'cover',
    format: 'webp', // WebP is 25-35% smaller than JPEG
  },
}).data.publicUrl;

// In the component — always set width/height to prevent layout shift
<img
  src={logoUrl}
  width={48}
  height={48}
  loading="lazy"
  decoding="async"
  alt={`${projectName} logo`}
/>;
```

### Avatar images

GitHub avatars accept size parameters. Always request the smallest size needed:

```tsx
// ✅ Request exactly what you render
const avatarUrl = `${github_avatar_url}&s=48`; // 48px for card avatars
const avatarUrl = `${github_avatar_url}&s=96`; // 96px for profile header
```

### Prevent layout shift (CLS)

Every image must have explicit `width` and `height` attributes so the browser can reserve space before the image loads. Never use CSS `width: 100%` without a known aspect ratio container.

---

## Core Web Vitals checklist

Run this checklist before marking any performance PR as complete.

### LCP (Largest Contentful Paint) — target < 3s on 3G

- [ ] Hero section image (if any) is preloaded: `<link rel="preload" as="image" href="...">`
- [ ] No render-blocking scripts in `<head>`
- [ ] Fonts use `font-display: swap` or are system fonts
- [ ] The largest above-the-fold element is not inside a lazy-loaded component

### CLS (Cumulative Layout Shift) — target < 0.1

- [ ] All images have explicit `width` and `height`
- [ ] Skeleton loaders match the exact dimensions of the content they replace
- [ ] No content injected above existing content after load (toasts use portals)
- [ ] Font fallbacks have similar metrics to the loaded font

### INP (Interaction to Next Paint) — target < 200ms

- [ ] Click handlers do not block the main thread for > 50ms
- [ ] Heavy computation (chart data transforms) is wrapped in `useMemo`
- [ ] Drag-and-drop (Teams kanban) uses `@hello-pangea/dnd` — no custom scroll handlers

### FID / TBT (Total Blocking Time) — target < 300ms

- [ ] No synchronous code > 50ms in the critical render path
- [ ] All heavy imports are behind `React.lazy()`
- [ ] `Math.random()` is not called on every render (causes non-deterministic paint timing)

---

## What not to optimize prematurely

These areas are frequently over-optimized. Avoid touching them without a measured baseline showing they are actually slow.

| Area                                         | Why to leave it alone                                                                         |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| React Query defaults                         | The defaults are well-chosen. Only change `staleTime` when you have measured cache miss rates |
| Component memoization on small lists         | `React.memo` has overhead. Only add it to components with measured slow renders               |
| Supabase connection pooling                  | Managed automatically by Supabase — nothing to configure                                      |
| Deno cold starts for rarely-called functions | `github-project-data` is called once per project detail view — cold start is acceptable       |
| Tailwind CSS purging                         | Vite + Tailwind already tree-shakes unused classes at build time                              |
