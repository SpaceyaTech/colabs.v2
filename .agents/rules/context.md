---
trigger: always_on
---

# Colabs — Global Agent Context

> **Auto-generated.** Source of truth: `.agents/AGENTS.md`
> This is a high-level summary. For deep-dives, use the links in the **Specialist Agents** section.

## Project identity

Colabs is an open-source platform that connects developers with open-source projects, freelance gigs, and collaborative teams. It is a React 18 + TypeScript + Vite 5 SPA backed entirely by Supabase — PostgreSQL, Auth, Edge Functions, and Storage. There is no custom backend server. All server-side logic runs in Supabase Edge Functions on the Deno runtime (not Node.js).

Full documentation lives in `docs/`. Read `docs/ARCHITECTURE.md` before making any changes to auth, database, or integration code.

---

---

## Repository layout

```
src/
├── components/
│   └── ui/              # shadcn/ui primitives — NEVER edit manually
├── hooks/               # TanStack Query hooks — all server-state fetching
├── pages/               # Route-level components — one file per route
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase singleton — import from here only
│       └── types.ts     # Auto-generated — NEVER edit manually
├── lib/                 # Pure utilities, Zod validators, formatters
└── types/               # Shared TypeScript interfaces

supabase/
├── functions/           # Edge Functions (Deno — NOT Node.js)
└── migrations/          # SQL — append-only, NEVER edit existing files

docs/                    # All project documentation
.agents/                 # Specialist agent files — frontend, backend, optimization
├── frontend.md          # React, TypeScript, Tailwind, TanStack Query, forms, animation
├── backend.md           # Supabase, RLS, migrations, Edge Functions, GitHub API, Storage
└── optimization.md      # Bundle, React rendering, React Query cache, DB indexes, CWV

.github/
├── workflows/           # pr.yml, main.yml, security.yml, stale.yml, agents-sync-check.yml
├── CODEOWNERS           # Auto-assigns review on high-risk files
└── copilot-instructions.md  # GitHub Copilot adapter (thin shell)

CLAUDE.md                # Claude Code adapter (thin shell)
.cursor/rules/           # Cursor adapter files (thin shells)
.windsurfrules           # Windsurf adapter (thin shell)
```

---

---

## Specialist Agents

For deep domain-specific knowledge, refer to the specialist agent files. These are hand-authored guides that go beyond the general rules.

| Agent              | Focus Area                                       | File                                                           |
| ------------------ | ------------------------------------------------ | -------------------------------------------------------------- |
| **Frontend**       | React, Tailwind v4, TanStack Query, Shadcn/UI    | [.agents/frontend.md](file:///.agents/frontend.md)             |
| **Backend**        | Supabase, RLS, Edge Functions, PostgreSQL, Deno  | [.agents/backend.md](file:///.agents/backend.md)               |
| **Security**       | Auth, RLS hardening, Secrets, OAuth, Webhooks    | [.agents/security.md](file:///.agents/security.md)             |
| **Data Migration** | Moving from mock data to live Supabase queries   | [.agents/data-migration.md](file:///.agents/data-migration.md) |
| **Testing**        | Vitest, MSW, Component & Integration testing     | [.agents/testing.md](file:///.agents/testing.md)               |
| **Optimization**   | Bundle size, CWV, React performance, DB indexing | [.agents/optimization.md](file:///.agents/optimization.md)     |

---

---

---

## Mental models

These three concepts are the source of most early contributor mistakes. Understand them before writing any code.

### 1. RLS is the security enforcement layer — not an optional feature

Every table has Row Level Security enabled. PostgreSQL evaluates RLS policies against `auth.uid()` before returning any rows.

**What this means:**

- An empty array from a query is not an error — it means the user has no access. Always handle empty arrays with `EmptyState` components.
- Every new table must have `ENABLE ROW LEVEL SECURITY` and at least one policy in the same migration. A table with RLS enabled but no policies returns zero rows to everyone, silently.
- Never write inline subqueries inside RLS policies — they cause recursive evaluation. Use the security definer functions: `is_team_member()`, `get_user_org_role()`, `is_organization_member()`.
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. It is only used inside Edge Functions via `Deno.env.get()`. It must never appear in any `VITE_` variable or client-side code.

### 2. Two separate GitHub OAuth flows

There are two completely independent OAuth flows. Never conflate them.

|             | Auth flow                                     | Integration flow                                       |
| ----------- | --------------------------------------------- | ------------------------------------------------------ |
| Purpose     | Sign in / sign up                             | Connect GitHub to sync repos and issues                |
| When        | `/sign-in`, `/sign-up`                        | Settings → GitHub Integration (user already logged in) |
| OAuth App   | Supabase Auth → Providers → GitHub            | Separate app with `repo` scope                         |
| Callback    | `<supabase-ref>.supabase.co/auth/v1/callback` | `/github-callback` page                                |
| Client code | `useAuth.tsx`                                 | `useGitHub.tsx`                                        |

### 3. Components receive data — they don't fetch it

Pages and container components own the data lifecycle. Presentational components receive data via props and render it. Never fetch data inside a presentational component.

---

---

## Security rules

These rules are non-negotiable. CI enforces the code quality ones automatically; the others require review.

### Secrets — never in client code

| Secret                      | Where it lives                   | How to set                 |
| --------------------------- | -------------------------------- | -------------------------- |
| `GITHUB_CLIENT_SECRET`      | Supabase Edge Function secrets   | `npx supabase secrets set` |
| `STRIPE_SECRET_KEY`         | Supabase Edge Function secrets   | `npx supabase secrets set` |
| `STRIPE_WEBHOOK_SECRET`     | Supabase Edge Function secrets   | `npx supabase secrets set` |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-available in Edge Functions | Never set manually         |

Any variable prefixed `VITE_` is bundled into the client. Secrets must never use this prefix.

### `access_token` in `github_integrations`

The `access_token` column must never be returned to the client. RLS column-level filtering enforces this, but never write a query that explicitly selects it:

```typescript
// ❌ Never — returns access_token
supabase.from('github_integrations').select('*');

// ✅ Always explicit
supabase.from('github_integrations').select('id, user_id, github_username, avatar_url, is_active');
```

### File uploads

Validate MIME type, file extension, and size before any storage write. Never trust the content-type header alone — check the file magic bytes server-side.

---

---

## What not to do

| Never                                       | Reason                                                  |
| ------------------------------------------- | ------------------------------------------------------- |
| Edit `src/integrations/supabase/types.ts`   | Auto-generated — run type gen instead                   |
| Edit `src/components/ui/` files             | shadcn/ui managed — run `npx shadcn-ui add`             |
| `SELECT *` on any table                     | Specify columns — `access_token` must never be returned |
| Put secrets in `VITE_` variables            | Bundled into the client                                 |
| Edit an existing migration file             | Append-only — create a new one                          |
| Push directly to `dev` or `main`            | Always open a PR                                        |
| `useEffect + useState` for data fetching    | Use `useQuery`                                          |
| Inline subqueries in RLS policies           | Use security definer functions                          |
| `Math.random()` in production data paths    | Use stable data sources                                 |
| Hardcode colours in components              | Use semantic Tailwind tokens                            |
| Expose stack traces in edge function errors | Return `"Internal server error"`                        |

---

---

## Commands

### Development

```bash
npm run dev          # Vite dev server at localhost:5173
npm run build        # Production build — must pass before any PR
npm run lint         # ESLint — zero errors required
npm run type-check   # tsc --noEmit — zero errors required
npm run preview      # Preview the production build
```

### Supabase

```bash
npx supabase start                       # Start local Supabase stack
npx supabase db push                     # Apply pending migrations
npx supabase db reset                    # Drop and re-apply all migrations (local only)
npx supabase functions serve <name>      # Serve an edge function locally
npx supabase functions deploy <name>     # Deploy edge function to Supabase
npx supabase secrets set KEY=value       # Set edge function secret — never use .env for secrets
npx supabase secrets list                # List secret names (not values)
```

### Type generation — run after every migration

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  > src/integrations/supabase/types.ts
```

Always commit `types.ts` alongside the migration file in the same PR.

---

---

## Branching

- All work branches from `dev` — never from `main`
- All PRs target `dev`
- Branch naming: `feat/<name>`, `fix/<name>`, `docs/<name>`, `chore/<name>`, `test/<name>`
- Hotfixes only: branch from `main`, open two PRs (main + dev)
- Delete branch after merge

```bash
git checkout dev && git pull upstream dev
git checkout -b feat/your-feature-name
```

---

---

## Commit format

Conventional Commits — required for semantic-release changelog generation.

```
<type>(<scope>): <description>
```

**Types:** `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore` | `security`

**Scopes:** `auth` | `github` | `gigs` | `projects` | `issues` | `teams` | `orgs` | `proposals` | `subscriptions` | `ui` | `db` | `edge-fn` | `docs` | `ci`

**Examples:**

```
feat(gigs): add milestone-based budget input to gig form
fix(auth): redirect to sign-up on expired session
security(uploads): validate MIME type before storage write
chore(deps): upgrade @supabase/supabase-js to v2.51
docs(setup): add VSCode extension recommendations
```

**Rules:**

- Imperative mood: "add" not "added" or "adds"
- Subject line under 72 characters
- Body explains _why_, not _what_ (the diff shows the what)
- Breaking changes: `BREAKING CHANGE: <description>` in the footer

---
