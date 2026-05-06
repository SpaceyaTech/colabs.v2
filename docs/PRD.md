# Product Requirements Document (PRD)

**Product Name:** Colabs
**Tagline:** Open-source collaboration meets freelance opportunity
**Version:** 1.1
**Last Updated:** 2026-03-16
**Status:** Active Development — v1.0 in progress
**Organisation:** [SpaceyaTech](https://github.com/SpaceyaTech/colabs.v2)
**Community:** [Discord](https://discord.gg/UKjtBDDFHH) · [X](https://x.com/SpaceYaTech) · [Instagram](https://instagram.com/SpaceYaTech) · [LinkedIn](https://linkedin.com/company/SpaceYaTech) · [TikTok](https://tiktok.com/@SpaceYaTech)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Core Features](#4-core-features)
   - 4.1 [Authentication & Onboarding](#41-authentication--onboarding)
   - 4.2 [GitHub Integration](#42-github-integration)
   - 4.3 [Issue Tracking & Claiming](#43-issue-tracking--claiming)
   - 4.4 [Project Management](#44-project-management)
   - 4.5 [Gig Marketplace](#45-gig-marketplace)
   - 4.6 [Proposals & Applications](#46-proposals--applications)
   - 4.7 [Teams & Collaboration](#47-teams--collaboration)
   - 4.8 [Organisations](#48-organisations)
   - 4.9 [User Profile & Analytics](#49-user-profile--analytics)
   - 4.10 [Collaboration Requests](#410-collaboration-requests)
   - 4.11 [Subscriptions & Pricing](#411-subscriptions--pricing)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Route Map](#7-route-map)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Testing Strategy](#9-testing-strategy)
10. [CI/CD & Deployment](#10-cicd--deployment)
11. [Security & Privacy](#11-security--privacy)
12. [Roadmap](#12-roadmap)
13. [Success Metrics](#13-success-metrics)
14. [Definition of Done](#14-definition-of-done)
15. [Community & Contact](#15-community--contact)
16. [Glossary](#16-glossary)

---

## 1. Product Overview

Colabs is an open-source web platform that connects developers with open-source projects, freelance gigs, and collaborative teams. It bridges the gap between GitHub-based open-source contribution and structured freelance marketplaces — enabling developers to discover projects, claim issues, submit proposals, and earn, all from a single dashboard backed by their real GitHub activity.

**Core value proposition:** Developers should never have to leave a single platform to find open-source work, track their contributions, apply to paid gigs, and manage teams. Colabs unifies all of this, with GitHub as the source of truth.

---

## 2. Problem Statement

Developers today face fragmented workflows:

- **Open-source contributors** struggle to discover projects matching their skill level and interests across thousands of GitHub repositories.
- **Freelancers** use separate platforms (Upwork, Fiverr) that have no connection to their open-source work or GitHub reputation.
- **Project owners** lack a streamlined way to attract contributors, manage collaboration requests, and post paid gigs tied to their repositories.
- **Organisations** have no unified tool that combines team management, project oversight, and contributor onboarding.

Colabs solves this by unifying project discovery, issue tracking, gig marketplaces, and team collaboration into one platform backed by GitHub integration.

---

## 3. Target Users

### 3.1 Developer / Contributor

- Wants to discover open-source projects and freelance gigs
- Claims GitHub issues, tracks progress, and builds a verifiable contribution profile
- Submits proposals for paid gigs with milestones and resume uploads

### 3.2 Project Owner

- Posts projects (open-source or paid) with detailed requirements
- Manages gig listings, reviews proposals, and hires contributors
- Connects GitHub repositories to enable issue-based collaboration
- Also referred to as **"seller"** in the context of the gig marketplace (see [Glossary](#15-glossary))

### 3.3 Organisation Admin

- Creates and manages organisations with role-based access (`owner → admin → member`)
- Configures integrations and workflows
- Oversees teams, projects, and contributor activity at scale

### 3.4 Team Lead

- Creates teams within the platform
- Invites members via email and assigns projects to teams
- Manages team workspace and member roles

> **Terminology note:** The terms **"Project Owner"** and **"Seller"** refer to the same user persona. "Project Owner" is used in open-source and collaborative project contexts. "Seller" is used specifically in the gig marketplace context. All code, database columns, and copy should prefer "project_owner" as the canonical identifier.

---

## 4. Core Features

> **Priority levels:**
>
> - **P0** — Launch blocker. Must ship for v1.0.
> - **P1** — High value. Should ship for v1.0.
> - **P2** — Nice to have. Can ship post-launch.
> - **P3** — Future consideration.

> **Status legend:** ✅ Implemented · 🔜 Planned · 🚧 In Progress · ⚠️ Implemented with known issue

---

### 4.1 Authentication & Onboarding

| Requirement                                          | Priority | Status         |
| ---------------------------------------------------- | -------- | -------------- |
| Email/password sign-up with email confirmation       | P0       | ✅ Implemented |
| OAuth sign-in with GitHub                            | P0       | ✅ Implemented |
| OAuth sign-in with Google                            | P0       | ✅ Implemented |
| Post-auth redirect to `/dashboard`                   | P0       | ✅ Implemented |
| Auth-guarded routes for dashboard, profile, settings | P0       | ✅ Implemented |
| Session persistence across page reloads              | P0       | ✅ Implemented |

**Acceptance Criteria:**

- Users can create an account with email or OAuth providers
- Auth state is managed via `AuthProvider` context using Supabase Auth
- Unauthenticated users are redirected to `/sign-up` when accessing protected routes
- Email confirmation is required before dashboard access is granted

---

### 4.2 GitHub Integration

| Requirement                                                 | Priority | Status         |
| ----------------------------------------------------------- | -------- | -------------- |
| Connect GitHub account via OAuth (separate from auth login) | P0       | ✅ Implemented |
| Sync repositories from connected GitHub account             | P0       | ✅ Implemented |
| Toggle `allow_collaboration` per repository                 | P1       | ✅ Implemented |
| Fetch open issues from collaboration-enabled repos          | P0       | ✅ Implemented |
| Display issue metadata (labels, priority, good-first-issue) | P1       | ✅ Implemented |
| Disconnect GitHub integration                               | P1       | ✅ Implemented |
| GitHub API rate limit handling with graceful degradation    | P1       | 🔜 Planned     |

**Edge Functions:**

| Function              | Purpose                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `github-oauth`        | Exchanges OAuth code for access token; upserts integration record              |
| `github-repositories` | Fetches user repos from GitHub API; syncs to `github_repositories` table       |
| `github-issues`       | Fetches open issues from collaboration-enabled repos with label categorisation |
| `github-project-data` | Retrieves detailed project/repo metadata                                       |

**Rate Limiting Strategy:**
The GitHub REST API enforces a limit of 5,000 authenticated requests per hour. The following mitigations are in place or planned:

- Edge functions cache repository and issue data in the `github_repositories` table; fresh API calls are only made on explicit user-triggered sync
- Sync frequency is rate-limited per user (maximum 1 full sync per 15 minutes)
- All API calls use authenticated requests (via stored user token) to avoid the 60 req/hour unauthenticated limit
- If a rate limit response (`HTTP 403` or `HTTP 429`) is received, the edge function returns a structured error and the client displays a user-facing message with a retry-after timestamp
- Planned: exponential backoff retry in edge functions

**Acceptance Criteria:**

- Users connect GitHub independently of their login method
- Only public, collaboration-enabled repositories are visible to other users
- Issues are categorised by labels (bug, feature, docs) with priority mapping
- Access tokens are never exposed to the client (column-level RLS filtering enforced)
- Rate limit errors surface a clear message to the user, not a generic failure

---

### 4.3 Issue Tracking & Claiming

| Requirement                                                          | Priority | Status         |
| -------------------------------------------------------------------- | -------- | -------------- |
| Browse all open issues from collaboration-enabled repos              | P0       | ✅ Implemented |
| Claim an issue (assigns to user in `claimed_issues` table)           | P0       | ✅ Implemented |
| Track claimed issue status (`todo → in-progress → in-review → done`) | P0       | ✅ Implemented |
| Unclaim / release an issue                                           | P1       | ✅ Implemented |
| View claimed issues in dashboard "My Issues" tab                     | P0       | ✅ Implemented |
| Issue side panel with full details                                   | P1       | ✅ Implemented |
| Filter/search issues by repository, labels, priority                 | P1       | ✅ Implemented |
| Prevent duplicate claims on the same issue                           | P0       | ✅ Implemented |

**Data Model:** `claimed_issues` table with RLS restricting access to the claiming user.

**Acceptance Criteria:**

- Each user can only view and manage their own claimed issues
- An issue cannot be claimed by two users simultaneously; the second claim attempt returns a conflict error
- Issue status transitions are reflected in the dashboard immediately (optimistic update)
- Issues link back to the original GitHub issue via `html_url`

---

### 4.4 Project Management

| Requirement                                                               | Priority | Status         |
| ------------------------------------------------------------------------- | -------- | -------------- |
| Create projects with detailed metadata                                    | P0       | ✅ Implemented |
| Project types, visibility (`public` / `unlisted` / `private`), tech stack | P0       | ✅ Implemented |
| Upload project logos to Supabase Storage (`project-logos` bucket)         | P1       | ✅ Implemented |
| Browse/explore public projects                                            | P0       | ✅ Implemented |
| Project detail page with side panel                                       | P1       | ✅ Implemented |
| Link GitHub repository URL to project                                     | P1       | ✅ Implemented |
| Project grid with cards showing tech stack, status, team size             | P0       | ✅ Implemented |
| Save/bookmark projects (`saved_jobs` table)                               | P1       | ✅ Implemented |

**Acceptance Criteria:**

- Project logos are validated (JPEG/PNG/WebP/GIF, ≤ 2 MB) before upload; invalid files are rejected with a user-facing error
- Public and unlisted projects are visible to all; private projects are visible to creators only
- Projects display in a responsive grid with technology badges
- Deleting a project removes associated logo from storage

---

### 4.5 Gig Marketplace

| Requirement                                                       | Priority | Status         |
| ----------------------------------------------------------------- | -------- | -------------- |
| Post gigs with title, description, budget, duration, requirements | P0       | ✅ Implemented |
| Gig categories, difficulty levels, technology tags                | P0       | ✅ Implemented |
| Featured and urgent gig flags                                     | P1       | ✅ Implemented |
| Browse active gigs in marketplace                                 | P0       | ✅ Implemented |
| Gig detail page with company info, deliverables, requirements     | P0       | ✅ Implemented |
| Featured gigs carousel on landing page                            | P1       | ✅ Implemented |
| Project Owner dashboard for managing own gigs                     | P0       | ✅ Implemented |
| Gig status management (`active` / `paused` / `closed`)            | P1       | ✅ Implemented |
| Basic spam/abuse prevention on gig creation                       | P1       | 🔜 Planned     |

**Data Model:** `gigs` table with RLS — anyone can view active gigs; creators manage their own.

**Spam & Abuse Prevention (Planned):**

- Rate limit gig creation to a maximum of 5 active gigs per user on the Starter plan
- Zod schema enforces minimum description length (100 characters) to deter low-quality listings
- Reported gigs are flagged for admin review (requires admin dashboard, Phase 2)
- Duplicate title detection warns the user before submission

**Acceptance Criteria:**

- Gigs are validated via Zod schemas before creation
- Marketplace shows only active gigs ordered by creation date (featured gigs pinned first)
- Project Owners can pause/resume/close their gigs from the management dashboard
- Closed gigs are not shown in the marketplace but are preserved in the database

---

### 4.6 Proposals & Applications

| Requirement                                                                    | Priority | Status         |
| ------------------------------------------------------------------------------ | -------- | -------------- |
| Submit proposals for gigs/projects                                             | P0       | ✅ Implemented |
| Milestone-based payment structure                                              | P1       | ✅ Implemented |
| Resume upload (PDF/DOC/DOCX, ≤ 10 MB) to `resumes` bucket                      | P0       | ✅ Implemented |
| Cover letter, GitHub URL, portfolio URL fields                                 | P0       | ✅ Implemented |
| View own submitted proposals                                                   | P0       | ✅ Implemented |
| Project owners can view proposals for their projects                           | P1       | ✅ Implemented |
| Proposal status transitions (`submitted → under review → accepted / rejected`) | P1       | 🔜 Planned     |

**Data Model:** `proposals` + `proposal_milestones` tables with RLS.

**Acceptance Criteria:**

- Resumes are validated for file type and size before upload; invalid uploads are rejected with a specific error message
- Milestones have title, amount, and duration; ordered by `order_index`
- Proposal status defaults to `"submitted"`
- A user cannot submit more than one proposal per gig/project
- Uploaded resumes are only accessible to the uploader and the project owner (private bucket + RLS)

---

### 4.7 Teams & Collaboration

| Requirement                               | Priority | Status         |
| ----------------------------------------- | -------- | -------------- |
| Create teams with name and description    | P0       | ✅ Implemented |
| Invite members by email                   | P0       | ✅ Implemented |
| Assign projects to teams                  | P1       | ✅ Implemented |
| Team workspace view                       | P1       | ✅ Implemented |
| Remove team members                       | P1       | ✅ Implemented |
| Delete teams                              | P1       | ✅ Implemented |
| Role-based access (`creator` vs `member`) | P0       | ✅ Implemented |

**Data Model:** `teams` → `team_members` → `team_projects` with `is_team_member()` security definer function.

**Acceptance Criteria:**

- Team creators have full CRUD access; members have read-only access to the team workspace
- Team membership is checked via `is_team_member()` to avoid recursive RLS evaluation
- Deleting a team removes all associated `team_members` and `team_projects` records (cascade)
- An email invitation is sent when a new member is invited (requires email service integration)

---

### 4.8 Organisations

| Requirement                                       | Priority | Status         |
| ------------------------------------------------- | -------- | -------------- |
| Create organisations with name, slug, description | P0       | ✅ Implemented |
| Role hierarchy: `owner → admin → member`          | P0       | ✅ Implemented |
| Organisation dashboard                            | P1       | ✅ Implemented |
| Organisation setup wizard                         | P1       | ✅ Implemented |
| Organisation integrations and workflows           | P2       | ✅ Implemented |
| Join/leave organisations                          | P1       | ✅ Implemented |

**Data Model:** `organizations` → `organization_members` with `get_user_org_role()` security definer function.

**Acceptance Criteria:**

- Roles are stored in `organization_members`, never on a user/profile table
- Admins can manage members (except other owners); owners have full access
- Organisation slug is unique, URL-safe, and immutable after creation (changes require owner action)
- An organisation must always have at least one owner; the last owner cannot be removed or demoted

---

### 4.9 User Profile & Analytics

| Requirement                               | Priority | Status         | Data Source                    |
| ----------------------------------------- | -------- | -------------- | ------------------------------ |
| User profile page with contribution stats | P1       | ⚠️ Implemented | ⚠️ Mock data                   |
| Contribution heatmap (GitHub-style)       | P1       | ⚠️ Implemented | ⚠️ Mock (random)               |
| Tech stack breakdown chart                | P2       | ⚠️ Implemented | ⚠️ Mock data                   |
| Weekly activity chart                     | P2       | ⚠️ Implemented | ⚠️ Mock data                   |
| Monthly activity chart (commits + PRs)    | P2       | ⚠️ Implemented | ⚠️ Mock data                   |
| Projects contributed list                 | P1       | ⚠️ Implemented | ⚠️ Mock data                   |
| Dashboard analytics tab                   | P1       | ⚠️ Implemented | ⚠️ Mock data                   |
| Recent activity feed                      | P2       | ⚠️ Implemented | ⚠️ Mock data                   |
| Dashboard "My Issues" overview            | P0       | ⚠️ Implemented | ⚠️ Should use `claimed_issues` |

**Current State:**
The UI components (charts, heatmaps, stat cards) are fully built with proper typed interfaces and design-system-compliant styling. However, all analytics data is currently **mock/hardcoded** — no live metrics are computed from the database yet.

> ⚠️ **Tech Debt — Tracked in [Issue #TBD](https://github.com/SpaceyaTech/colabs.v2/issues)**
> All mock data must be replaced with live database queries before the v1.0 public launch.
> `Math.random()` must not appear in any production render path.

**Live Data Migration Checklist:**

| Component                   | Current Source  | Target Source                                            | Priority               |
| --------------------------- | --------------- | -------------------------------------------------------- | ---------------------- |
| Dashboard "My Issues" count | Mock            | `claimed_issues` WHERE `user_id = auth.uid()`            | **P0 — blocks launch** |
| Contribution heatmap        | `Math.random()` | `claimed_issues` grouped by `updated_at::date`           | P1                     |
| Weekly activity chart       | Mock array      | `claimed_issues` status changes grouped by ISO week      | P1                     |
| Projects contributed list   | Hardcoded       | `projects` joined via `team_projects` + `claimed_issues` | P1                     |
| Tech stack breakdown        | Mock categories | `projects.tech_stack` aggregated for the current user    | P2                     |
| Recent activity feed        | Mock events     | Activity log table (requires new table — see Phase 2)    | P2                     |

**Data Architecture:**
See [DATA_FLOW.md](./DATA_FLOW.md) for the complete mapping of data sources → hooks → components, the mock vs live audit, and the migration plan.

> 📄 **Note:** `DATA_FLOW.md` is currently a planned document. It must be created before the first external contribution sprint. See [Issue #TBD](https://github.com/SpaceyaTech/colabs.v2/issues).

**Acceptance Criteria:**

- Charts render using Recharts with responsive sizing and semantic colour tokens
- All chart components accept data via typed props (they never fetch data internally)
- Profile data is derived from `claimed_issues`, `projects`, and GitHub API — no hardcoded values
- Empty, loading, and error states are handled gracefully without breaking the UI layout
- No `Math.random()` in any production render path

---

### 4.10 Collaboration Requests

| Requirement                                               | Priority | Status         |
| --------------------------------------------------------- | -------- | -------------- |
| Request to collaborate on a repository                    | P1       | ✅ Implemented |
| Include message, skills, experience level                 | P1       | ✅ Implemented |
| Repository owners can approve/reject requests             | P1       | ✅ Implemented |
| Request status tracking (`pending → approved / rejected`) | P1       | ✅ Implemented |

**Data Model:** `collaboration_requests` table with RLS for requesters and repository owners.

**Acceptance Criteria:**

- A user cannot submit duplicate collaboration requests for the same repository
- Approved requests grant the requester visibility into the collaboration-enabled repo's issues
- Rejected requests preserve the record for audit purposes; users may re-apply after 30 days

---

### 4.11 Subscriptions & Pricing

| Requirement                                      | Priority | Status         |
| ------------------------------------------------ | -------- | -------------- |
| Three-tier pricing (Starter / Pro / Pro+)        | P0       | ✅ Implemented |
| `user_subscriptions` table with RLS              | P0       | ✅ Implemented |
| Auto-demotion on plan expiry via DB function     | P0       | ✅ Implemented |
| `useSubscription()` hook for feature gating      | P0       | ✅ Implemented |
| `SubscriptionGuard` route-level enforcement      | P1       | ✅ Implemented |
| `UpgradePrompt` reusable component               | P1       | ✅ Implemented |
| Pricing page shows current plan & days remaining | P1       | ✅ Implemented |
| Stripe payment integration                       | P1       | 🔜 Planned     |
| CRON job for batch expired plan cleanup          | P2       | 🔜 Planned     |

**Data Model:** `user_subscriptions` table with `check_and_demote_subscription()` security definer function.

> 📄 **Note:** `SUBSCRIPTIONS.md` is a planned document detailing the full subscription data model, feature matrix per plan, and demotion logic. It must be created alongside Stripe integration. See [Issue #TBD](https://github.com/SpaceyaTech/colabs.v2/issues).

**Plan Feature Matrix:**

| Feature               | Starter (Free) | Pro          | Pro+         |
| --------------------- | -------------- | ------------ | ------------ |
| Issue claiming        | ✅ Unlimited   | ✅ Unlimited | ✅ Unlimited |
| Active gigs           | 5 max          | 20 max       | Unlimited    |
| Proposal submissions  | 3/month        | 20/month     | Unlimited    |
| Team creation         | 1 team         | 5 teams      | Unlimited    |
| Organisation creation | ❌             | ✅           | ✅           |
| Featured gig flag     | ❌             | ✅           | ✅           |
| Analytics (live data) | ❌             | ✅           | ✅           |

**Acceptance Criteria:**

- Every user defaults to the Starter (free) plan on sign-up
- Paid plans have `expires_at`; Starter has `expires_at = NULL` (never expires)
- When `expires_at < now()`, the DB function `check_and_demote_subscription()` auto-demotes to Starter
- Demotion preserves all user data — only feature access is restricted
- Pricing page highlights the current plan and shows days remaining for paid plans
- `SubscriptionGuard` redirects to `/pricing` with an upgrade prompt if the user's plan does not permit access

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement                    | Target                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| Page load time (3G connection) | < 3 seconds (LCP)                                                      |
| Time to Interactive            | < 5 seconds (3G)                                                       |
| Client-side navigation         | < 300 ms                                                               |
| React Query cache              | All data fetching, with background refetching on window focus          |
| Image loading                  | Lazy-loaded with explicit `width` and `height` to prevent layout shift |
| Code splitting                 | Route-level dynamic imports via React Router + Vite                    |
| Viewport support               | 320 px – 2560 px                                                       |

### 5.2 Security

- Row Level Security (RLS) enabled on **all** Supabase tables — no exceptions
- Security definer functions (`has_role`, `is_team_member`, `get_user_org_role`) to prevent recursive RLS policy evaluation
- GitHub OAuth access tokens are stored server-side only; never returned to client-side queries (column-level RLS filtering)
- File upload validation: type allowlist, maximum size, sanitised filenames (no path traversal characters)
- CORS configured on all edge functions; only the application origin is permitted
- No secrets stored in client-side code or environment variables prefixed `VITE_` (except public-safe keys like anon key and OAuth client ID)
- Content Security Policy (CSP) headers configured for production deployment

### 5.3 Accessibility

- Semantic HTML structure with a single `<h1>` per page
- All `<img>` elements have descriptive `alt` text
- All interactive components are keyboard-navigable (shadcn/ui is built on Radix UI primitives, which are fully accessible)
- Colour contrast ratio ≥ 4.5:1 for normal text in both light and dark modes
- Focus indicators visible on all interactive elements
- Screen reader announcements for dynamic content changes (e.g. issue claim success)

### 5.4 SEO

- `<title>` tags < 60 characters, including a primary keyword
- `<meta name="description">` < 160 characters on all public pages
- JSON-LD structured data on project and gig detail pages
- Responsive viewport meta tag on all pages
- Canonical `<link>` tags on all pages
- `robots.txt` configured to allow crawling of public pages and block `/dashboard/*`
- Open Graph (`og:`) meta tags on landing, project, and gig pages for social sharing

---

## 6. Technical Architecture

### 6.1 Stack

| Layer        | Technology                                           | Version  |
| ------------ | ---------------------------------------------------- | -------- |
| Framework    | React + TypeScript                                   | 18 / 5.x |
| Build        | Vite                                                 | 5        |
| Styling      | Tailwind CSS + shadcn/ui (Radix primitives)          | 3.x      |
| Routing      | React Router DOM                                     | v6       |
| State / Data | TanStack React Query                                 | v5       |
| Backend      | Supabase (Auth, PostgreSQL, Edge Functions, Storage) | latest   |
| Animation    | Framer Motion                                        | —        |
| Forms        | React Hook Form + Zod                                | —        |
| Charts       | Recharts                                             | —        |
| Drag & Drop  | @hello-pangea/dnd                                    | —        |

### 6.2 Layout System

| Component      | Used For                                            |
| -------------- | --------------------------------------------------- |
| `AppLayout`    | Authenticated dashboard pages — sidebar + header    |
| `TopNavLayout` | Public-facing pages — top navigation bar            |
| `BottomNav`    | Mobile navigation bar (visible on screens < 768 px) |

### 6.3 Design System

- **Linear-inspired** dark-first aesthetic
- HSL-based CSS custom properties (`--primary`, `--background`, `--muted`, `--accent`, etc.)
- Semantic Tailwind tokens only — no raw colour values anywhere in component code
- Dark mode toggled via the `dark` class on `<html>`
- All colour decisions go through design tokens — this ensures consistent theming and makes future rebranding a single-file change

### 6.4 Database Summary

| Resource                   | Count | Notes                                             |
| -------------------------- | ----- | ------------------------------------------------- |
| Tables                     | 15    | RLS enabled on all                                |
| Security definer functions | 3     | `has_role`, `is_team_member`, `get_user_org_role` |
| Storage buckets            | 2     | `resumes` (private), `project-logos` (public)     |
| Edge Functions             | 4     | All GitHub API communication                      |

---

## 7. Route Map

| Route                      | Page                    | Auth Required | Description                          |
| -------------------------- | ----------------------- | ------------- | ------------------------------------ |
| `/`                        | Landing                 | No            | Hero, features, testimonials, CTA    |
| `/sign-in`                 | Sign In                 | No            | Email + OAuth login                  |
| `/sign-up`                 | Sign Up                 | No            | Email + OAuth registration           |
| `/dashboard`               | Dashboard — Issues      | Yes           | Default view: claimed issues list    |
| `/dashboard/projects`      | My Projects             | Yes           | User's created projects              |
| `/dashboard/gigs`          | My Gigs                 | Yes           | User's gig listings                  |
| `/dashboard/teams`         | Teams                   | Yes           | Team management                      |
| `/dashboard/teams/:teamId` | Team Workspace          | Yes           | Single team detail view              |
| `/dashboard/analytics`     | Analytics               | Yes           | Contribution analytics charts        |
| `/dashboard/settings`      | Settings                | Yes           | User account preferences             |
| `/projects`                | Explore Projects        | No            | Public project listings              |
| `/project/:id`             | Project Detail          | No            | Single project view                  |
| `/marketplace`             | Gig Marketplace         | No            | Active gig listings                  |
| `/gig/:id`                 | Gig Detail              | No            | Single gig view                      |
| `/issues`                  | All Issues              | No            | Browse all open collaboration issues |
| `/seller`                  | Project Owner Dashboard | Yes           | Manage posted gigs (see §3.2 note)   |
| `/profile`                 | User Profile            | Yes           | Contribution stats & activity        |
| `/leaderboard`             | Leaderboard             | No            | Top contributors ranking             |
| `/organisations`           | Organisations           | No            | Organisation listings                |
| `/organisations/create`    | Create Organisation     | Yes           | Organisation setup wizard            |
| `/organisations/:slug`     | Organisation Dashboard  | Yes           | Organisation management              |
| `/submit-proposal/:id`     | Submit Proposal         | Yes           | Proposal form for a gig or project   |
| `/my-proposals`            | My Proposals            | Yes           | User's submitted proposals           |
| `/saved-jobs`              | Saved Items             | Yes           | Bookmarked projects and gigs         |
| `/checkout`                | Checkout                | Yes           | Subscription payment flow            |
| `/purchase-success`        | Purchase Success        | Yes           | Post-payment confirmation            |
| `/pricing`                 | Pricing                 | No            | Subscription plan comparison         |
| `/notifications`           | Notifications           | Yes           | User notifications                   |

> **Note on `/settings`:** There is a single settings page, accessible at `/dashboard/settings`. Any link to `/settings` in the codebase should redirect to `/dashboard/settings`.

---

## 8. Error Handling Strategy

Consistent error handling across the application is essential for user trust and debuggability. The following conventions apply to all layers.

### 8.1 Client-Side (React / TanStack Query)

| Scenario              | Behaviour                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Network request fails | TanStack Query retries 3 times with exponential backoff before surfacing an error state             |
| Query error state     | Component renders an `<ErrorState>` component with a retry button — never a blank UI                |
| Mutation error        | Toast notification with a human-readable message; form is not reset so the user does not lose input |
| Auth session expired  | `AuthProvider` detects 401 responses and redirects to `/sign-in` with a `?redirect` param           |
| File upload failure   | Inline field-level error message with specific reason (file too large, wrong type, etc.)            |
| Not found (404)       | Dedicated `<NotFoundPage>` component rendered for invalid routes                                    |
| Unexpected crash      | React Error Boundary wraps all route-level pages; fallback UI includes a "Report Issue" link        |

### 8.2 Edge Functions (Supabase / Deno)

All edge functions return a consistent JSON error envelope:

```json
{
  "error": {
    "code": "GITHUB_RATE_LIMITED",
    "message": "GitHub API rate limit reached. Retry after 2026-03-16T14:00:00Z.",
    "retry_after": "2026-03-16T14:00:00Z"
  }
}
```

| HTTP Status | When Used                                                            |
| ----------- | -------------------------------------------------------------------- |
| `400`       | Invalid request parameters (validated with Zod)                      |
| `401`       | Missing or invalid Supabase JWT                                      |
| `403`       | Valid auth but insufficient permissions                              |
| `429`       | GitHub API rate limit reached (includes `retry_after` field)         |
| `500`       | Unexpected server error (logged; generic message returned to client) |

### 8.3 Database / RLS Errors

- RLS policy violations return a Supabase `PGRST116` error, which the client maps to a `403 Forbidden` user message
- Unique constraint violations (e.g., duplicate claim, duplicate slug) return a `409 Conflict` response from the relevant edge function or hook
- All database errors are caught in React Query's `onError` callback and surfaced as toast notifications

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Tool:** Vitest

**Scope:**

- Zod schema validation logic (`src/lib/validators.ts`)
- Utility functions (`src/lib/utils.ts`)
- Subscription feature-gate logic (`useSubscription` hook — mocked Supabase client)
- Date formatting and data transformation helpers

**Target coverage:** 80% on `src/lib/` and `src/hooks/`

### 9.2 Component Tests

**Tool:** Vitest + React Testing Library

**Scope:**

- Form components: render, validation error display, submission
- Auth flow: sign-in, sign-up, redirect behaviour (mocked `AuthProvider`)
- Subscription guard: renders child vs upgrade prompt based on plan
- Empty/loading/error states for all data-fetching components

### 9.3 Integration Tests

**Tool:** Vitest + MSW (Mock Service Worker)

**Scope:**

- TanStack Query hooks against mocked Supabase responses
- GitHub integration flow: OAuth exchange → repo sync → issue listing
- Proposal submission: file upload, milestone creation, status update

### 9.4 End-to-End Tests (Phase 2 Target)

**Tool:** Playwright

**Critical user journeys to automate:**

| Journey                                                         | Priority |
| --------------------------------------------------------------- | -------- |
| Sign up → verify email → access dashboard                       | P0       |
| Connect GitHub → sync repos → enable collaboration → see issues | P0       |
| Claim issue → update status → view in "My Issues"               | P0       |
| Post gig → submit proposal → review as Project Owner            | P1       |
| Create team → invite member → assign project                    | P1       |
| Upgrade subscription → verify feature unlocked                  | P1       |

### 9.5 CI Gate

All of the following must pass before a PR can be merged to `dev`:

- `npm run lint` — ESLint (zero warnings policy)
- `npm run type-check` — TypeScript strict mode, zero errors
- `npm test` — all unit and component tests
- `npm run build` — production build must succeed without warnings

---

## 10. CI/CD & Deployment

### 10.1 Environments

| Environment       | Branch                  | URL                | Purpose                                                                  |
| ----------------- | ----------------------- | ------------------ | ------------------------------------------------------------------------ |
| Local development | `feat/*`, `fix/*`, etc. | `localhost:8080`   | Active contributor development                                           |
| Staging           | `dev`                   | staging.colabs.dev | Integration testing — all PRs land here first                            |
| Production        | `main`                  | colabs.dev         | Stable released code — only receives release PRs from `dev` and hotfixes |

> **`dev` is the default GitHub branch.** All contributor PRs target `dev`. The `main` branch is protected and only updated by maintainers via a deliberate release PR (`dev → main`) or a hotfix.

### 10.2 Branching Strategy

```
main          ← production; protected; only receives release PRs from dev and hotfixes
 └── dev      ← staging; default branch; all contributor PRs target here
      └── feat/<name>     ← feature branches (branch from dev, merge into dev)
      └── fix/<name>      ← bug fix branches
      └── docs/<name>     ← documentation only
      └── chore/<name>    ← refactors, tooling, dependencies
      └── test/<name>     ← adding or updating tests

hotfix/<name> ← branches from main only; opens TWO PRs: one into main, one into dev
```

All branches must follow the convention: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`, `hotfix/`.

**Release cycle:** When `dev` is stable and ready to ship, a maintainer opens a release PR (`dev → main`) titled `chore(release): vX.Y.Z`. After merging, `main` is immediately synced back into `dev` to prevent drift.

### 10.3 CI Pipeline (GitHub Actions)

Runs on every push to any branch and on all PRs targeting `dev` or `main`:

```
1. Install dependencies          npm ci
2. Lint                          npm run lint
3. Type check                    npm run type-check
4. Run tests                     npm run test
5. Build                         npm run build
```

### 10.4 Deployment

| Resource                         | Tool                                           | Trigger             |
| -------------------------------- | ---------------------------------------------- | ------------------- |
| Frontend (staging)               | Lovable preview / Vercel preview               | Merge to `dev`      |
| Frontend (production)            | Lovable publish / Vercel                       | Merge to `main`     |
| Supabase migrations (staging)    | `supabase db push` via GitHub Actions          | Merge to `dev`      |
| Supabase migrations (production) | `supabase db push` via GitHub Actions          | Merge to `main`     |
| Edge Functions (staging)         | `supabase functions deploy` via GitHub Actions | Merge to `dev`      |
| Edge Functions (production)      | `supabase functions deploy` via GitHub Actions | Merge to `main`     |
| Edge Function secrets            | Supabase dashboard (manual)                    | When secrets rotate |

> **Secret rotation policy:** Edge function secrets (e.g., `GITHUB_CLIENT_SECRET`) must be rotated every 90 days or immediately following a suspected exposure. Rotation is documented in [SECURITY.md](./SECURITY.md).

---

## 11. Security & Privacy

### 11.1 Data Stored and Classification

| Data                   | Classification         | Storage                                    | Access                                        |
| ---------------------- | ---------------------- | ------------------------------------------ | --------------------------------------------- |
| Email address          | PII                    | Supabase Auth                              | User + service role only                      |
| GitHub access token    | Sensitive credential   | `github_integrations` (server-only column) | Edge functions only, never returned to client |
| Uploaded resume/CV     | PII document           | `resumes` bucket (private)                 | User + gig/project owner via signed URL       |
| Project logo           | Non-sensitive          | `project-logos` bucket (public)            | Public CDN                                    |
| Subscription plan data | Business-sensitive     | `user_subscriptions`                       | User + service role                           |
| Proposal content       | User-generated content | `proposals` table                          | User + project owner                          |

### 11.2 Data Retention

| Data Type                 | Retention Policy                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Uploaded resumes          | Retained while the user's account is active; deleted within 30 days of account deletion      |
| GitHub access tokens      | Deleted immediately when the user disconnects the GitHub integration                         |
| Claimed issues (resolved) | Retained indefinitely for contribution history                                               |
| Deleted gigs / proposals  | Soft-deleted (flagged `is_deleted = true`) for 90 days; then permanently removed by CRON job |
| Auth session tokens       | Managed by Supabase Auth; expire per Supabase default session policy                         |

### 11.3 Privacy Compliance Checklist

- [ ] Privacy policy page linked in the site footer
- [ ] Account deletion flow removes all user PII within 30 days
- [ ] Resume access uses time-limited signed URLs (not permanent public links)
- [ ] GitHub token exposure is prevented at the query level (column excluded from all `SELECT *` queries)
- [ ] `SECURITY.md` documents the responsible disclosure process for vulnerability reports

---

## 12. Roadmap

### ✅ v1.0 — Core Platform (Target: Q2 2026)

All items in Section 4 (4.1 – 4.11) plus:

- [ ] Replace all mock/hardcoded analytics data with live DB queries ← **blocks launch**
- [ ] Stripe payment integration
- [ ] `DATA_FLOW.md` documentation
- [ ] `SUBSCRIPTIONS.md` documentation
- [ ] CRON job for expired subscription cleanup

---

### 🔜 Phase 2 — Engagement & Monetisation (Target: Q3 2026)

| Feature                      | Priority | Description                                                           |
| ---------------------------- | -------- | --------------------------------------------------------------------- |
| Real-time notifications      | P1       | Supabase Realtime for issue updates, proposal responses, team invites |
| In-app messaging             | P1       | Direct messaging between project owners and contributors              |
| Payment processing           | P1       | Stripe integration for gig payments and milestone-based releases      |
| Contributor reputation score | P2       | Algorithm based on completed issues, accepted proposals, peer reviews |
| Gamification & badges        | P2       | Achievement system for contributions, streaks, mentoring              |
| Activity log table           | P2       | Persistent event log to power the analytics feed (replaces mock data) |
| Admin dashboard              | P2       | Internal tool for content moderation and abuse reporting              |
| E2E test suite               | P1       | Playwright coverage for all critical user journeys (see §9.4)         |

---

### 🔮 Phase 3 — Scale & Intelligence (Target: Q4 2026 – Q1 2027)

| Feature                     | Priority | Description                                                                 |
| --------------------------- | -------- | --------------------------------------------------------------------------- |
| AI-powered project matching | P2       | Recommend projects/gigs based on tech stack and contribution history        |
| Full-text search            | P1       | Search across projects, gigs, and issues with filters                       |
| Organisation billing        | P2       | Team subscription plans with per-seat pricing                               |
| Public REST/GraphQL API     | P3       | Third-party integrations and developer tooling                              |
| Code review integration     | P2       | PR tracking linked to claimed issues for end-to-end contribution visibility |
| React Native mobile app     | P3       | Companion app for notifications and issue tracking on mobile                |

---

## 13. Success Metrics

**Measurement baseline:** All metrics measured from the v1.0 public launch date.

| Metric                        | Target                         | Baseline    | Measurement Tool                             | Notes                                                     |
| ----------------------------- | ------------------------------ | ----------- | -------------------------------------------- | --------------------------------------------------------- |
| Monthly Active Users (MAU)    | 1,000+ by Month 6              | 0 at launch | Supabase Auth sessions                       | Defined as: authenticated user with ≥ 1 action in 30 days |
| Issues Claimed per Month      | 500+ by Month 3                | 0           | `claimed_issues` row count                   | Excludes test/seed data                                   |
| Gigs Posted per Month         | 50+ by Month 3                 | 0           | `gigs` insert count                          | Active gigs only                                          |
| Proposal Submission Rate      | > 20% of gig detail page views | —           | `proposals` count / gig page views           | Requires analytics tracking setup                         |
| GitHub Integrations Connected | 30% of registered users        | 0%          | `github_integrations` / `profiles` ratio     | —                                                         |
| Average Session Duration      | > 5 minutes                    | —           | PostHog / Plausible                          | Requires analytics tool integration                       |
| 30-day Contributor Retention  | > 40%                          | —           | Returning users with ≥ 1 claim action        | Requires cohort tracking                                  |
| Paid Conversion Rate          | > 5% of MAU                    | 0%          | `user_subscriptions` WHERE plan != 'starter' | Post-Stripe integration only                              |

> **Analytics tooling:** A privacy-respecting analytics tool (e.g., Plausible or PostHog self-hosted) should be integrated at launch to capture session duration and page-level metrics. This is a v1.0 dependency for the session duration and retention metrics above.

---

## 14. Definition of Done

A feature or requirement is considered **Done** when all of the following are true:

**Code quality:**

- [ ] All TypeScript types are explicit — no `any` types without a documented justification comment
- [ ] ESLint passes with zero warnings
- [ ] `tsc --noEmit` passes with zero errors

**Testing:**

- [ ] Unit tests written for any new utility functions or validation schemas
- [ ] Component tests written for any new forms or interactive components
- [ ] All existing tests continue to pass

**Design & UX:**

- [ ] Component renders correctly on mobile (320 px), tablet (768 px), and desktop (1440 px)
- [ ] Empty state, loading state, and error state are all handled
- [ ] No `Math.random()` or hardcoded mock data in production code paths
- [ ] Dark mode renders correctly

**Security:**

- [ ] Any new Supabase table has RLS policies defined and verified
- [ ] No secrets, tokens, or PII are logged to the browser console
- [ ] File uploads are validated for type and size

**Documentation:**

- [ ] If a new environment variable is required, it is added to `.env.example` with a comment
- [ ] If a new Supabase table is added, it is reflected in the Database Schema section of `README.md`
- [ ] If a new route is added, it is added to the Route Map in this PRD

**Review:**

- [ ] PR has been reviewed and approved by at least one other contributor
- [ ] All PR review comments have been resolved

---

## 15. Community & Contact

For questions about this PRD, feature discussions, or contributor onboarding, reach the team through any of the following channels:

| Channel               | Link                                                                          | Purpose                                                        |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 💬 Discord            | [discord.gg/UKjtBDDFHH](https://discord.gg/UKjtBDDFHH)                        | Primary community hub — questions, proposals, contributor chat |
| 🐛 GitHub Issues      | [colabs.v2/issues](https://github.com/SpaceyaTech/colabs.v2/issues)           | Bug reports, feature requests, and PRD change proposals        |
| 💡 GitHub Discussions | [colabs.v2/discussions](https://github.com/SpaceyaTech/colabs.v2/discussions) | Long-form design discussions and roadmap feedback              |
| 𝕏 X (Twitter)         | [@SpaceYaTech](https://x.com/SpaceYaTech)                                     | Announcements and release updates                              |
| 📸 Instagram          | [@SpaceYaTech](https://instagram.com/SpaceYaTech)                             | Community highlights and behind-the-scenes                     |
| 💼 LinkedIn           | [SpaceYaTech](https://linkedin.com/company/SpaceYaTech)                       | Professional updates and partnership enquiries                 |
| 🎵 TikTok             | [@SpaceYaTech](https://tiktok.com/@SpaceYaTech)                               | Short demos and community content                              |

> 🔒 To report a security vulnerability, follow the responsible disclosure process in [SECURITY.md](./SECURITY.md). Do not open a public GitHub issue for security matters.

---

## 16. Glossary

| Term                          | Definition                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gig**                       | A paid freelance job listing posted by a Project Owner in the marketplace                                                                                  |
| **Project**                   | A collaborative project (open-source or paid) posted for contributors to discover and join                                                                 |
| **Issue**                     | A GitHub issue fetched from a collaboration-enabled repository                                                                                             |
| **Claimed Issue**             | An issue a user has taken ownership of; tracked through `todo → in-progress → in-review → done`                                                            |
| **Proposal**                  | A formal application to work on a gig or project, including cover letter, milestones, and optional resume                                                  |
| **Integration**               | A connected GitHub account with synced repositories; separate from the authentication login                                                                |
| **Collaboration Request**     | A formal request from a developer to contribute to a specific repository, pending owner approval                                                           |
| **Organisation**              | A group entity on the platform with role-based membership (`owner → admin → member`)                                                                       |
| **Team**                      | A sub-group within the platform, used for project assignment and collaborative workspace                                                                   |
| **Project Owner**             | A user who posts projects and/or gigs and manages contributor workflows. Also referred to as "Seller" in marketplace contexts — these are the same persona |
| **Seller**                    | Marketplace-specific term for a Project Owner who has posted at least one gig. Avoid using this term outside the marketplace context                       |
| **Starter Plan**              | The free subscription tier; active by default for all users; `expires_at = NULL`                                                                           |
| **Feature Gating**            | Restricting access to a feature or route based on the user's subscription plan, enforced by `SubscriptionGuard` and `useSubscription()`                    |
| **RLS**                       | Row Level Security — PostgreSQL feature used to restrict data access at the database level based on the authenticated user                                 |
| **Security Definer Function** | A PostgreSQL function that runs with elevated privileges to safely evaluate role/membership checks without triggering recursive RLS policies               |
| **Edge Function**             | A serverless function deployed to Supabase's Deno runtime, used for all GitHub API communication and server-side logic                                     |
