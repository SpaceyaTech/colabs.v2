# Frontend agent — Colabs

You are working on the React 18 + TypeScript frontend of Colabs. This file covers everything specific to `src/` — components, pages, hooks, styling, forms, routing, and animations.

The backend (Supabase database, Edge Functions, migrations) is covered in `.agents/backend.md`.
General project rules and commands are in `docs/AGENTS.md`.

---

## Table of Contents

- [Stack](#stack)
- [Project layout](#project-layout)
- [TypeScript conventions](#typescript-conventions)
- [Component conventions](#component-conventions)
- [Routing](#routing)
- [Data fetching — TanStack Query](#data-fetching--tanstack-query)
- [Forms — React Hook Form + Zod](#forms--react-hook-form--zod)
- [Styling — Tailwind + shadcn/ui](#styling--tailwindcss--shadcnui)
- [Animation — Framer Motion](#animation--framer-motion)
- [Charts — Recharts](#charts--recharts)
- [Auth integration](#auth-integration)
- [Subscription feature gating](#subscription-feature-gating)
- [Error and loading states](#error-and-loading-states)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Frontend anti-patterns](#frontend-anti-patterns)

---

## Stack

| Concern       | Library                      | Version    |
| ------------- | ---------------------------- | ---------- |
| Framework     | React                        | 18         |
| Language      | TypeScript                   | 5.x strict |
| Build         | Vite                         | 5          |
| Routing       | React Router DOM             | v6         |
| Server state  | TanStack React Query         | v5         |
| Forms         | React Hook Form + Zod        | —          |
| UI components | shadcn/ui (Radix primitives) | —          |
| Styling       | Tailwind CSS                 | 3.x        |
| Animation     | Framer Motion                | —          |
| Charts        | Recharts                     | —          |
| Drag-and-drop | @hello-pangea/dnd            | —          |

---

## Project layout

```
src/
├── App.tsx               # Route definitions — the only place routes are registered
├── main.tsx              # Entry point — QueryClient, AuthProvider, RouterProvider
├── index.css             # Design tokens — all CSS custom properties live here
│
├── components/
│   ├── ui/               # shadcn/ui — NEVER edit manually; use `npx shadcn-ui add`
│   ├── layout/           # AppLayout, TopNavLayout, BottomNav — apply at route level
│   ├── dashboard/        # Dashboard tab components
│   ├── gigs/             # Gig marketplace components
│   ├── projects/         # Project card, detail, form
│   ├── issues/           # Issue list, claim panel, filters
│   ├── teams/            # Team creation, workspace, member list
│   ├── organizations/    # Org dashboard, member management
│   └── shared/           # Used across ≥2 features: guards, modals, empty states
│
├── hooks/                # TanStack Query hooks — all server-state fetching
├── pages/                # Route-level components — one file per route
├── lib/                  # Pure utilities, Zod validators, cn()
├── types/                # Shared TypeScript interfaces
└── integrations/
    └── supabase/
        ├── client.ts     # Supabase singleton — import only from here
        └── types.ts      # Auto-generated — NEVER edit manually
```

---

## TypeScript conventions

### Strict mode — no escape hatches

```tsx
// ✅ Typed interface
interface GigCardProps {
  gig: Gig;
  onSave: (id: string) => void;
  isLoading?: boolean;
}

// ❌ Never — no any without a justifying comment
const GigCard = (props: any) => { ... }

// ⚠️  If you must use any, explain why
// biome-ignore lint: legacy API response has dynamic shape
const legacyData = response as any;
```

### Interface vs type

```tsx
interface GigCardProps { ... }       // object shapes → interface
type Status = "active" | "closed";   // unions, aliases → type
type GigWithMeta = Gig & { meta: Meta };  // intersections → type
```

### Explicit return types on hooks and utilities

```tsx
// ✅ Explicit return type
export function useGigFilters(): {
  filtered: Gig[];
  setCategory: (c: string) => void;
} { ... }

// ❌ Inferred — makes refactoring harder
export function useGigFilters() { ... }
```

### Supabase types

Always use types from `src/integrations/supabase/types.ts`. Never write manual types for database tables — they drift.

```tsx
import type { Database } from '@/integrations/supabase/types';
type GigRow = Database['public']['Tables']['gigs']['Row'];
type GigInsert = Database['public']['Tables']['gigs']['Insert'];
```

---

## Component conventions

### Structure

- Functional components only — no class components
- One component per file, named export preferred
- Components stay under **200 lines** — extract sub-components when they grow
- Props interface declared above the component function

```tsx
interface ProjectCardProps {
  project: ProjectRow;
  onSave: (id: string) => void;
}

export function ProjectCard({ project, onSave }: ProjectCardProps) {
  return ( ... );
}
```

### Where components live

| Component type       | Location                    | Rule                                 |
| -------------------- | --------------------------- | ------------------------------------ |
| shadcn/ui primitives | `src/components/ui/`        | Never edit — run `npx shadcn-ui add` |
| Feature-specific     | `src/components/<feature>/` | Used in only one feature             |
| Shared               | `src/components/shared/`    | Used across ≥2 features              |
| Layout shells        | `src/components/layout/`    | Applied at route level in `App.tsx`  |
| Route pages          | `src/pages/`                | One file per route                   |

### Data ownership

Pages and container components own the data lifecycle. Presentational components receive data via props and render it — they never call hooks that fetch data.

```tsx
// ✅ Page owns the data
export function GigListPage() {
  const { data: gigs, isLoading, isError } = useGigs();
  if (isLoading) return <GigListSkeleton />;
  if (isError) return <ErrorState />;
  return <GigList gigs={gigs ?? []} />;
}

// ✅ Presentational component renders what it receives
export function GigList({ gigs }: { gigs: Gig[] }) {
  return gigs.map((gig) => <GigCard key={gig.id} gig={gig} />);
}

// ❌ Presentational component fetching its own data
export function GigList() {
  const { data } = useGigs(); // wrong — data ownership belongs to the page
}
```

### Lazy loading pages

All page components must use `React.lazy()`:

```tsx
// src/App.tsx
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Wrap routes in Suspense
<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/marketplace" element={<Marketplace />} />
  </Routes>
</Suspense>;
```

---

## Routing

All routes are defined in `src/App.tsx`. Never define routes elsewhere.

### Adding a route

1. Create `src/pages/YourPage.tsx`
2. Add a `lazy()` import in `App.tsx`
3. Add the route to the `<Routes>` tree
4. Add the new route to the Route Map in `docs/PRD.md`
5. Wrap authenticated routes in `<AuthGuard>`

```tsx
// src/App.tsx
const YourPage = lazy(() => import('./pages/YourPage'));

<Route
  path="/your-path"
  element={
    <AuthGuard>
      <AppLayout>
        <YourPage />
      </AppLayout>
    </AuthGuard>
  }
/>;
```

### Layout application

Apply layout shells at the route level — never inside a page component:

```tsx
// ✅ Layout applied at route level
<Route
  element={
    <AppLayout>
      <Dashboard />
    </AppLayout>
  }
/>;

// ❌ Layout applied inside the page
export function Dashboard() {
  return <AppLayout>...</AppLayout>; // don't do this
}
```

---

## Data fetching — TanStack Query

Full patterns in `docs/DATA_FETCHING.md`. These are the must-knows:

### Standard query

```tsx
export function useGigs() {
  return useQuery({
    queryKey: ['gigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gigs')
        .select('id, title, company, budget, technologies, difficulty, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### Conditional query — always gate with `enabled`

```tsx
useQuery({
  queryKey: ["my-gigs", userId],
  queryFn: async () => { ... },
  enabled: !!userId,   // never fire before userId is available
});
```

### Mutation with optimistic update

```tsx
const updateStatus = useMutation({
  mutationFn: async ({ id, status }) => {
    const { error } = await supabase.from('claimed_issues').update({ status }).eq('id', id);
    if (error) throw error;
  },
  onMutate: async ({ id, status }) => {
    await queryClient.cancelQueries({ queryKey: ['claimed-issues'] });
    const previous = queryClient.getQueryData(['claimed-issues']);
    queryClient.setQueryData(['claimed-issues'], (old: ClaimedIssue[]) =>
      old.map((i) => (i.id === id ? { ...i, status } : i))
    );
    return { previous };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['claimed-issues'], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['claimed-issues'] });
  },
});
```

### Query key conventions

```
["gigs"]                    list
["gig", gigId]              single entity
["my-gigs", userId]         user-scoped list
["proposals", gigId]        nested / related list
["subscription", userId]    user-specific singleton
```

---

## Forms — React Hook Form + Zod

All forms use React Hook Form with a Zod schema resolver. No uncontrolled inputs.

### Schema definition

```tsx
// src/lib/validators.ts — or inline for form-specific schemas
const createGigSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Describe the gig in at least 10 characters'),
  budget: z.number().positive('Budget must be a positive number'),
  difficulty: z.enum(['entry', 'intermediate', 'expert']),
  technologies: z.array(z.string()).min(1, 'Add at least one technology'),
});

type CreateGigValues = z.infer<typeof createGigSchema>;
```

### Form setup

```tsx
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<CreateGigValues>({
  resolver: zodResolver(createGigSchema),
  defaultValues: { difficulty: 'intermediate' },
});
```

### Error display

```tsx
<div className="space-y-1">
  <Input {...register('title')} className={errors.title ? 'border-destructive' : ''} />
  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
</div>
```

### Submit handler

```tsx
const onSubmit = handleSubmit(async (values) => {
  try {
    await createGig.mutateAsync(values);
    toast.success('Gig created');
    onClose();
  } catch (error) {
    toast.error(error.message);
  }
});
```

---

## Styling — Tailwind CSS + shadcn/ui

### Semantic tokens — always

The design system uses HSL CSS custom properties defined in `src/index.css`. Always use the semantic token names, never raw colour values.

```tsx
// ✅ Semantic tokens — adapts to dark mode automatically
<div className="bg-background text-foreground border border-border">
<p className="text-muted-foreground text-sm">
<div className="bg-primary text-primary-foreground">

// ❌ Raw colours — breaks dark mode
<div className="bg-white text-gray-900 border border-gray-200">
<div style={{ backgroundColor: "#fff", color: "#111" }}>
```

### Available semantic tokens

```
Backgrounds:   bg-background, bg-card, bg-popover, bg-primary, bg-secondary,
               bg-muted, bg-accent, bg-destructive
Text:          text-foreground, text-card-foreground, text-muted-foreground,
               text-primary-foreground, text-destructive
Borders:       border-border, border-input, ring-ring
```

### shadcn/ui components

Use shadcn/ui primitives for all standard UI elements. Do not write custom buttons, dialogs, inputs, or dropdowns from scratch.

```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toast } from '@/components/ui/toast';
```

Add new components with:

```bash
npx shadcn-ui add <component-name>
```

### Dark mode

Dark mode is toggled via the `dark` class on `<html>`. When semantic tokens are used correctly, components adapt automatically. Test both modes before opening a PR.

### Responsive design

Use Tailwind breakpoints:

```
sm:   640px+   (large mobile)
md:   768px+   (tablet)
lg:   1024px+  (desktop)
xl:   1280px+
2xl:  1536px+
```

The app must work at 320 px (minimum) and 2560 px (maximum). Test on mobile — the bottom navigation (`BottomNav`) appears at `< md` breakpoint.

---

## Animation — Framer Motion

Use Framer Motion only for meaningful transitions: page enter/exit, content reveal, list item appear. Do not animate for decoration.

### Performance rules

Only animate `transform` and `opacity`. Other properties trigger layout reflow.

```tsx
// ✅ GPU-composited — no reflow
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>

// ❌ Triggers layout reflow on every frame
<motion.div animate={{ height: "auto", padding: 16 }}>
```

### Reduced motion

Always respect `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from 'framer-motion';

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

### Scroll animations

Use `whileInView` with a viewport margin so elements do not animate before they are close to visible:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, margin: "-100px" }}
>
```

---

## Charts — Recharts

Charts are used in the Analytics tab and Profile page. Currently all chart data is mocked — see `docs/DATA_FLOW.md` for the migration plan.

### Required structure

Every chart must be wrapped in a `Card` with a fixed-height container:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Weekly Activity</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData}>
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <Bar dataKey="hours" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
```

### Colour rules for charts

```tsx
// Always use CSS custom properties for chart colours
stroke = 'hsl(var(--primary))'; // primary data line
stroke = 'hsl(var(--muted-foreground))'; // axis labels
stroke = 'hsl(var(--border))'; // grid lines
fill = 'hsl(var(--primary))'; // bars
fill = 'hsl(var(--primary) / 0.3)'; // area fill
```

### Loading state for charts

```tsx
if (isLoading) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}
```

---

## Auth integration

Auth state comes from `useAuth()`. Do not read from Supabase directly in components — use the hook.

```tsx
const { user, session, loading } = useAuth();

// Gate authenticated content
if (loading) return <AuthSkeleton />;
if (!user) return <Navigate to="/sign-in" />;
```

### Route protection

Use `AuthGuard` at the route level in `App.tsx`:

```tsx
<Route
  path="/dashboard"
  element={
    <AuthGuard>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </AuthGuard>
  }
/>
```

Never implement auth redirection inside individual page components — it creates inconsistent redirect behaviour.

---

## Subscription feature gating

Use `useSubscription()` and `SubscriptionGuard`. Never hardcode plan checks in component logic.

```tsx
const { isPro, canCreateGig, canCreateTeam } = useSubscription();

// ✅ Gate a feature with the hook's computed boolean
{
  canCreateGig ? (
    <Button onClick={onOpen}>Post a gig</Button>
  ) : (
    <UpgradePrompt plan="pro" feature="posting gigs" />
  );
}

// ✅ Gate a route
<Route
  path="/seller"
  element={
    <SubscriptionGuard requiredPlan="pro">
      <SellerDashboard />
    </SubscriptionGuard>
  }
/>;

// ❌ Never hardcode plan names in component logic
{
  user.plan === 'pro' && <Button>Post a gig</Button>;
}
```

---

## Error and loading states

Every component that receives async data must handle all three states. Never assume data is available.

```tsx
const { data: gigs, isLoading, isError, error } = useGigs();

// Skeleton — matches the exact shape of the loaded content
if (isLoading) return <GigListSkeleton />;

// Error — actionable message
if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />;

// Empty — RLS returning [] is not an error
if (!gigs?.length)
  return <EmptyState message="No active gigs yet" action={<Button>Browse projects</Button>} />;

return <GigList gigs={gigs} />;
```

### Skeleton sizing

Skeleton components must match the exact dimensions of the real content they replace. A skeleton that is the wrong size causes Cumulative Layout Shift when the real content loads.

---

## Accessibility

Every component must meet these minimum requirements:

- **Semantic HTML**: `<button>` for actions that trigger events, `<a>` for navigation
- **Images**: `alt` text that describes the image or `alt=""` for decorative images
- **Forms**: Every input has an associated `<label>` (use shadcn/ui `Label` component)
- **Keyboard navigation**: All interactive elements reachable with Tab, activated with Enter/Space
- **Focus management**: Dialogs trap focus; focus returns to the trigger on close
- **Colour contrast**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
- **ARIA roles**: Use only when HTML semantics are insufficient — do not add ARIA where native elements already provide it

shadcn/ui components (Dialog, DropdownMenu, Select, etc.) handle focus trapping and ARIA automatically — use them instead of writing custom equivalents.

---

## Testing

Testing tools and targets from `docs/PRD.md` §9:

| Layer                           | Tool                           | Target coverage                                                     |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| Unit (utils, validators, hooks) | Vitest                         | 80% on `src/lib/` and `src/hooks/`                                  |
| Component                       | Vitest + React Testing Library | Forms, auth flow, subscription guard, empty/loading/error states    |
| Integration                     | Vitest + MSW                   | TanStack Query hooks against mocked Supabase responses              |
| E2E                             | Playwright (Phase 2)           | Full user flows: sign-up, GitHub connect, gig creation, issue claim |

### Unit test structure

```tsx
// src/lib/__tests__/validators.test.ts
import { describe, it, expect } from 'vitest';
import { createGigSchema } from '../validators';

describe('createGigSchema', () => {
  it('rejects empty title', () => {
    const result = createGigSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});
```

### Component test structure

```tsx
// src/components/__tests__/GigCard.test.tsx
import { render, screen } from '@testing-library/react';
import { GigCard } from '../GigCard';

it('renders gig title and budget', () => {
  render(<GigCard gig={mockGig} onSave={vi.fn()} />);
  expect(screen.getByText(mockGig.title)).toBeInTheDocument();
  expect(screen.getByText(mockGig.budget)).toBeInTheDocument();
});
```

---

## Frontend anti-patterns

| Anti-pattern                                              | Correct approach                          |
| --------------------------------------------------------- | ----------------------------------------- |
| `useEffect + useState` for data fetching                  | Use `useQuery`                            |
| Fetching data inside a presentational component           | Fetch in the page, pass via props         |
| Hardcoded colour values                                   | Semantic Tailwind tokens                  |
| `SELECT *` in a hook                                      | Explicit column list                      |
| Missing `enabled: !!dependency` on conditional query      | Always gate with `enabled`                |
| Not handling loading and empty states                     | All three states — loading, empty, error  |
| `Math.random()` in render                                 | Use stable data or remove the mock        |
| Editing `src/components/ui/` files                        | Use `npx shadcn-ui add`                   |
| Animating `height`, `width`, `padding` with Framer Motion | Animate `transform` and `opacity` only    |
| Hardcoded plan name string in feature gate                | Use `useSubscription()` computed booleans |
| `import * as X from "recharts"`                           | Named imports only                        |
| Route defined outside `src/App.tsx`                       | All routes in `App.tsx`                   |
| Layout component inside page component                    | Apply layout at route level in `App.tsx`  |
