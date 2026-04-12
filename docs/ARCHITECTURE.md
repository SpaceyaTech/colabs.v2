# Architecture

This document covers the system architecture of Colabs: how the layers fit together, the mental models you need before touching the codebase, and the conventions that govern every part of the project.

---

## Table of Contents

- [System Overview](#system-overview)
- [Mental Models](#mental-models)
  - [Auth vs GitHub Integration](#auth-vs-github-integration)
  - [RLS — Row Level Security](#rls--row-level-security)
  - [Server State vs UI State](#server-state-vs-ui-state)
- [Request Lifecycle](#request-lifecycle)
- [Project Structure](#project-structure)
- [Folder Ownership](#folder-ownership)
- [Routing](#routing)
- [Layout System](#layout-system)
- [Design System](#design-system)
- [State Management](#state-management)
- [Key Patterns](#key-patterns)

---

## System Overview

Colabs is a **single-page application (SPA)** backed entirely by [Supabase](https://supabase.com). There is no custom backend server — all server-side logic runs in Supabase Edge Functions (Deno runtime).

```
┌─────────────────────────────────────────────────────┐
│                   Browser (SPA)                     │
│  React 18 + TypeScript + Vite 5                     │
│  React Router v6  │  TanStack Query v5  │  shadcn/ui│
└────────────────────────┬────────────────────────────┘
                         │  HTTPS
┌────────────────────────▼────────────────────────────┐
│                 Supabase Platform                   │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Auth       │  │  PostgreSQL  │  │  Storage  │  │
│  │  (JWT/RLS)  │  │  PostgreSQL (~15 tables) │  │  Storage (~2 buckets)│  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │          Edge Functions (Deno)               │   │
│  │  github-oauth  │  github-repositories        │   │
│  │  github-issues │  github-project-data        │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────┘
                         │  GitHub REST API
                ┌────────▼──────────┐
                │   GitHub API v3   │
                └───────────────────┘
```

---

## Mental Models

Read this section before touching the codebase. These three concepts are the source of most early contributor confusion.

### Auth vs GitHub Integration

Colabs has **two separate GitHub OAuth flows**. They look similar but are completely independent.

|                               | Auth (sign in)                                                   | Integration (repo sync)                                                                     |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Purpose**                   | Authenticate the user — create or restore a Supabase session     | Connect a GitHub account to sync repositories and issues                                    |
| **When**                      | On the `/sign-in` or `/sign-up` page                             | Inside Settings → GitHub Integration (user already logged in)                               |
| **OAuth App**                 | A separate GitHub OAuth App configured in Supabase Auth settings | A separate GitHub OAuth App with `repo` scope                                               |
| **Callback**                  | Supabase handles it: `.../auth/v1/callback`                      | Our app handles it: `/github-callback` page                                                 |
| **Token stored**              | Supabase Auth manages the JWT session                            | Our edge function stores the GitHub access token in `github_integrations.access_token`      |
| **Can be used independently** | Yes — a user can sign in with email and still connect GitHub     | Yes — a user can sign in with GitHub OAuth and connect a different GitHub account for repos |

**Why two apps?** Decoupling means a user can sign in with Google and still use the GitHub integration. It also means the scopes are right-sized — auth only needs identity scopes, integration needs `repo` access.

The client-side code for each lives in different places:

- Auth: `src/hooks/useAuth.tsx` — calls `supabase.auth.signInWithOAuth({ provider: 'github' })`
- Integration: `src/hooks/useGitHub.tsx` — redirects to GitHub manually, then calls the `github-oauth` edge function

### RLS — Row Level Security

Every table in the database has RLS enabled. This is the security enforcement layer — not an optional feature.

**How it works:**

When the Supabase client makes a query from the browser, it sends the user's JWT automatically. PostgreSQL evaluates the RLS policies against `auth.uid()` (the user's ID from the JWT) before returning any rows.

```
Browser query: SELECT * FROM claimed_issues
                        ↓
PostgreSQL checks RLS policy:
  USING (auth.uid() = user_id)
                        ↓
Returns only rows where user_id matches the JWT
```

**What this means for you as a contributor:**

1. **RLS empty results are not errors.** If a user has no claimed issues, the query returns `[]` — not an error. Always handle empty arrays gracefully with `EmptyState` components.

2. **Every new table needs policies.** A table with RLS enabled but no policies returns zero rows to everyone. If you add a migration that creates a table, you must also add the RLS policies in the same migration.

3. **Three security definer functions bypass RLS for role checks.** `is_team_member()`, `get_user_org_role()`, and `is_organization_member()` run with elevated privileges to avoid recursive policy evaluation. Use them in policies that need to check membership — don't write raw subqueries.

4. **The `access_token` column in `github_integrations` is never returned to the client.** The SELECT policy on that table explicitly excludes the `access_token` column. Edge functions use the service role key to read it server-side.

5. **The service role key bypasses RLS entirely.** It is only used inside Edge Functions via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`. It must never appear in any `VITE_` environment variable or client-side code.

### Server State vs UI State

Colabs does not use a global client state library (no Redux, no Zustand).

| State type                   | Where it lives                      | How it's managed                                     |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------- |
| Server state (database, API) | TanStack React Query cache          | `useQuery`, `useMutation` in `src/hooks/`            |
| Auth state                   | React Context                       | `AuthProvider` in `useAuth.tsx` — available app-wide |
| Local UI state               | Component `useState` / `useReducer` | Scoped to the component that needs it                |

The critical rule: **components receive data via props — they never fetch data themselves.** Pages and container components own the data lifecycle. Presentational components render what they receive. This keeps components testable and predictable.

---

## Request Lifecycle

What happens from the moment a contributor opens a PR to code reaching production:

```
1. Contributor pushes to feat/* branch
         ↓
2. pr.yml triggers on the PR
   → lint, type-check, build (must all pass)
   → secret-scan, codeql (security gates)
   → auto-label, changelog-preview (non-blocking)
         ↓
3. PR approved → merged into dev
   (staging.colabs.dev updates automatically)
         ↓
4. Maintainer opens release PR: dev → main
   → Same pr.yml checks run again on the release PR
         ↓
5. Release PR merged → main.yml triggers
   → CI re-check on main
   → semantic-release: reads commits, bumps version,
     generates CHANGELOG, creates GitHub Release, tags vX.Y.Z
         ↓
6. main = production (colabs.dev)
```

For a browser request lifecycle (what happens when a user loads a page):

```
Browser loads the SPA bundle
   → React Router matches the URL to a route
   → The route component renders
   → TanStack Query hooks fire their queryFns
   → Supabase client sends HTTPS requests with the user's JWT
   → PostgreSQL evaluates RLS policies and returns filtered rows
   → React Query caches the results
   → Components re-render with the data
```

---

## Project Structure

```
colabs/
├── public/                    # Static assets (logo, favicon, robots.txt)
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui base components (auto-generated — do not edit)
│   │   ├── layout/            # AppLayout, TopNavLayout, BottomNav
│   │   ├── dashboard/         # Dashboard tab components
│   │   ├── gigs/              # Gig marketplace components
│   │   ├── projects/          # Project card, detail, form components
│   │   ├── issues/            # Issue list, claim panel, filters
│   │   ├── teams/             # Team creation, workspace, member list
│   │   ├── organizations/     # Org dashboard, member management
│   │   └── shared/            # Globally shared: modals, badges, guards
│   │
│   ├── pages/                 # Route-level page components (one file per route)
│   │
│   ├── hooks/                 # TanStack Query hooks — all server-state data fetching
│   │   ├── useAuth.tsx        # Auth context + provider
│   │   ├── useGigs.tsx        # Gig CRUD queries
│   │   ├── useGitHub.tsx      # GitHub integration management
│   │   ├── useGitHubIssues.tsx# Issues via github-issues edge function
│   │   ├── useClaimedIssues.tsx# claimed_issues table CRUD
│   │   ├── useOrganizations.tsx# Organization management
│   │   ├── useTeams.tsx       # Team CRUD
│   │   ├── useSubscription.tsx# Subscription state + auto-demotion
│   │   └── use-mobile.tsx     # Responsive breakpoint hook
│   │
│   ├── lib/                   # Utilities, helpers, validators
│   │   ├── utils.ts           # cn(), formatters, shared utilities
│   │   └── validators.ts      # Shared Zod schemas
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts      # Supabase client singleton
│   │       └── types.ts       # Auto-generated DB types (do not edit — run type gen)
│   │
│   ├── types/                 # TypeScript interfaces and type definitions
│   ├── App.tsx                # Root component with route definitions
│   └── main.tsx               # Application entry point
│
├── supabase/
│   ├── functions/             # Edge Functions (Deno runtime)
│   │   ├── github-oauth/
│   │   ├── github-repositories/
│   │   ├── github-issues/
│   │   └── github-project-data/
│   └── migrations/            # Timestamped SQL migration files
│
├── .github/
│   ├── workflows/             # CI/CD pipeline (pr.yml, main.yml, security.yml, stale.yml)
│   ├── ISSUE_TEMPLATE/        # Bug report, feature request, good first issue templates
│   ├── CODEOWNERS             # Automatic review assignments
│   ├── labeler.yml            # Path-based auto-label config
│   └── pull_request_template.md
│
├── .env.example               # Environment variable template
├── .releaserc.json            # semantic-release configuration
├── components.json            # shadcn/ui configuration
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## Folder Ownership

Understanding what belongs where prevents the most common structural mistakes:

| Folder                      | What belongs here                                                                       | What does NOT belong here                                              |
| --------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/components/ui/`        | shadcn/ui primitives only. Auto-generated via `npx shadcn-ui add`.                      | Feature-specific or custom components                                  |
| `src/components/<feature>/` | Components used only within one feature (gigs, issues, teams, etc.)                     | Generic shared components                                              |
| `src/components/shared/`    | Components used across ≥2 features (modals, badges, empty states, guards)               | Feature-specific components                                            |
| `src/hooks/`                | Custom hooks that wrap React Query or Supabase calls. One hook per file.                | Utility functions, formatters, non-hook logic                          |
| `src/lib/`                  | Pure utility functions, formatters, Zod schemas, the Supabase client singleton          | React hooks, components, server calls                                  |
| `src/types/`                | TypeScript interfaces and type aliases that are used across multiple files              | Types that are only used in one file (define them locally)             |
| `src/pages/`                | Route-level components. One file per route. Compose layout shells + feature components. | Reusable feature components                                            |
| `supabase/migrations/`      | SQL migration files only. Timestamped. Never edited after being pushed.                 | Seed data (use separate seed files), application logic                 |
| `supabase/functions/`       | Edge Function entry points (`index.ts` per function).                                   | Shared utilities (create a `_shared/` directory and import from there) |

---

## Routing

All routes are defined in `src/App.tsx`. The two layout shells (`AppLayout` and `TopNavLayout`) are applied at the route level.

| Route              | Page                                | Auth required |
| ------------------ | ----------------------------------- | ------------- |
| `/`                | Landing page                        | No            |
| `/sign-in`         | Sign in                             | No            |
| `/sign-up`         | Sign up                             | No            |
| `/github-callback` | GitHub OAuth callback (integration) | Yes           |
| `/dashboard/*`     | User dashboard (tabbed)             | Yes           |
| `/projects`        | Project listings                    | No            |
| `/project/:id`     | Project detail                      | No            |
| `/marketplace`     | Gig marketplace                     | No            |
| `/gig/:id`         | Gig detail                          | No            |
| `/seller`          | Seller dashboard                    | Yes           |
| `/issues`          | All issues                          | No            |
| `/profile`         | User profile                        | Yes           |
| `/settings`        | User settings                       | Yes           |
| `/organizations`   | Organization listings               | Yes           |
| `/pricing`         | Subscription plans                  | No            |

Auth protection is implemented via the `AuthGuard` component (`src/components/AuthGuard.tsx`), which redirects unauthenticated users to `/sign-up`.

---

## Layout System

Two layout shells are available, applied at the route level in `App.tsx`:

| Component      | Used for                                                     | What it provides                                     |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `AppLayout`    | All authenticated dashboard pages                            | Sidebar navigation, header with user menu            |
| `TopNavLayout` | Public-facing pages (landing, marketplace, projects, issues) | Top navigation bar                                   |
| `BottomNav`    | Mobile navigation (all pages)                                | Bottom tab bar, visible on screens < `md` breakpoint |

---

## Design System

Colabs uses a **Linear-inspired** dark-first design language.

### Tokens

All colours are defined as HSL CSS custom properties in `src/index.css` and exposed as Tailwind tokens via `tailwind.config.ts`:

```
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--card, --card-foreground
--border, --input, --ring
--destructive, --destructive-foreground
```

**Rules:**

- Always use semantic tokens (`bg-background`, `text-foreground`) — never raw colour values (`bg-white`, `text-gray-900`)
- Dark mode is applied via the `dark` class on `<html>` — no `prefers-color-scheme` media queries
- All shadcn/ui components respect these tokens automatically

### Component library

UI primitives live in `src/components/ui/` and are sourced from [shadcn/ui](https://ui.shadcn.com/). Do not edit them directly — re-run `npx shadcn-ui add <component>` to update. Custom feature components compose these primitives.

---

## State Management

| Layer                       | Library                        | Scope                             |
| --------------------------- | ------------------------------ | --------------------------------- |
| Server state (DB, API data) | TanStack React Query v5        | Cached globally via `QueryClient` |
| Auth state                  | React Context (`AuthProvider`) | App-wide via `useAuth()`          |
| Local UI state              | `useState` / `useReducer`      | Component-scoped                  |

No global client state library is used. If you find yourself reaching for one, it is usually a sign that server state should be managed by React Query instead.

---

## Key Patterns

### Data fetching

All Supabase queries go through typed hooks in `src/hooks/`. See [DATA_FETCHING.md](./DATA_FETCHING.md) for the full conventions, including query key naming, mutation patterns, error handling, and auth-gated queries.

### Form validation

All forms use **React Hook Form** + **Zod** for schema-based validation. Inline error messages use `text-destructive` and `border-destructive` styling. No uncontrolled inputs.

### Feature gating

Subscription-based feature gating is handled by `useSubscription()` and `SubscriptionGuard`. See [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md) for the full gating patterns and plan feature matrix.

### Security definer functions

RLS policies that need to check team or organisation membership use dedicated security definer functions rather than inline subqueries. This prevents recursive policy evaluation. See [DATABASE.md](./DATABASE.md#database-functions).
