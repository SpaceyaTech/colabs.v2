# Contributing to Colabs

Thank you for your interest in contributing to Colabs! Whether you're fixing a bug, improving documentation, suggesting a feature, or helping triage issues — every contribution matters.

Before you start, please read our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## Table of Contents

- [Types of Contributions](#types-of-contributions)
- [First-Time Contributors](#first-time-contributors)
- [Reporting a Bug](#reporting-a-bug)
- [Requesting a Feature](#requesting-a-feature)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Standards](#code-standards)
- [Review Process](#review-process)
- [Questions & Community](#questions--community)

---

## Types of Contributions

Not all contributions are code. Here is what we welcome:

| Type | Examples |
|---|---|
| 🐛 **Bug fixes** | Fix a broken query, a UI glitch, a broken redirect |
| ✨ **Features** | Implement a planned feature from the [PRD](./PRD.md) |
| 📝 **Documentation** | Improve README, fix typos, expand code comments, add JSDoc |
| 🧪 **Tests** | Add unit tests, component tests, or integration tests |
| 🎨 **Design / UX** | Improve accessibility, responsiveness, or visual consistency |
| 🔒 **Security** | Harden RLS policies, fix token handling, improve input validation |
| 🌐 **Performance** | Reduce bundle size, improve query efficiency, add lazy loading |
| 🗃️ **Database** | Add or improve migrations, RLS policies, or seed data |
| 💡 **Ideas & Feedback** | Open a GitHub Discussion or join our [Discord](https://discord.gg/UKjtBDDFHH) |

---

## First-Time Contributors

New to open source or new to Colabs? Welcome — we're glad you're here.

**Recommended starting points:**

1. Browse issues labelled [`good first issue`](https://github.com/SpaceyaTech/colabs.v2/issues?q=is%3Aopen+label%3A%22good+first+issue%22) — these are scoped, well-documented, and beginner-friendly
2. Browse issues labelled [`help wanted`](https://github.com/SpaceyaTech/colabs.v2/issues?q=is%3Aopen+label%3A%22help+wanted%22) — these are higher priority and a bit more involved
3. Fix a typo or improve a doc — documentation PRs are always welcome and a great way to learn the codebase
4. Join the [Discord server](https://discord.gg/UKjtBDDFHH) and introduce yourself in the `#contributors` channel — the team can point you to where help is most needed

> ✋ **Claiming an issue:** Leave a comment on the issue you'd like to work on before starting. This avoids duplicate work and lets maintainers give you any relevant context upfront. Issues are not formally assigned, but a comment signals intent.

---

## Reporting a Bug

Found something broken? Please open a bug report.

1. **Check first** — search [existing issues](https://github.com/SpaceyaTech/colabs.v2/issues) to make sure it hasn't already been reported
2. **Open a new issue** using the [Bug Report template](https://github.com/SpaceyaTech/colabs.v2/issues/new?template=bug_report.md)
3. Include: steps to reproduce, expected behaviour, actual behaviour, screenshots if applicable, and your environment (browser, OS)

> 🔒 If the bug involves a **security vulnerability**, do **not** open a public issue. Follow the [Security Policy](./SECURITY.md) instead.

---

## Requesting a Feature

Have an idea that would make Colabs better?

1. **Check the roadmap** — review the [PRD](./PRD.md) to see if it's already planned
2. **Check existing discussions** — search [GitHub Discussions](https://github.com/SpaceyaTech/colabs.v2/discussions) for similar ideas
3. If it's new, open a [Feature Request](https://github.com/SpaceyaTech/colabs.v2/issues/new?template=feature_request.md) or start a Discussion thread
4. For large proposals (new sections, major architecture changes), open a Discussion first — it's easier to align before writing code

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 18+ | Use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| [npm](https://www.npmjs.com) | 9+ | Comes with Node.js |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | latest | `npm install -g supabase` |
| A [Supabase](https://supabase.com) account | — | Free tier is sufficient |
| A [GitHub OAuth App](https://github.com/settings/developers) | — | Two apps needed — see README |

### Setup steps

**1. Fork and clone**

Click **Fork** on the repository page, then:

```bash
git clone git@github.com:YOUR_USERNAME/colabs.v2.git
cd colabs.v2

# dev is the default branch — confirm you're on it
git checkout dev

# Add the upstream remote so you can sync with the main repo
git remote add upstream git@github.com:SpaceyaTech/colabs.v2.git
git fetch upstream
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in your values. Full reference in the [README — Environment Variables](./README.md#-environment-variables-reference).

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GITHUB_CLIENT_ID=your-github-oauth-app-client-id
VITE_APP_URL=http://localhost:5173
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

**4. Set up Supabase**

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

**5. Deploy edge functions**

```bash
npx supabase functions deploy github-oauth
npx supabase functions deploy github-repositories
npx supabase functions deploy github-issues
npx supabase functions deploy github-project-data
```

**6. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For the full setup guide including GitHub OAuth configuration, see [README — Getting Started](./README.md#-getting-started).

---

## Branching Strategy

We use a **two-branch integration model** with short-lived feature branches. This keeps production stable while allowing continuous contribution.

### Branch overview

```
main          ← production (colabs.dev) — protected; never pushed to directly
 └── dev      ← staging (staging.colabs.dev) — default branch; all PRs target here
      └── feat/<name>    ← short-lived; branch from dev, merge back into dev
      └── fix/<name>
      └── docs/<name>
      └── chore/<name>
      └── test/<name>

hotfix/<name> ← branches from main only; merges into BOTH main and dev
```

### Branch reference

| Branch | Environment | Purpose | Receives PRs from |
|---|---|---|---|
| `main` | Production (`colabs.dev`) | Stable, released code only | `dev` (release PRs) and `hotfix/*` only |
| `dev` | Staging (`staging.colabs.dev`) | Integration — all contributions land here first | All feature, fix, docs, chore, test branches |
| `feat/<short-name>` | Local / preview | New features | — |
| `fix/<short-name>` | Local / preview | Bug fixes | — |
| `docs/<short-name>` | Local / preview | Documentation only | — |
| `chore/<short-name>` | Local / preview | Refactors, tooling, dependencies | — |
| `test/<short-name>` | Local / preview | Adding or updating tests | — |
| `hotfix/<short-name>` | Local / preview | Urgent production fixes only | — |

> ⚙️ **`dev` is the default GitHub branch.** When you fork and open a pull request, GitHub will automatically target `dev`. Do not change the base branch to `main` unless you are a maintainer opening a release PR.

### How the flow works

**For contributors — everyday workflow:**

```
1. Branch off dev          git checkout dev && git pull origin dev
                           git checkout -b feat/your-feature

2. Do your work            (commits, commits, commits)

3. Sync before PR          git pull --rebase origin dev

4. Open PR → dev           Your feature is reviewed, merged into dev
                           CI runs, staging environment is updated automatically
```

**For maintainers — releasing to production:**

```
1. Confirm dev is stable   All CI checks pass on dev; staging looks good

2. Open a release PR       dev → main
                           Title: "chore(release): vX.Y.Z"
                           Body: summary of changes since last release

3. Merge via Merge Commit  (not squash — preserves the full history from dev)

4. Tag the release         git tag -a vX.Y.Z -m "Release vX.Y.Z"
                           git push origin vX.Y.Z

5. Sync dev with main      git checkout dev && git merge main && git push origin dev
                           (keeps branches in sync — do this immediately after every release)
```

**For urgent production fixes — hotfix workflow:**

```
1. Branch from main        git checkout main && git pull origin main
                           git checkout -b hotfix/brief-description

2. Fix and test            Apply the minimal fix needed

3. Open TWO PRs:
   - hotfix/* → main       (production fix)
   - hotfix/* → dev        (keeps dev in sync — never skip this step)
```

### Rules

- **Always branch from `dev`** for normal work — never from `main`
- Keep branches focused — one feature or fix per branch
- Delete your branch after it is merged
- Never push directly to `dev` or `main`
- Keep branch names lowercase and hyphen-separated
- Never let `dev` and `main` drift apart — maintainers sync them after every release
- Database migrations land on `dev` first and are tested against the staging Supabase project before any release to `main`

### Branch name examples

```
feat/org-dashboard
fix/file-upload-validation
docs/update-contributing-guide
chore/upgrade-supabase-js
test/add-proposal-form-tests
hotfix/token-exposure
```

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) for a clean, parseable history and automatic changelog generation.

### Format

```
<type>(<scope>): <short description>

[optional body — explain the why, not the what]

[optional footer — issue references, breaking changes]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature or user-facing functionality |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace — no logic changes |
| `refactor` | Code restructuring without behaviour change |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, CI tooling |
| `security` | Security patches or hardening |

### Scopes

Use the module name as the scope:

`auth` · `github` · `gigs` · `projects` · `issues` · `teams` · `orgs` · `proposals` · `subscriptions` · `ui` · `db` · `edge-fn` · `docs` · `ci`

### Examples

```
feat(gigs): add featured gigs carousel to marketplace
fix(github): restrict integration query to safe columns only
docs(contributing): fix dead link to SETUP.md
security(uploads): validate MIME type and size on project logos
chore(deps): upgrade @supabase/supabase-js to v2.51
refactor(dashboard): extract analytics tab into dedicated component
test(proposals): add Zod schema validation unit tests
```

### Rules

- Use **imperative mood** in the subject line: "add" not "added" or "adds"
- Keep the subject line under **72 characters**
- Use the body to explain **why** a change was made, not what (the diff shows the what)
- Reference issue numbers in the footer: `Closes #42` or `Refs #42`
- Mark breaking changes in the footer: `BREAKING CHANGE: <description>`

---

## Pull Request Guidelines

### Before opening a PR

Run through this checklist **before** requesting review:

- [ ] Branch is up to date with `dev` (`git pull --rebase origin dev`)
- [ ] PR is targeting `dev` — not `main` (check the base branch before opening)
- [ ] Production build succeeds (`npm run build`)
- [ ] Linting passes with zero warnings (`npm run lint`)
- [ ] TypeScript type-check passes (`npm run type-check`)
- [ ] No `Math.random()` or hardcoded mock data added to production code paths
- [ ] Any new Supabase table has an RLS policy defined
- [ ] New components use design system tokens — no hardcoded colour values
- [ ] No secrets, tokens, or API keys are committed
- [ ] `.env.example` is updated if a new environment variable was added
- [ ] The Route Map in `PRD.md` is updated if a new route was added

### PR title

Follow commit convention format exactly:

```
feat(projects): add collaboration request flow
fix(auth): redirect to /sign-up on expired session
docs(readme): add architecture diagram to overview
```

### PR description template

```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Key change 1
- Key change 2

## Screenshots
<!-- If UI changes are included, add before/after screenshots here -->

## Testing
Steps to verify the changes manually:
1. Step one
2. Step two

- [ ] Tested on desktop (1440px)
- [ ] Tested on tablet (768px)
- [ ] Tested on mobile (375px)
- [ ] Dark mode tested

## Related Issues
Closes #XX
```

### PR size guidelines

Keep pull requests small and focused. Large PRs are harder to review and slower to merge.

| Size | Lines Changed | Target Review Time |
|---|---|---|
| 🟢 Small | < 100 | < 30 minutes |
| 🟡 Medium | 100 – 300 | 30 – 60 minutes |
| 🔴 Large | 300+ | Split into smaller PRs if possible |

If a feature genuinely requires 300+ lines, break it into a series of stacked PRs — for example, one for the data model, one for the hooks, and one for the UI.

---

## Code Standards

### TypeScript

- **Strict mode** is enabled — no `any` types without a documented comment explaining why
- Use `interface` for object shapes; use `type` for unions, intersections, and aliases
- Prefer **named exports** over default exports
- All component props must have explicit TypeScript interfaces

```ts
// ✅ Good
interface GigCardProps {
  gig: Gig;
  onSave: (id: string) => void;
}

// ❌ Avoid
const GigCard = (props: any) => { ... }
```

### React

- **Functional components only** — no class components
- Custom hooks live in `src/hooks/` and are prefixed with `use` (e.g., `useGigs`, `useClaimedIssues`)
- Keep components under **200 lines**; extract sub-components when a component grows beyond that
- Use **TanStack React Query** for all server state — no `useEffect` + `useState` for data fetching
- Use **React Hook Form + Zod** for all forms — no uncontrolled inputs

```ts
// ✅ Good — server state via React Query
const { data: gigs, isLoading } = useQuery({ queryKey: ['gigs'], queryFn: fetchGigs });

// ❌ Avoid — manual data fetching
const [gigs, setGigs] = useState([]);
useEffect(() => { fetchGigs().then(setGigs); }, []);
```

### Styling

- **Always** use Tailwind semantic tokens defined in `index.css` and `tailwind.config.ts`
- **Never** hardcode raw colour values in components (e.g., avoid `text-white`, `bg-blue-500`, `#fff`)
- Use **shadcn/ui** component variants instead of writing custom CSS
- All design token values are defined as HSL CSS custom properties

```tsx
// ✅ Good — semantic token
<div className="bg-background text-foreground border-border">

// ❌ Avoid — hardcoded colour
<div className="bg-white text-gray-900 border-gray-200">
```

### Database & Supabase

- Any new Supabase table **must** have RLS policies defined and verified before the PR is opened
- Never use `SELECT *` in production queries — always select explicit columns
- GitHub access tokens and other sensitive columns must be excluded from all client-accessible queries
- No `Math.random()` in any production render path — use stable data sources only (see PRD §4.9)

### File organisation

```
src/
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui primitives (do not edit manually)
│   ├── layout/            # AppLayout, TopNavLayout, BottomNav
│   ├── dashboard/         # Dashboard-specific components
│   ├── gigs/              # Gig marketplace components
│   ├── projects/          # Project card, detail, form components
│   ├── issues/            # Issue list, claim panel, filters
│   ├── teams/             # Team creation, workspace, member list
│   ├── organizations/     # Org dashboard, member management
│   └── shared/            # Globally shared components (modals, badges, etc.)
├── hooks/                 # TanStack Query hooks (data fetching & mutations)
├── pages/                 # Route-level page components
├── integrations/
│   └── supabase/          # Auto-generated Supabase types (do not edit manually)
├── lib/                   # Utility functions, Supabase client, validators
├── types/                 # TypeScript interfaces and type definitions
└── assets/                # Static images and icons
```

---

## Review Process

1. **Author** opens a PR, completes the description template, and requests review from at least one maintainer
2. **Reviewer** checks code quality, design system compliance, security, and test coverage
3. Feedback is addressed via **additional commits** — do not force-push while a review is in progress
4. Once all comments are resolved and the PR is approved, the **author** merges via **Squash and Merge**
5. The branch is deleted after merge

### Reviewer checklist

Reviewers use this checklist when evaluating a PR:

- [ ] Code follows TypeScript strict mode — no `any` without justification
- [ ] UI uses semantic design tokens — no raw colours
- [ ] No secrets, tokens, or API keys appear in the diff
- [ ] Edge cases, error states, and loading states are all handled
- [ ] Component is responsive across mobile (375px), tablet (768px), and desktop (1440px)
- [ ] Dark mode renders correctly
- [ ] Accessibility: semantic HTML, alt text, keyboard navigability
- [ ] Any new Supabase tables have RLS policies in the migration
- [ ] No `Math.random()` or hardcoded mock data in production paths

---

## Questions & Community

Stuck? Not sure where to start? We'd love to help.

| Channel | Link | Purpose |
|---|---|---|
| 💬 Discord | [discord.gg/UKjtBDDFHH](https://discord.gg/UKjtBDDFHH) | Real-time help, contributor introductions, team chat |
| 💡 GitHub Discussions | [colabs.v2/discussions](https://github.com/SpaceyaTech/colabs.v2/discussions) | Feature ideas, architecture questions, long-form proposals |
| 🐛 GitHub Issues | [colabs.v2/issues](https://github.com/SpaceyaTech/colabs.v2/issues) | Bug reports and tracked feature requests |
| 𝕏 X | [@SpaceYaTech](https://x.com/SpaceYaTech) | Announcements and release updates |

For security issues, see [SECURITY.md](./SECURITY.md). Do not open public issues for vulnerabilities.