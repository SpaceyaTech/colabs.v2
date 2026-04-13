# Setup & Contributing

## Prerequisites

- [Node.js](https://nodejs.org/) v20.19+ (or [Bun](https://bun.sh/))
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for edge function development)
- A Supabase project (auto-provisioned via Lovable Cloud)

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd <project-directory>
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root. The following variables are required:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** The Supabase URL and anon key are already configured in `src/integrations/supabase/client.ts`. For local development with a different Supabase instance, update that file.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Supabase Setup

### Database

The database schema is managed via Supabase migrations in `supabase/migrations/`. When using Lovable Cloud, migrations are applied automatically.

For manual setup:

```bash
supabase db push
```

### Edge Functions

Edge functions are in `supabase/functions/`. To deploy:

```bash
supabase functions deploy github-oauth
supabase functions deploy github-repositories
supabase functions deploy github-issues
supabase functions deploy github-project-data
```

### Required Secrets (Edge Functions)

Set these via the Supabase dashboard or CLI:

```bash
supabase secrets set GITHUB_CLIENT_ID=your_client_id
supabase secrets set GITHUB_CLIENT_SECRET=your_client_secret
```

The following are automatically available:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

### Storage Buckets

Two buckets are configured:

- `resumes` (private) — proposal resume uploads
- `project-logos` (public) — project logo images

## GitHub OAuth App Setup

To enable GitHub integration:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set **Authorization callback URL** to `https://your-domain.com/github-callback`
4. Copy Client ID and Client Secret
5. Set them as Supabase edge function secrets (see above)
6. Update the `clientId` in `src/hooks/useGitHub.tsx` if using a different OAuth App

## Project Structure Conventions

### Components

- **UI primitives** go in `src/components/ui/` (shadcn/ui components)
- **Feature components** go in `src/components/` with descriptive names
- **Sub-components** for specific pages go in subdirectories (e.g., `dashboard/`, `profile/`)

### Hooks

- One hook per file in `src/hooks/`
- Use React Query for all server-state data fetching
- Export TypeScript interfaces for return types

### Pages

- One file per route in `src/pages/`
- Pages compose layout shells + feature components
- Route registration in `src/App.tsx`

### Styling

- Use Tailwind utility classes with semantic tokens
- Never use raw color values — always reference CSS custom properties
- Responsive design with Tailwind breakpoints (`sm:`, `md:`, `lg:`)

## Scripts

| Script      | Command             | Description              |
| ----------- | ------------------- | ------------------------ |
| Dev         | `npm run dev`       | Start Vite dev server    |
| Build       | `npm run build`     | Production build         |
| Build (dev) | `npm run build:dev` | Development build        |
| Preview     | `npm run preview`   | Preview production build |
| Lint        | `npm run lint`      | Run ESLint               |

## Contributing

1. Create a feature branch from `main`
2. Make changes following the conventions above
3. Ensure `npm run build` passes without errors
4. Submit a pull request with a clear description
