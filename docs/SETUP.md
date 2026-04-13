# Setup Guide

This guide walks you through getting Colabs running locally from a fresh clone. It covers every step from prerequisites to a working development environment, including common errors and how to fix them.

For contribution guidelines, branching strategy, and code standards, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. Fork and Clone](#1-fork-and-clone)
- [2. Install Dependencies](#2-install-dependencies)
- [3. Environment Variables](#3-environment-variables)
- [4. Set Up Supabase](#4-set-up-supabase)
- [5. Configure GitHub OAuth](#5-configure-github-oauth)
- [6. Deploy Edge Functions](#6-deploy-edge-functions)
- [7. Start the Development Server](#7-start-the-development-server)
- [Available Scripts](#available-scripts)
- [Project Structure Conventions](#project-structure-conventions)
- [After a Database Migration](#after-a-database-migration)
- [Running Edge Functions Locally](#running-edge-functions-locally)
- [Recommended Editor Setup](#recommended-editor-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure the following are installed before continuing:

| Requirement                                                  | Version | Notes                                                       |
| ------------------------------------------------------------ | ------- | ----------------------------------------------------------- |
| [Node.js](https://nodejs.org)                                | 18+     | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| [npm](https://www.npmjs.com)                                 | 9+      | Comes with Node.js                                          |
| [Supabase CLI](https://supabase.com/docs/guides/cli)         | latest  | `npm install -g supabase`                                   |
| [Git](https://git-scm.com)                                   | any     | —                                                           |
| A [Supabase](https://supabase.com) account                   | —       | Free tier is sufficient                                     |
| A [GitHub OAuth App](https://github.com/settings/developers) | —       | Two apps needed — see Step 5                                |

---

## 1. Fork and Clone

Fork the repository on GitHub, then clone your fork:

```bash
# SSH (recommended)
git clone git@github.com:YOUR_USERNAME/colabs.v2.git

# HTTPS
git clone https://github.com/YOUR_USERNAME/colabs.v2.git

cd colabs.v2
```

Add the upstream remote so you can keep your fork in sync:

```bash
git remote add upstream git@github.com:SpaceyaTech/colabs.v2.git
git fetch upstream

# The default branch is dev — confirm you are on it
git checkout dev
```

> **Important:** `dev` is the default branch. All feature branches are created from `dev` and all PRs target `dev`. Never branch from or push to `main` directly.

---

## 2. Install Dependencies

```bash
npm install
```

Use `npm ci` (not `npm install`) in CI or when you need a clean, reproducible install matching the lockfile exactly.

---

## 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in the values below. All `VITE_` prefixed variables are bundled into the client — never put secrets here.

```env
# ── Supabase ────────────────────────────────────────────────────────────────
# Found in: Supabase Dashboard → Project Settings → API

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ── GitHub OAuth (Integration — NOT the auth login) ─────────────────────────
# The Client ID for the integration OAuth app (see Step 5b).
# Only the Client ID goes here. The Client Secret is a server-side secret.

VITE_GITHUB_CLIENT_ID=your-integration-app-client-id

# ── Application ─────────────────────────────────────────────────────────────
VITE_APP_URL=http://localhost:5173
```

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`. The `GITHUB_CLIENT_SECRET` is a server-side secret — it must never appear in a `VITE_` variable. Set it via the Supabase CLI (see Step 6).

---

## 4. Set Up Supabase

### 4a. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. From **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Add both to your `.env` file

### 4b. Link your local project

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

### 4c. Apply migrations

```bash
npx supabase db push
```

This creates all 15 tables, RLS policies, security definer functions, and storage buckets in your Supabase project.

### 4d. Verify setup

In the Supabase dashboard under **Table Editor**, confirm:

- [ ] 15 tables created (see [DATABASE.md](./DATABASE.md) for the full schema)
- [ ] RLS is enabled on all tables (the shield icon is green)
- [ ] Storage buckets exist: `resumes` (private) and `project-logos` (public)

---

## 5. Configure GitHub OAuth

Colabs uses GitHub OAuth for **two completely separate purposes**. You need **two separate GitHub OAuth Apps**.

### Why two apps?

| App                 | Purpose                                           | Scopes                    |
| ------------------- | ------------------------------------------------- | ------------------------- |
| **Auth app**        | Sign in / sign up with GitHub                     | `read:user`, `user:email` |
| **Integration app** | Connect a GitHub account to sync repos and issues | `repo`, `user:email`      |

These are intentionally separate. A user can sign in with Google and still connect their GitHub account for repository syncing. Merging them would couple authentication to integration unnecessarily.

### 5a. Create the two OAuth apps

Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) and create two apps:

| App                | Homepage URL            | Authorization callback URL                              |
| ------------------ | ----------------------- | ------------------------------------------------------- |
| Colabs Auth        | `http://localhost:5173` | `https://your-project-ref.supabase.co/auth/v1/callback` |
| Colabs Integration | `http://localhost:5173` | `http://localhost:5173/github-callback`                 |

### 5b. Configure the Auth app in Supabase

1. In the Supabase dashboard, go to **Authentication → Providers → GitHub**
2. Enable the GitHub provider
3. Enter the **Client ID** and **Client Secret** from the Auth OAuth app

### 5c. Add the Integration app credentials

Add the Integration app's **Client ID** to your `.env`:

```env
VITE_GITHUB_CLIENT_ID=your-integration-app-client-id
```

Add the Integration app's **Client Secret** as a Supabase Edge Function secret (never in `.env`):

```bash
npx supabase secrets set GITHUB_CLIENT_SECRET=your-integration-app-client-secret
npx supabase secrets set GITHUB_CLIENT_ID=your-integration-app-client-id
```

---

## 6. Deploy Edge Functions

Deploy the four GitHub integration edge functions:

```bash
npx supabase functions deploy github-oauth
npx supabase functions deploy github-repositories
npx supabase functions deploy github-issues
npx supabase functions deploy github-project-data
```

Verify deployment in **Supabase Dashboard → Edge Functions**.

| Function              | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `github-oauth`        | Exchanges OAuth code for access token; upserts integration record    |
| `github-repositories` | Fetches repos from GitHub API; syncs to `github_repositories`        |
| `github-issues`       | Fetches open issues from collaboration-enabled repos                 |
| `github-project-data` | Retrieves detailed project/repo metadata for the project detail page |

> **Security note:** Access tokens are stored server-side only in the `github_integrations` table. RLS does not filter columns — protection is enforced by never including `access_token` in any client-side SELECT query. Edge Functions read the token via the service role key and never return it in response bodies.

---

## 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign up with email or GitHub to access the dashboard.

---

## Available Scripts

| Script           | Command              | Description                                           |
| ---------------- | -------------------- | ----------------------------------------------------- |
| Dev server       | `npm run dev`        | Start Vite with HMR at `localhost:5173`               |
| Production build | `npm run build`      | Build to `dist/` — must pass before any PR            |
| Preview build    | `npm run preview`    | Preview the production build locally                  |
| Lint             | `npm run lint`       | Run ESLint — zero errors required before a PR         |
| Type check       | `npm run type-check` | Run `tsc --noEmit` — zero errors required before a PR |

---

## Project Structure Conventions

### Components

- **UI primitives** → `src/components/ui/` (shadcn/ui — do not edit manually)
- **Feature components** → `src/components/` with descriptive names
- **Page sub-components** → subdirectories: `dashboard/`, `issues/`, `profile/`

### Hooks

- One hook per file in `src/hooks/`
- All server-state data fetching uses React Query (`useQuery`, `useMutation`)
- Export TypeScript interfaces for all return types

### Pages

- One file per route in `src/pages/`
- Pages compose layout shells and feature components
- Route registration in `src/App.tsx`

### Styling

- Use Tailwind semantic tokens defined in `src/index.css` and `tailwind.config.ts`
- Never hardcode raw colour values — always use CSS custom properties
- Dark mode is supported via the `dark` class on `<html>`

---

## After a Database Migration

Whenever a migration is added (by you or another contributor), regenerate the TypeScript types so your editor and the type-checker stay in sync:

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  > src/integrations/supabase/types.ts
```

Commit the updated `types.ts` alongside the migration file. PRs that add migrations without updating `types.ts` will fail the CI type-check step.

> The `src/integrations/supabase/types.ts` file is auto-generated. Never edit it manually — your changes will be overwritten on the next type generation run.

---

## Running Edge Functions Locally

To test edge functions without deploying to Supabase:

```bash
# Start the local Supabase stack (includes edge function runtime)
npx supabase start

# Serve a specific function locally
npx supabase functions serve github-oauth --env-file .env.local

# The function is now available at:
# http://localhost:54321/functions/v1/github-oauth
```

Create a `.env.local` file for local-only secrets (never commit this):

```env
GITHUB_CLIENT_ID=your-integration-app-client-id
GITHUB_CLIENT_SECRET=your-integration-app-client-secret
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
```

> The local service role key is printed by `supabase start` in the terminal output.

---

## Recommended Editor Setup

If you use VS Code, install these extensions for the best development experience:

| Extension                 | ID                          | Why                              |
| ------------------------- | --------------------------- | -------------------------------- |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocomplete for Tailwind tokens |
| ESLint                    | `dbaeumer.vscode-eslint`    | Inline lint errors               |
| Prettier                  | `esbenp.prettier-vscode`    | Consistent formatting            |
| Supabase                  | `supabase.supabase-vscode`  | SQL schema preview               |
| TypeScript Importer       | `pmneo.tsimporter`          | Auto-import suggestions          |

Add this to your `.vscode/settings.json` for consistent formatting on save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

---

## Troubleshooting

### `npm run dev` starts but the app shows a blank screen

The Supabase environment variables are missing or incorrect. Check:

1. Your `.env` file exists at the project root (not inside `src/`)
2. `VITE_SUPABASE_URL` matches the URL in Supabase Dashboard → Project Settings → API
3. `VITE_SUPABASE_ANON_KEY` is the **anon public** key, not the service role key
4. Restart the dev server after editing `.env` — Vite does not hot-reload env changes

### `supabase db push` fails with a migration error

```
Error: migration file X is ahead of the remote
```

Your local migration history is out of sync with the remote. Reset with:

```bash
npx supabase db reset    # Resets local DB
npx supabase db push     # Pushes all migrations fresh
```

> ⚠️ `db reset` drops and recreates your local database. It does not affect your remote Supabase project.

### TypeScript errors after pulling new changes

A migration was likely added. Run the type generation command:

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  > src/integrations/supabase/types.ts
```

### GitHub OAuth callback redirects to an error page

Common causes:

1. **Wrong callback URL in GitHub OAuth App** — the Authorization callback URL must match exactly. For auth: `https://your-project-ref.supabase.co/auth/v1/callback`. For integration: `http://localhost:5173/github-callback`
2. **Edge function secrets not set** — run `npx supabase secrets set GITHUB_CLIENT_SECRET=...`
3. **Edge function not deployed** — run `npx supabase functions deploy github-oauth`

### `npm run lint` reports errors on a clean checkout

The project uses ESLint with strict TypeScript rules. If you see errors immediately after cloning:

```bash
# Check your Node.js version — must be 18+
node --version

# Reinstall with clean lockfile
rm -rf node_modules
npm ci
```

### CORS error when calling an edge function

Edge functions must be deployed before they can be called from the browser. If you see a CORS error:

```bash
# Redeploy the failing function
npx supabase functions deploy <function-name>
```

If the error persists locally, ensure you are running `npx supabase start` and the function is served via `supabase functions serve`.

### Supabase client shows `invalid API key` in the console

You are using the wrong key. The **anon key** is the correct key for the client-side Supabase client. The **service role key** must only be used inside Edge Functions via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` — never in the browser.
