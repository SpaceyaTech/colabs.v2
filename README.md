<div align="center">

<img src="./public/logo.png" alt="Colabs Logo" width="88" height="88" />

# Colabs

**Open-source collaboration meets freelance opportunity.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/SpaceyaTech/colabs.v2?style=social)](https://github.com/SpaceyaTech/colabs.v2/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/SpaceyaTech/colabs.v2)](https://github.com/SpaceyaTech/colabs.v2/issues)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/SpaceyaTech/colabs.v2)](https://github.com/SpaceyaTech/colabs.v2/commits/main)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?logo=discord&logoColor=white)](https://discord.gg/UKjtBDDFHH)
[![X (Twitter)](https://img.shields.io/badge/X-@SpaceYaTech-000000?logo=x&logoColor=white)](https://x.com/SpaceYaTech)
[![Instagram](https://img.shields.io/badge/Instagram-SpaceYaTech-E4405F?logo=instagram&logoColor=white)](https://instagram.com/SpaceYaTech)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-SpaceYaTech-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/company/SpaceYaTech)
[![TikTok](https://img.shields.io/badge/TikTok-SpaceYaTech-000000?logo=tiktok&logoColor=white)](https://tiktok.com/@SpaceYaTech)

<br />

[Live Demo](https://colabs.dev) · [Report a Bug](https://github.com/SpaceyaTech/colabs.v2/issues/new?template=bug_report.md) · [Request a Feature](https://github.com/SpaceyaTech/colabs.v2/issues/new?template=feature_request.md) · [Product Roadmap](./PRD.md)

<br />

> 🚧 **Status: Active Development** — v1.0 in progress. Core features are implemented; contributions are welcome.

</div>

---

## Table of Contents

- [What is Colabs?](#-what-is-colabs)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Fork & Clone](#1-fork--clone)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Set Up Supabase](#4-set-up-supabase)
  - [5. Configure GitHub OAuth](#5-configure-github-oauth)
  - [6. Deploy Edge Functions](#6-deploy-edge-functions)
  - [7. Start the Development Server](#7-start-the-development-server)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Environment Variables Reference](#-environment-variables-reference)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [Community & Support](#-community--support)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🌐 What is Colabs?

Developers today juggle fragmented workflows — discovering open-source projects on GitHub, finding freelance gigs on Upwork, and managing teams on Slack. **Colabs unifies all of this into one platform.**

Colabs connects developers with open-source projects, freelance gigs, and collaborative teams. It bridges GitHub-based open-source contribution with a structured freelance marketplace — enabling developers to discover projects, claim issues, submit proposals, and earn, all from a single dashboard backed by their real GitHub activity.

### Who is it for?

| Persona | What they get |
|---|---|
| **Developer / Contributor** | Discover projects and gigs matching their skills, claim GitHub issues, track progress, and build a verifiable contribution profile |
| **Project Owner** | Post open-source or paid projects, manage collaboration requests, review proposals, and hire contributors with proven GitHub track records |
| **Team Lead** | Create teams, invite members by email, assign projects, and manage a shared team workspace |
| **Organisation Admin** | Manage organisations with role-based access control, configure integrations, and oversee contributor activity at scale |

---

## ✨ Key Features

- 🔗 **GitHub Integration** — Connect your GitHub account, sync repositories, and toggle collaboration on individual repos
- 🎯 **Issue Claiming** — Browse open GitHub issues across all collaboration-enabled repos, claim them, and track their status through a kanban-style workflow (`todo → in-progress → in-review → done`)
- 💼 **Gig Marketplace** — Post and discover paid freelance gigs with category tags, difficulty levels, milestone-based budgets, and featured listings
- 📋 **Project Discovery** — Explore open-source and collaborative projects filtered by tech stack, status, and visibility
- 📨 **Proposals & Applications** — Submit structured proposals with cover letters, milestones, GitHub/portfolio URLs, and resume uploads
- 👥 **Teams** — Create teams, invite members by email, assign projects, and collaborate in a shared workspace
- 🏢 **Organisations** — Multi-tier org management with an `owner → admin → member` role hierarchy
- 📊 **Contributor Analytics** — GitHub-style contribution heatmaps, weekly activity charts, tech stack breakdowns, and profile stats
- 🏆 **Leaderboard** — Public ranking of top contributors across the platform
- 💳 **Subscription Plans** — Starter (free), Pro, and Pro+ tiers with feature gating and auto-demotion on plan expiry

---

## 📸 Screenshots

> Coming soon — add screenshots of the dashboard, marketplace, and issue explorer here.

<!-- 
  Suggested screenshots to add:
  - Landing page hero
  - Dashboard (My Issues tab)
  - Gig Marketplace
  - Project Explorer
  - Issue claiming panel
  - User Profile / Analytics
-->

---

## 🗂️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | 18 / 5.x |
| Build Tool | [Vite](https://vitejs.dev) | 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix primitives) | 3.x |
| Routing | [React Router DOM](https://reactrouter.com) | v6 |
| Data Fetching / State | [TanStack React Query](https://tanstack.com/query) | v5 |
| Backend | [Supabase](https://supabase.com) — Auth, PostgreSQL, Edge Functions, Storage | latest |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | — |
| Animation | [Framer Motion](https://www.framer.com/motion/) | — |
| Charts | [Recharts](https://recharts.org) | — |
| Drag & Drop | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | — |

---

## 🏗️ Architecture Overview

Colabs is a **single-page application (SPA)** backed by a fully managed [Supabase](https://supabase.com) project. There is no custom backend server — all server-side logic runs in Supabase Edge Functions (Deno).

```
┌─────────────────────────────────────────────────────┐
│                     Browser (SPA)                   │
│  React 18 + TypeScript + Vite                       │
│  React Router v6  │  TanStack Query  │  shadcn/ui   │
└────────────────────────┬────────────────────────────┘
                         │  HTTPS
┌────────────────────────▼────────────────────────────┐
│                  Supabase Platform                  │
│                                                     │
│  ┌───────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Supabase │  │  PostgreSQL  │  │   Storage   │  │
│  │   Auth    │  │  (15 tables) │  │  2 buckets  │  │
│  │ (JWT/RLS) │  │  + RLS       │  │             │  │
│  └───────────┘  └──────────────┘  └─────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │          Edge Functions (Deno)               │   │
│  │  github-oauth  │  github-repositories        │   │
│  │  github-issues │  github-project-data        │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────┘
                         │  GitHub REST API
                ┌────────▼─────────┐
                │   GitHub API v3  │
                └──────────────────┘
```

### Layout System

| Layout Component | Used For |
|---|---|
| `AppLayout` | Authenticated dashboard pages (sidebar + header) |
| `TopNavLayout` | Public-facing pages (top navigation bar) |
| `BottomNav` | Mobile navigation (visible on small screens only) |

### Design System

- **Linear-inspired** dark-first aesthetic
- HSL-based CSS custom properties (`--primary`, `--background`, `--muted`, etc.)
- Semantic Tailwind tokens only — no raw colour values in components
- Dark mode via `dark` class toggle on `<html>`

For a full data-flow mapping (hooks → components → data sources), see [DATA_FLOW.md](./DATA_FLOW.md).

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed and available before continuing:

| Requirement | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| [npm](https://www.npmjs.com) | 9+ | Comes with Node.js |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | latest | `npm install -g supabase` |
| [Git](https://git-scm.com) | any | — |
| A [Supabase](https://supabase.com) account | — | Free tier is sufficient |
| A [GitHub OAuth App](https://github.com/settings/developers) | — | See [Step 5](#5-configure-github-oauth) |

---

### 1. Fork & Clone

Click **Fork** at the top of this page to create your own copy, then clone it locally:

```bash
# SSH (recommended)
git clone git@github.com:YOUR_USERNAME/colabs.v2.git

# HTTPS
git clone https://github.com/YOUR_USERNAME/colabs.v2.git

cd colabs.v2
```

> The upstream repository is at `git@github.com:SpaceyaTech/colabs.v2.git`. Add it as a remote so you can keep your fork in sync:
> ```bash
> git remote add upstream git@github.com:SpaceyaTech/colabs.v2.git
> git fetch upstream
> ```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values. See the full [Environment Variables Reference](#-environment-variables-reference) below.

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

### 4. Set Up Supabase

#### 4a. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from **Project Settings → API**
3. Add them to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 4b. Link your local project to Supabase

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
```

#### 4c. Apply the database migrations

```bash
npx supabase db push
```

This will create all 15 tables, Row Level Security policies, security definer functions, and storage buckets.

#### 4d. Verify your database setup

After running migrations, confirm the following in your Supabase dashboard under **Table Editor**:

- [ ] 15 tables created (see [Database Schema](#-database-schema) below)
- [ ] RLS enabled on all tables
- [ ] Storage buckets: `resumes` (private) and `project-logos` (public)

---

### 5. Configure GitHub OAuth

Colabs uses GitHub OAuth for **two separate purposes**:

1. **Authentication** — users can sign in with GitHub
2. **GitHub Integration** — users connect their GitHub account to sync repositories (independent of login method)

You need **two separate GitHub OAuth Apps** — one for each purpose.

#### 5a. Create the apps

Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) and create two apps:

| App | Homepage URL | Callback URL |
|---|---|---|
| Colabs Auth | `http://localhost:5173` | `https://your-project-ref.supabase.co/auth/v1/callback` |
| Colabs Integration | `http://localhost:5173` | `http://localhost:5173/dashboard` (or your Supabase edge function URL) |

#### 5b. Configure Supabase Auth for GitHub sign-in

In your Supabase dashboard, go to **Authentication → Providers → GitHub** and enter the **Client ID** and **Client Secret** from your first OAuth app.

#### 5c. Add the Integration client credentials to `.env`

```env
VITE_GITHUB_CLIENT_ID=your-integration-app-client-id
```

Store the **Client Secret** server-side only — add it to your **Supabase Edge Function secrets**:

```bash
npx supabase secrets set GITHUB_CLIENT_SECRET=your-client-secret
npx supabase secrets set GITHUB_CLIENT_ID=your-integration-app-client-id
```

---

### 6. Deploy Edge Functions

Deploy the four GitHub integration edge functions to your Supabase project:

```bash
npx supabase functions deploy github-oauth
npx supabase functions deploy github-repositories
npx supabase functions deploy github-issues
npx supabase functions deploy github-project-data
```

Verify deployment in your Supabase dashboard under **Edge Functions**.

| Function | Purpose |
|---|---|
| `github-oauth` | Exchanges OAuth code for an access token; upserts the integration record |
| `github-repositories` | Fetches repos from the GitHub API and syncs to `github_repositories` |
| `github-issues` | Fetches open issues from collaboration-enabled repos with label categorisation |
| `github-project-data` | Retrieves detailed project/repo metadata |

> **Security note:** Access tokens are stored server-side only. They are never returned to or readable by the client — Supabase RLS column-level filtering enforces this.

---

### 7. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

You should see the Colabs landing page. Sign up with email or GitHub to access the dashboard.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build the app for production (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm run type-check` | Run TypeScript type-checking (`tsc --noEmit`) |

---

## 📁 Project Structure

```
colabs/
├── public/                    # Static assets (logo, favicon, robots.txt)
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui base components (auto-generated)
│   │   ├── layout/            # AppLayout, TopNavLayout, BottomNav
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── gigs/              # Gig marketplace components
│   │   ├── projects/          # Project card, detail, form components
│   │   ├── issues/            # Issue list, claim panel, filters
│   │   ├── teams/             # Team creation, workspace, member list
│   │   ├── organizations/     # Org dashboard, member management
│   │   └── shared/            # Globally shared components (modals, badges, etc.)
│   │
│   ├── pages/                 # Route-level page components (one per route)
│   │
│   ├── hooks/                 # TanStack Query hooks (data fetching & mutations)
│   │   ├── useGigs.ts
│   │   ├── useProjects.ts
│   │   ├── useIssues.ts
│   │   ├── useTeams.ts
│   │   ├── useOrganizations.ts
│   │   ├── useSubscription.ts
│   │   └── ...
│   │
│   ├── lib/                   # Utilities, Supabase client, helpers
│   │   ├── supabase.ts        # Supabase client initialisation
│   │   ├── utils.ts           # General utilities (cn, formatters, etc.)
│   │   └── validators.ts      # Shared Zod schemas
│   │
│   ├── types/                 # TypeScript interfaces and type definitions
│   │
│   ├── integrations/
│   │   └── supabase/          # Auto-generated Supabase types (do not edit manually)
│   │       └── types.ts
│   │
│   ├── App.tsx                # Root component with router and providers
│   └── main.tsx               # Application entry point
│
├── supabase/
│   ├── functions/             # Edge Functions (Deno runtime)
│   │   ├── github-oauth/
│   │   ├── github-repositories/
│   │   ├── github-issues/
│   │   └── github-project-data/
│   └── migrations/            # Timestamped PostgreSQL migration files
│
├── .env.example               # Environment variable template
├── .gitignore
├── components.json            # shadcn/ui configuration
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── PRD.md                     # Product Requirements Document
├── CONTRIBUTING.md            # Contribution guide
├── CHANGELOG.md               # Version history
├── DATA_FLOW.md               # Data source → hook → component mapping
├── SUBSCRIPTIONS.md           # Subscription tier documentation
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE
```

---

## 🗄️ Database Schema

Colabs uses **15 PostgreSQL tables**, all with Row Level Security (RLS) enabled.

| Table | Description |
|---|---|
| `profiles` | User profile data linked to Supabase Auth |
| `projects` | Open-source and paid collaborative projects |
| `gigs` | Freelance job listings in the marketplace |
| `proposals` | Contributor applications to gigs/projects |
| `proposal_milestones` | Milestone breakdowns within a proposal |
| `claimed_issues` | Issues a user has claimed from GitHub |
| `github_integrations` | Connected GitHub accounts per user |
| `github_repositories` | Synced repos from connected GitHub accounts |
| `teams` | Platform teams within the application |
| `team_members` | Membership records for each team |
| `team_projects` | Projects assigned to a team |
| `organizations` | Organisations with role-based membership |
| `organization_members` | Member records with roles (owner/admin/member) |
| `user_subscriptions` | Subscription plan and expiry per user |
| `collaboration_requests` | Requests to collaborate on a repository |
| `saved_jobs` | Bookmarked projects/gigs per user |

### Security Functions

Three **security definer functions** are used to prevent recursive RLS evaluation:

| Function | Purpose |
|---|---|
| `has_role(user_id, role)` | Checks a user's role without triggering RLS recursion |
| `is_team_member(user_id, team_id)` | Used in team RLS policies |
| `get_user_org_role(user_id, org_id)` | Returns a user's role within an organisation |

### Storage Buckets

| Bucket | Access | Contents |
|---|---|---|
| `project-logos` | Public | Project logo images (JPEG/PNG/WebP/GIF, ≤ 2 MB) |
| `resumes` | Private (owner only) | Uploaded CVs/resumes (PDF/DOC/DOCX, ≤ 10 MB) |

---

## 🔐 Environment Variables Reference

Create a `.env` file at the project root using `.env.example` as a template.

```env
# ─── Supabase ──────────────────────────────────────────────────────────────────
# Found in: Supabase Dashboard → Project Settings → API

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key


# ─── GitHub OAuth (Integration — NOT the auth login) ──────────────────────────
# Create at: https://github.com/settings/developers → OAuth Apps
# Only the Client ID goes here. The Client Secret must be set as a
# Supabase Edge Function secret (see Getting Started → Step 5).

VITE_GITHUB_CLIENT_ID=your-github-oauth-app-client-id


# ─── Application ───────────────────────────────────────────────────────────────
# The base URL of your running app (used for OAuth redirect URIs)

VITE_APP_URL=http://localhost:5173
```

> **Important:** The `GITHUB_CLIENT_SECRET` is **never** set in `.env`. It is stored exclusively as a Supabase Edge Function secret to prevent client-side exposure:
> ```bash
> npx supabase secrets set GITHUB_CLIENT_SECRET=your-secret
> ```

---

## 🤝 Contributing

Colabs is an open-source project and contributions of all kinds are welcome — from bug fixes and documentation improvements to new features and design enhancements.

### Before you start

- Read the [Code of Conduct](./CODE_OF_CONDUCT.md)
- Read the full [Contributing Guide](./CONTRIBUTING.md)
- Check the [open issues](https://github.com/SpaceyaTech/colabs.v2/issues) — look for the `good first issue` label if you're new to the project

### Quick contribution workflow

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone git@github.com:YOUR_USERNAME/colabs.v2.git
cd colabs.v2

# 2. Create a feature branch (branch off main)
git checkout -b feat/your-feature-name

# 3. Make your changes
# 4. Run lint and type checks before committing
npm run lint
npm run type-check

# 5. Commit using conventional commits
git commit -m "feat: add issue filtering by repository"

# 6. Push and open a Pull Request against main
git push origin feat/your-feature-name
```

### Commit message convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes only |
| `style:` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, config, dependencies |

### Issue and PR templates

When opening an issue or PR, please use the provided templates:

- 🐛 [Bug Report](./.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md)
- 📋 [Pull Request Template](./.github/pull_request_template.md) — includes a checklist for lint, type-check, and docs

---

## 🗺️ Roadmap

See the full [Product Requirements Document](./PRD.md) for detailed feature specs. Here's the high-level view:

### ✅ v1.0 — Core Platform (In Progress)

- [x] Authentication (Email, GitHub OAuth, Google OAuth)
- [x] GitHub Integration (connect, sync repos, collaboration toggle)
- [x] Issue Claiming & Status Tracking
- [x] Project Management (create, browse, save)
- [x] Gig Marketplace (post, browse, manage)
- [x] Proposals & Applications (milestones, resume upload)
- [x] Teams & Organisations
- [x] Subscription Tiers (Starter / Pro / Pro+)
- [x] Leaderboard
- [ ] Replace mock analytics data with live DB queries ← active tech debt
- [ ] Stripe payment integration

### 🔜 Phase 2 — Engagement & Monetisation (Target: Q3 2026)

- [ ] Real-time notifications (Supabase Realtime)
- [ ] In-app messaging between owners and contributors
- [ ] Stripe payment processing with milestone releases
- [ ] Contributor reputation score algorithm
- [ ] Gamification & achievement badges

### 🔮 Phase 3 — Scale & Intelligence (Target: Q4 2026 – Q1 2027)

- [ ] AI-powered project matching (based on tech stack + history)
- [ ] Full-text search across projects, gigs, and issues
- [ ] Organisation billing plans
- [ ] Public REST/GraphQL API for third-party integrations
- [ ] Code review integration (PR tracking linked to claimed issues)
- [ ] React Native mobile app

---

## 💬 Community & Support

We'd love to have you in the community — whether you're contributing code, sharing feedback, or just following along.

| Channel | Link | Purpose |
|---|---|---|
| 💬 Discord | [discord.gg/UKjtBDDFHH](https://discord.gg/UKjtBDDFHH) | Real-time chat — ask questions, share ideas, meet contributors |
| 🐛 GitHub Issues | [colabs.v2/issues](https://github.com/SpaceyaTech/colabs.v2/issues) | Bug reports and feature requests |
| 💡 GitHub Discussions | [colabs.v2/discussions](https://github.com/SpaceyaTech/colabs.v2/discussions) | Long-form questions, proposals, and community conversation |
| 𝕏 X (Twitter) | [@SpaceYaTech](https://x.com/SpaceYaTech) | Announcements, updates, and release notes |
| 📸 Instagram | [@SpaceYaTech](https://instagram.com/SpaceYaTech) | Behind-the-scenes and community highlights |
| 💼 LinkedIn | [SpaceYaTech](https://linkedin.com/company/SpaceYaTech) | Professional updates and milestones |
| 🎵 TikTok | [@SpaceYaTech](https://tiktok.com/@SpaceYaTech) | Short-form demos and community content |

> 🔒 If you find a **security vulnerability**, please do **not** open a public issue. Follow the responsible disclosure process documented in [SECURITY.md](./SECURITY.md).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions in the license.

---

## 🙏 Acknowledgements

Colabs is built with and on top of excellent open-source tools:

- [Supabase](https://supabase.com) — open-source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com) — beautifully designed components built on Radix
- [TanStack Query](https://tanstack.com/query) — powerful async state management
- [Vite](https://vitejs.dev) — next-generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS framework
- [Lovable](https://lovable.dev) — the AI-powered development platform used to bootstrap this project

---

<div align="center">

Made with ❤️ by the Colabs community · Powered by [SpaceYaTech](https://x.com/SpaceYaTech)

[Discord](https://discord.gg/UKjtBDDFHH) · [X](https://x.com/SpaceYaTech) · [Instagram](https://instagram.com/SpaceYaTech) · [LinkedIn](https://linkedin.com/company/SpaceYaTech) · [TikTok](https://tiktok.com/@SpaceYaTech)

[⬆ Back to top](#colabs)

</div>