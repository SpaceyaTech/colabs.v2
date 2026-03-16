# Changelog

All notable changes to the Colabs platform are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Real-time notifications via Supabase Realtime
- Stripe payment integration for gigs and projects
- AI-powered contributor matching
- In-app messaging between collaborators

---

## [0.3.0] — 2026-03-09

### Added
- Comprehensive PRD documentation (`docs/PRD.md`)
- GitHub sign-up / sign-in authentication flow documentation
- CHANGELOG tracking for version history

### Security
- Restricted `github_integrations` queries to safe columns only — tokens no longer reach the client
- Added MIME type, extension, and file-size validation for project logo and resume uploads
- Sanitized error responses in `github-issues` edge function to prevent information leakage

---

## [0.2.0] — 2026-03-01

### Added
- **Organizations module** — create orgs, manage members with role-based access (`owner`, `admin`, `member`)
- Organization dashboard with integrations and workflow management
- **Teams module** — create teams, invite members by email, assign projects to teams
- Team workspace with drag-and-drop Kanban board (`@hello-pangea/dnd`)
- **Gig Marketplace** — browse, create, and manage freelance gigs
- Featured gigs carousel on the marketplace page
- **Proposals system** — submit proposals with milestones, resume upload, and cover letter
- My Proposals page to track submission status
- Saved Jobs functionality for bookmarking projects
- **Leaderboard** page for gamified contributor rankings
- Seller Dashboard for gig creators

### Changed
- Expanded dashboard with dedicated tabs: Overview, Projects, Issues, Gigs, Teams, Analytics, Settings
- Added global search component in the header

---

## [0.1.0] — 2026-02-15

### Added
- **Authentication** — email/password sign-up and sign-in via Supabase Auth
- Auth guard for protected routes
- **GitHub Integration** — OAuth connection, repository sync, and issue fetching via edge functions
  - `github-oauth` — handles OAuth callback and token exchange
  - `github-repositories` — syncs user repositories to `github_repositories` table
  - `github-issues` — fetches open issues from collaboration-enabled repos
  - `github-project-data` — retrieves detailed project metadata
- **Projects** — create, browse, and manage collaborative projects
  - Project detail page with side panel
  - Filtering by technology, experience level, and category
- **Issues** — view and claim GitHub issues from synced repositories
  - Issue side panel with labels, priority, and status
  - Claimed issues tracking per user
- **Profile** — user profile page with contribution heatmap, tech stack chart, and activity graphs
- **Landing page** — hero section, stats, testimonials, FAQ, interactive demo, and CTA
- Bottom navigation for mobile viewports
- Dark/light theme toggle via `next-themes`
- Responsive layout with sidebar (`AppSidebar`) and top-nav (`TopNavLayout`) variants
- Full documentation suite: Architecture, Database, Data Fetching, Edge Functions, GitHub Integration, Setup

### Infrastructure
- React 18 + TypeScript + Vite 5
- Tailwind CSS + shadcn/ui component library
- TanStack React Query v5 for data fetching and caching
- Supabase for Auth, Postgres DB, Edge Functions, and Storage
- Framer Motion for scroll-reveal and page animations
- Recharts for analytics and profile charts
- React Router DOM v6 with nested layouts

---

## Version Legend

| Label | Meaning |
|---|---|
| **Added** | New features |
| **Changed** | Modifications to existing features |
| **Deprecated** | Features scheduled for removal |
| **Removed** | Features deleted |
| **Fixed** | Bug fixes |
| **Security** | Vulnerability patches |
