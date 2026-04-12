# Database

Colabs uses **Supabase** (PostgreSQL) with Row Level Security (RLS) enabled on all tables. This document covers the full schema, security model, and the workflow for making database changes safely.

---

## Table of Contents

- [Schema Overview](#schema-overview)
- [Tables](#tables)
- [Database Functions](#database-functions)
- [Storage Buckets](#storage-buckets)
- [RLS Patterns](#rls-patterns)
- [How to Add a Migration](#how-to-add-a-migration)
- [How to Add a New Table](#how-to-add-a-new-table)
- [When NOT to Add a New Table](#when-not-to-add-a-new-table)

---

## Schema Overview

| Table                    | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `profiles`               | User profile data linked to Supabase Auth      |
| `gigs`                   | Freelance job listings in the marketplace      |
| `projects`               | Open-source and paid collaborative projects    |
| `proposals`              | Contributor applications to gigs/projects      |
| `proposal_milestones`    | Milestone breakdowns within a proposal         |
| `claimed_issues`         | Issues a user has claimed from GitHub          |
| `github_integrations`    | Connected GitHub accounts per user             |
| `github_repositories`    | Synced repos from connected GitHub accounts    |
| `teams`                  | Platform teams                                 |
| `team_members`           | Membership records per team                    |
| `team_projects`          | Projects assigned to a team                    |
| `organizations`          | Organisations with role-based membership       |
| `organization_members`   | Member records with roles (owner/admin/member) |
| `user_subscriptions`     | Subscription plan and expiry per user          |
| `saved_jobs`             | Bookmarked projects/gigs per user              |
| `collaboration_requests` | Requests to collaborate on a repository        |

RLS is enabled on every table. A table with no policies returns zero rows to all users.

---

## Tables

### `gigs`

Freelance gig listings posted by project owners.

| Column             | Type      | Notes                                  |
| ------------------ | --------- | -------------------------------------- |
| `id`               | uuid (PK) | Auto-generated                         |
| `creator_id`       | uuid      | References `auth.users(id)`            |
| `title`            | text      | Required                               |
| `company`          | text      | Company name                           |
| `description`      | text      | Short description (card view)          |
| `full_description` | text      | Detailed description                   |
| `budget`           | text      | Display string, e.g. "$3,000 – $5,000" |
| `budget_value`     | integer   | Numeric value for sorting              |
| `duration`         | text      | e.g. "2–4 weeks"                       |
| `location`         | text      | Default: "Remote"                      |
| `difficulty`       | text      | Entry level / Intermediate / Expert    |
| `category`         | text      | Nullable                               |
| `technologies`     | text[]    | Tech stack tags                        |
| `requirements`     | text[]    | Job requirements                       |
| `deliverables`     | text[]    | Expected deliverables                  |
| `status`           | text      | active / paused / closed               |
| `is_urgent`        | boolean   | Urgent flag                            |
| `featured`         | boolean   | Featured listing                       |
| `proposals_count`  | integer   | Counter                                |

**RLS policies:**

- `Anyone can view active gigs` — SELECT where `status = 'active'`
- `Creators can manage their own gigs` — ALL where `auth.uid() = creator_id`

---

### `projects`

Collaborative projects posted by users.

| Column             | Type      | Notes                            |
| ------------------ | --------- | -------------------------------- |
| `id`               | uuid (PK) | Auto-generated                   |
| `creator_id`       | uuid      | References `auth.users(id)`      |
| `name`             | text      | Project name                     |
| `description`      | text      | Project description              |
| `project_type`     | text      | Type of project                  |
| `visibility`       | text      | public / unlisted / private      |
| `technologies`     | text[]    | Tech stack                       |
| `team_size`        | text      | e.g. "1–3"                       |
| `experience_level` | text      | beginner / intermediate / expert |
| `duration`         | text      | Estimated duration               |
| `is_paid`          | boolean   | Paid collaboration flag          |
| `status`           | text      | active / completed / archived    |

**RLS policies:**

- Public and unlisted projects are visible to all authenticated users
- Creators have full CRUD on their own projects
- Separate policies for INSERT, UPDATE, and DELETE

---

### `github_integrations`

Stores GitHub OAuth tokens and user info. **The `access_token` column is excluded from all client-accessible queries.**

| Column            | Type      | Notes                                 |
| ----------------- | --------- | ------------------------------------- |
| `id`              | uuid (PK) | Auto-generated                        |
| `user_id`         | uuid      | Supabase user ID                      |
| `github_user_id`  | integer   | GitHub user ID                        |
| `github_username` | text      | GitHub login                          |
| `access_token`    | text      | OAuth access token — server-side only |
| `avatar_url`      | text      | GitHub avatar URL                     |
| `is_active`       | boolean   | Integration status                    |

**RLS:** Users can only read their own integration record. The SELECT policy explicitly excludes the `access_token` column — it is only accessible via Edge Functions using the service role key.

---

### `github_repositories`

Synced GitHub repositories with per-repo collaboration settings.

| Column                | Type      | Notes                         |
| --------------------- | --------- | ----------------------------- |
| `id`                  | uuid (PK) | Auto-generated                |
| `integration_id`      | uuid      | FK → `github_integrations.id` |
| `github_repo_id`      | integer   | GitHub repo ID                |
| `full_name`           | text      | `owner/repo`                  |
| `allow_collaboration` | boolean   | Opt-in for issue visibility   |
| `language`            | text      | Primary language              |
| `stars_count`         | integer   | Star count                    |
| `visibility`          | text      | public / private              |

**RLS:**

- Public, collaboration-enabled repos are visible to all authenticated users
- Users can manage repos linked to their own integration

---

### `claimed_issues`

Issues claimed by users from GitHub repositories.

| Column           | Type      | Notes                                 |
| ---------------- | --------- | ------------------------------------- |
| `id`             | uuid (PK) | Auto-generated                        |
| `user_id`        | uuid      | Who claimed it                        |
| `issue_id`       | text      | Composite ID (`repo-number`)          |
| `title`          | text      | Issue title                           |
| `status`         | text      | todo / in-progress / in-review / done |
| `repo_full_name` | text      | `owner/repo`                          |
| `html_url`       | text      | Link to original GitHub issue         |

**RLS:** Users can only access their own claimed issues.

---

### `user_subscriptions`

Subscription plan and expiry per user. See [SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md) for the full subscription lifecycle, auto-demotion logic, and feature gating patterns.

| Column         | Type        | Notes                                |
| -------------- | ----------- | ------------------------------------ |
| `id`           | uuid (PK)   | Auto-generated                       |
| `user_id`      | uuid        | One row per user (UNIQUE constraint) |
| `plan`         | text        | starter / pro / pro_plus             |
| `status`       | text        | active / expired / cancelled         |
| `started_at`   | timestamptz | When the current plan period started |
| `expires_at`   | timestamptz | NULL for Starter (never expires)     |
| `cancelled_at` | timestamptz | Set when user cancels                |

---

### Other Tables

| Table                    | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `organizations`          | Organisation profiles                      |
| `organization_members`   | Membership with roles (owner/admin/member) |
| `teams`                  | Team groupings                             |
| `team_members`           | Team membership                            |
| `team_projects`          | Projects assigned to teams                 |
| `proposals`              | Job proposals from applicants              |
| `proposal_milestones`    | Milestone-based payment structure          |
| `saved_jobs`             | Bookmarked projects                        |
| `collaboration_requests` | Requests to join repositories              |

---

## Database Functions

All role-check functions use `SECURITY DEFINER` to bypass RLS and prevent recursive policy evaluation. Never replace these with inline subqueries in RLS policies — doing so causes infinite recursion.

| Function                        | Signature                     | Purpose                                                         |
| ------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `get_user_org_role`             | `(uuid, uuid) → text`         | Returns a user's role within an organisation                    |
| `is_organization_member`        | `(uuid, uuid) → boolean`      | Checks if a user is a member of an organisation                 |
| `is_team_member`                | `(uuid, uuid) → boolean`      | Checks if a user is a member of a team (includes team creators) |
| `update_updated_at_column`      | trigger function              | Automatically sets `updated_at` on row updates                  |
| `check_and_demote_subscription` | `(uuid) → user_subscriptions` | Checks expiry and demotes a paid plan to Starter if expired     |

---

## Storage Buckets

| Bucket          | Public          | Contents            | Allowed types        | Max size |
| --------------- | --------------- | ------------------- | -------------------- | -------- |
| `project-logos` | Yes             | Project logo images | JPEG, PNG, WebP, GIF | 2 MB     |
| `resumes`       | No (owner only) | Proposal CVs        | PDF, DOC, DOCX       | 10 MB    |

File names are sanitized before storage. MIME type and extension undergo client-side sanitization and strict server-side validation. Invalid files are rejected with a user-facing error before upload begins.

---

## RLS Patterns

Four patterns cover almost every table in the database. Use these as templates when writing policies for new tables.

### Pattern 1 — Owner-only

The user can only access rows they created. Used by `gigs`, `projects`, `claimed_issues`.

```sql
-- SELECT
CREATE POLICY "Users can view own rows"
  ON public.table_name FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create own rows"
  ON public.table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE / DELETE
CREATE POLICY "Users can manage own rows"
  ON public.table_name FOR ALL
  USING (auth.uid() = user_id);
```

### Pattern 2 — Public read, owner write

Public rows are visible to everyone, but only the creator can modify them. Used by public `projects` and collaboration-enabled `github_repositories`.

```sql
CREATE POLICY "Public rows are visible to all"
  ON public.table_name FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Creators can manage their rows"
  ON public.table_name FOR ALL
  USING (auth.uid() = creator_id);
```

### Pattern 3 — Membership-based access

Access is granted to members of a team or organisation. Uses the security definer functions.

```sql
CREATE POLICY "Team members can view team rows"
  ON public.table_name FOR SELECT
  USING (is_team_member(auth.uid(), team_id));
```

### Pattern 4 — Role-based write access

Only specific roles within an organisation can perform writes.

```sql
CREATE POLICY "Org admins can update org rows"
  ON public.table_name FOR UPDATE
  USING (
    get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin')
  );
```

---

## How to Add a Migration

Migrations are timestamped SQL files in `supabase/migrations/`. Once pushed to a Supabase project, they cannot be edited — only new migrations can be added.

### Step 1: Create the migration file

```bash
npx supabase migration new your_migration_name
```

This creates `supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql`.

### Step 2: Write the SQL

```sql
-- Example: adding a column
ALTER TABLE public.gigs
  ADD COLUMN application_deadline TIMESTAMPTZ;
```

Follow these rules:

- Use `IF NOT EXISTS` / `IF EXISTS` guards where appropriate
- Never drop columns in the same migration that adds data — use separate migrations
- Always add RLS policies in the same migration as the table creation
- Use `SECURITY DEFINER` + `SET search_path = public` on any new security functions

### Step 3: Test locally

```bash
npx supabase db reset    # Apply all migrations to a fresh local DB
```

### Step 4: Regenerate TypeScript types

```bash
npx supabase gen types typescript \
  --project-id your-project-ref \
  > src/integrations/supabase/types.ts
```

Commit the updated `types.ts` in the same PR as the migration.

### Step 5: Push to Supabase

```bash
npx supabase db push
```

---

## How to Add a New Table

Use this checklist for every new table:

- [ ] Create a migration file with `npx supabase migration new`
- [ ] Define the table with a UUID primary key (`DEFAULT gen_random_uuid()`)
- [ ] Add `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- [ ] Add `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` with an `update_updated_at_column` trigger
- [ ] Add `ENABLE ROW LEVEL SECURITY` in the same migration
- [ ] Add at least one RLS policy in the same migration (use a Pattern from above)
- [ ] Add the table to the schema table in [DATABASE.md](./DATABASE.md#schema-overview) (this file)
- [ ] Run type generation and commit `types.ts`
- [ ] If the table stores sensitive data (tokens, payment info), add column-level exclusions to SELECT policies

---

## When NOT to Add a New Table

Adding a table is often the wrong solution. Before creating one, ask:

**Can this be modelled as a column on an existing table?**
If the data belongs to a single entity and won't grow independently, add a column instead of a table.

**Is this a many-to-many relationship that already has a join table?**
Check if an existing join table (`team_members`, `organization_members`, `team_projects`) can be extended.

**Is this analytics/derived data?**
Derived data (contribution counts, tech stack aggregations) should be computed by views or functions first. Only create a dedicated table when query performance requires denormalization.

**Is this temporary/cached data?**
Edge functions can cache GitHub API responses in existing tables. Avoid creating new tables purely for caching.
