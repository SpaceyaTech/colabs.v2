# Database Schema

The backend uses **Supabase** (PostgreSQL) with Row Level Security (RLS) enabled on all tables.

## Tables

### `gigs`

Freelance gig/job listings posted by sellers.

| Column             | Type      | Notes                                    |
| ------------------ | --------- | ---------------------------------------- |
| `id`               | uuid (PK) | Auto-generated                           |
| `creator_id`       | uuid      | References `auth.users(id)`              |
| `title`            | text      | Required                                 |
| `company`          | text      | Company name                             |
| `description`      | text      | Short description (card view)            |
| `full_description` | text      | Detailed description                     |
| `budget`           | text      | Display string (e.g., "$3,000 - $5,000") |
| `budget_value`     | integer   | Numeric value for sorting                |
| `duration`         | text      | E.g., "2-4 weeks"                        |
| `location`         | text      | Default: "Remote"                        |
| `difficulty`       | text      | Entry level / Intermediate / Expert      |
| `category`         | text      | Nullable                                 |
| `technologies`     | text[]    | Tech stack tags                          |
| `requirements`     | text[]    | Job requirements                         |
| `deliverables`     | text[]    | Expected deliverables                    |
| `status`           | text      | active / paused / closed                 |
| `is_urgent`        | boolean   | Urgent flag                              |
| `featured`         | boolean   | Featured listing                         |
| `proposals_count`  | integer   | Counter                                  |

**RLS Policies:**

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
| `team_size`        | text      | E.g., "1-3"                      |
| `experience_level` | text      | beginner / intermediate / expert |
| `duration`         | text      | Estimated duration               |
| `is_paid`          | boolean   | Paid collaboration flag          |
| `status`           | text      | active / completed / archived    |

**RLS Policies:**

- Public/unlisted projects visible to all
- Creators can CRUD their own projects
- Separate policies for insert, update, delete

---

### `github_integrations`

Stores GitHub OAuth tokens and user info.

| Column            | Type      | Notes              |
| ----------------- | --------- | ------------------ |
| `id`              | uuid (PK) | Auto-generated     |
| `user_id`         | uuid      | Supabase user ID   |
| `github_user_id`  | integer   | GitHub user ID     |
| `github_username` | text      | GitHub login       |
| `access_token`    | text      | OAuth access token |
| `avatar_url`      | text      | GitHub avatar      |
| `is_active`       | boolean   | Integration status |

**RLS:** Users can only access their own integration record.

---

### `github_repositories`

Synced GitHub repositories with collaboration settings.

| Column                | Type      | Notes                         |
| --------------------- | --------- | ----------------------------- |
| `id`                  | uuid (PK) | Auto-generated                |
| `integration_id`      | uuid      | FK → `github_integrations.id` |
| `github_repo_id`      | integer   | GitHub repo ID                |
| `full_name`           | text      | `owner/repo`                  |
| `allow_collaboration` | boolean   | Opt-in for issues             |
| `language`            | text      | Primary language              |
| `stars_count`         | integer   | Star count                    |
| `visibility`          | text      | public / private              |

**RLS:**

- Public collaboration-enabled repos visible to all
- Users manage repos from their own integration

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
| `html_url`       | text      | Link to GitHub issue                  |

**RLS:** Users can only access their own claimed issues.

---

### Other Tables

| Table                       | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `organizations`             | Organization profiles                      |
| `organization_members`      | Membership with roles (owner/admin/member) |
| `organization_integrations` | Third-party integrations for orgs          |
| `organization_workflows`    | Automation workflows                       |
| `teams`                     | Team groupings                             |
| `team_members`              | Team membership                            |
| `team_projects`             | Projects assigned to teams                 |
| `proposals`                 | Job proposals from applicants              |
| `proposal_milestones`       | Milestone-based payment structure          |
| `saved_jobs`                | Bookmarked projects                        |
| `collaboration_requests`    | Requests to join repositories              |

## Database Functions

| Function                             | Purpose                                         |
| ------------------------------------ | ----------------------------------------------- |
| `get_user_org_role(uuid, uuid)`      | Returns user's role in an organization          |
| `is_organization_member(uuid, uuid)` | Checks org membership                           |
| `is_team_member(uuid, uuid)`         | Checks team membership (includes team creators) |
| `update_updated_at_column()`         | Trigger function for `updated_at` timestamps    |

All role-check functions use `SECURITY DEFINER` to bypass RLS and prevent recursive policy evaluation.

## Storage Buckets

| Bucket          | Public | Purpose                 |
| --------------- | ------ | ----------------------- |
| `resumes`       | No     | Proposal resume uploads |
| `project-logos` | Yes    | Project logo images     |
