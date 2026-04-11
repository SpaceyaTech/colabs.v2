# Architecture

## Project Structure

```
src/
├── App.tsx                  # Root component with route definitions
├── main.tsx                 # Entry point
├── index.css                # Global styles & design tokens
├── components/
│   ├── ui/                  # shadcn/ui primitives (button, dialog, card, etc.)
│   ├── dashboard/           # Dashboard tab components
│   ├── issues/              # Issue list and side panel components
│   ├── profile/             # Profile page sub-components
│   ├── AppLayout.tsx        # Sidebar + main content layout shell
│   ├── TopNavLayout.tsx     # Top navigation layout variant
│   ├── AuthGuard.tsx        # Route protection wrapper
│   ├── CreateGigDialog.tsx  # Gig creation/edit form (zod validated)
│   ├── CreateProjectDialog.tsx
│   ├── GitHubIntegration.tsx
│   └── ...                  # Feature-specific components
├── hooks/
│   ├── useAuth.tsx          # Auth context & provider
│   ├── useGigs.tsx          # Gig CRUD queries
│   ├── useGitHub.tsx        # GitHub OAuth & repo management
│   ├── useGitHubIssues.tsx  # GitHub issue fetching
│   ├── useClaimedIssues.tsx # Issue claiming/unclaiming
│   ├── useOrganizations.tsx # Organization management
│   ├── useTeams.tsx         # Team CRUD
│   └── use-mobile.tsx       # Responsive breakpoint hook
├── integrations/
│   └── supabase/
│       ├── client.ts        # Supabase client singleton
│       └── types.ts         # Auto-generated database types
├── pages/                   # Route-level page components
└── lib/
    └── utils.ts             # Shared utilities (cn, etc.)
```

## Routing

All routes are defined in `src/App.tsx`. Key routes:

| Route                  | Page                  | Auth Required |
| ---------------------- | --------------------- | ------------- |
| `/`                    | Landing page          | No            |
| `/sign-in`, `/sign-up` | Authentication        | No            |
| `/dashboard/*`         | User dashboard (tabs) | Yes           |
| `/projects`            | Project listings      | No            |
| `/project/:id`         | Project detail        | No            |
| `/marketplace`         | Gig marketplace       | No            |
| `/gig/:id`             | Gig detail            | No            |
| `/seller`              | Seller dashboard      | Yes           |
| `/issues`              | All issues            | No            |
| `/profile`             | User profile          | Yes           |
| `/settings`            | User settings         | Yes           |

## Design System

The app uses a **Linear-inspired** design language with semantic CSS custom properties defined in `src/index.css` and extended in `tailwind.config.ts`.

### Key Principles

- All colors use HSL and are defined as CSS custom properties (`--primary`, `--background`, `--muted`, etc.)
- Components use Tailwind semantic tokens (`bg-primary`, `text-muted-foreground`) — never raw color values
- Dark mode is supported via the `dark` class on `<html>`
- shadcn/ui components are customized via `components.json` and CSS variable overrides

### Component Library

UI primitives live in `src/components/ui/` and are sourced from [shadcn/ui](https://ui.shadcn.com/). Custom feature components compose these primitives.

## State Management

- **Server state**: TanStack React Query (`useQuery`, `useMutation`)
- **Auth state**: React Context (`AuthProvider` in `useAuth.tsx`)
- **Local UI state**: React `useState` / `useReducer`
- No global client state library (Redux, Zustand) is used

## Key Patterns

### Data Fetching

All Supabase queries go through typed hooks in `src/hooks/`. Each hook uses React Query for caching, deduplication, and background refetching. See [Data Fetching](./DATA_FETCHING.md) for details.

### Form Validation

Forms use **Zod** schemas for client-side validation (e.g., `CreateGigDialog`). Required fields show inline `text-destructive` error messages with `border-destructive` highlighting.

### Layout

Two layout shells are available:

- `AppLayout` — sidebar navigation (dashboard pages)
- `TopNavLayout` — top navigation bar (public pages)
