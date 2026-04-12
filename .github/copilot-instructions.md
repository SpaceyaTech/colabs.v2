# Colabs — GitHub Copilot workspace instructions

> **Auto-generated.** Source of truth: `.agents/AGENTS.md`
> To update, edit `.agents/AGENTS.md` then run `npm run sync-agents`.

## Project identity

Colabs is an open-source platform that connects developers with open-source projects, freelance gigs, and collaborative teams. It is a React 18 + TypeScript + Vite 5 SPA backed entirely by Supabase — PostgreSQL, Auth, Edge Functions, and Storage. There is no custom backend server. All server-side logic runs in Supabase Edge Functions on the Deno runtime (not Node.js).

Full documentation lives in `docs/`. Read `docs/ARCHITECTURE.md` before making any changes to auth, database, or integration code.

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

## Code rules

### TypeScript

- Strict mode on — no `any` without a comment explaining why
- `interface` for object shapes, `type` for unions and aliases
- All exported hooks and functions must have explicit return types
- Named exports preferred over default exports for components and hooks

### React

- Functional components only — no class components
- All server state via TanStack React Query — no `useEffect + useState` for fetching
- All forms via React Hook Form + Zod — no uncontrolled inputs
- Components stay under 200 lines — extract sub-components when they grow
- Custom hooks live in `src/hooks/`, prefixed with `use`

### Styling

- Always use semantic Tailwind tokens — never raw colour values

```tsx
// ✅ Correct
<div className="bg-background text-foreground border border-border rounded-md">

// ❌ Wrong
<div className="bg-white text-gray-900 border border-gray-200">
<div style={{ backgroundColor: '#fff' }}>
```

- Dark mode is automatic when tokens are used correctly
- No hardcoded hex/RGB/HSL values in JSX
- All shadcn/ui component customisation via CSS variable overrides in `src/index.css`

### File organisation

| Content                            | Location                                   |
| ---------------------------------- | ------------------------------------------ |
| shadcn/ui primitives               | `src/components/ui/` — never edit directly |
| Components for one feature         | `src/components/<feature>/`                |
| Components used across ≥2 features | `src/components/shared/`                   |
| Route-level pages                  | `src/pages/`                               |
| TanStack Query hooks               | `src/hooks/`                               |
| Pure utilities / Zod schemas       | `src/lib/`                                 |
| Shared TypeScript types            | `src/types/`                               |

---

---

## Data fetching patterns

### Standard query

```tsx
export function useMyData(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-data', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table')
        .select('id, name, status') // explicit columns — never SELECT *
        .eq('user_id', userId!);
      if (error) throw error; // always throw, never swallow
      return data ?? []; // always default arrays
    },
    enabled: !!userId, // always gate on dependency
  });
}
```

### Mutation with cache invalidation

```tsx
const mutation = useMutation({
  mutationFn: async (input: CreateInput) => {
    const { data, error } = await supabase.from('table').insert(input).select().single();
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['my-data'] });
    toast.success('Created');
  },
  onError: err => toast.error(err.message),
});
```

### Auth-gated query

```tsx
const { session } = useAuth();

return useQuery({
  queryKey: ['protected-data'],
  queryFn: async () => {
    /* ... */
  },
  enabled: !!session, // prevents the spurious empty render before session restores
});
```

### Edge function call

```tsx
const { data, error } = await supabase.functions.invoke('function-name', {
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: { key: 'value' },
});

if (error) throw new Error(error.message);
if (!data.success) throw new Error(data.error ?? 'Unknown error');
```

### Query key naming

```
List:         ["gigs"]
User-scoped:  ["my-gigs", userId]
Single:       ["gig", gigId]
Nested:       ["proposals", gigId]
```

---

---

## Edge function patterns

### Deno vs Node — key differences

```typescript
// Environment variables
Deno.env.get("VAR_NAME")                            // ✅ Deno
process.env.VAR_NAME                                 // ❌ Node

// Package imports
import X from "https://esm.sh/package@version?target=deno"  // ✅ Deno
import X from "package"                                       // ❌ Node

// HTTP server
Deno.serve(async (req) => { ... })                   // ✅ Deno
app.listen(3000)                                      // ❌ Express
```

### Required structure for every function

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  // 1. Always handle OPTIONS first
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Verify JWT (for authenticated functions)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    // 3. Use service role client for DB writes (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Business logic ...

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 5. Never expose stack traces
    console.error(error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

**Webhook endpoints** (Stripe, GitHub) must:

- Set `verify_jwt = false` in `supabase/config.toml`
- Return `200` even on non-fatal errors — prevents Stripe/GitHub retry storms
- Always verify the webhook signature before processing

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

The `access_token` column must never be returned to the client. RLS does not filter columns — it filters rows. Enforce this exclusively by never including `access_token` in any SELECT list:

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
