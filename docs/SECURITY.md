# Security Policy

Colabs takes security seriously. This document describes our supported versions, how to report a vulnerability, what to expect after reporting, and the security measures currently in place.

---

## Supported Versions

| Version                  | Status                | Notes                                                                                 |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------- |
| 1.0.x _(in development)_ | ✅ Actively supported | Developed on the `dev` branch — all fixes applied here first before release to `main` |
| < 1.0.0                  | ❌ Unsupported        | Pre-release builds; no security patches                                               |

> As the project reaches stable releases, this table will be updated to reflect the current support window. We follow a **rolling support** model where only the latest stable minor version receives security patches.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is in place puts all users at risk.

### How to report

We offer two private reporting channels:

**Option A — GitHub Private Security Advisory (preferred)**

Use GitHub's built-in private reporting:
[Report a vulnerability](https://github.com/SpaceyaTech/colabs.v2/security/advisories/new)

This is the preferred method — it keeps everything in one place, allows us to draft a fix and coordinate disclosure in private, and automatically creates a CVE if needed.

**Option B — Email**

Send details to **[security@colabs.dev](mailto:security@colabs.dev)**

Use the subject line: `[SECURITY] Brief description of the issue`

> 💬 For general security questions or hardening suggestions that are **not** vulnerabilities, you are welcome to open a GitHub Discussion or ask in the [`#security`](https://discord.gg/UKjtBDDFHH) channel on Discord.

---

### What to include in your report

A good vulnerability report helps us reproduce and fix the issue faster. Please include as much of the following as you can:

- **Description** — what is the vulnerability and where does it exist?
- **Steps to reproduce** — a minimal, reliable proof of concept
- **Affected components** — specific routes, edge functions, tables, or APIs
- **Potential impact** — what could an attacker achieve by exploiting this?
- **Suggested fix** — optional, but always appreciated
- **Your contact details** — so we can follow up and credit you (or note if you prefer to stay anonymous)

---

### What to expect

We commit to the following response timeline from the moment your report is received:

| Timeframe           | Action                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Within 24 hours** | Acknowledgement confirming we have received your report                                                                               |
| **Within 72 hours** | Initial triage — severity classification (Critical / High / Medium / Low) and scope confirmation                                      |
| **Within 7 days**   | Status update including a remediation plan or a request for clarification                                                             |
| **Within 30 days**  | Target resolution for Critical and High severity issues                                                                               |
| **Upon resolution** | Coordinated disclosure — we will notify you before publishing a fix and credit you in the release notes (unless you prefer anonymity) |

We will keep you informed at every stage. If we need more time for a complex fix, we will communicate that proactively rather than going silent.

---

## Responsible Disclosure Guidelines

We follow a coordinated disclosure model. In return for your good faith, we commit to acting swiftly and transparently.

**Please DO:**

- Give us reasonable time to investigate and fix the issue before public disclosure (we ask for 30 days for Critical/High issues)
- Make a good faith effort to avoid privacy violations, data destruction, or service disruption
- Limit testing to your own accounts and test data only
- Report promptly — even incomplete information is better than none

**Please DO NOT:**

- Access, modify, exfiltrate, or delete data belonging to other users
- Perform or simulate denial-of-service attacks
- Use social engineering against team members or users
- Run automated scanning tools against the production environment without prior coordination
- Disclose the vulnerability publicly while we are actively working on a fix

---

## Scope

### In scope

These are areas we actively want to receive reports for:

| Area                                         | Examples                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Authentication & session management**      | JWT handling, OAuth flows, session fixation, token leakage                                                |
| **Row Level Security (RLS) bypass**          | Policies that can be circumvented to access another user's data                                           |
| **Edge function vulnerabilities**            | Logic flaws, injection, unvalidated input in `supabase/functions/`                                        |
| **Cross-site scripting (XSS)**               | Reflected or stored XSS in any application route                                                          |
| **Insecure direct object references (IDOR)** | Accessing another user's proposals, resumes, claimed issues, etc.                                         |
| **File upload validation bypass**            | Uploading disallowed file types or oversized files                                                        |
| **Token or secret exposure**                 | GitHub access tokens or other credentials appearing client-side                                           |
| **API abuse / rate limiting**                | Endpoints that can be abused to cause harm or bypass feature limits                                       |
| **Payment & subscription logic**             | Exploiting the subscription system to unlock paid features without payment (Stripe integration — planned) |
| **Content Security Policy (CSP) bypass**     | Circumventing the CSP headers configured for production                                                   |

### Out of scope

| Area                                                             | Notes                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Vulnerabilities in third-party dependencies                      | Please report these directly to the upstream maintainer                 |
| Issues in Supabase's own infrastructure                          | Report to [Supabase Security](https://supabase.com/security)            |
| Social engineering attacks against team members                  | Out of scope for a technical security policy                            |
| Physical security                                                | Not applicable                                                          |
| Denial-of-service attacks                                        | Out of scope unless they exploit a specific application vulnerability   |
| Findings from automated scanners with no proof of exploitability | We are happy to discuss, but cannot prioritise non-reproducible reports |

---

## Current Security Measures

The following protections are currently implemented in the codebase:

| Measure                              | Details                                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Row Level Security**               | All 15 Supabase tables have RLS policies enabled — no table is exposed without a policy                                                                                         |
| **GitHub token protection**          | Access tokens stored in `github_integrations` are excluded from all client-accessible queries via column-level RLS filtering; tokens are never returned to the browser          |
| **Security definer functions**       | `has_role()`, `is_team_member()`, and `get_user_org_role()` run with elevated privileges to safely evaluate membership checks without triggering recursive RLS evaluation       |
| **File upload validation**           | MIME type allowlists and maximum size limits enforced for project logos (JPEG/PNG/WebP/GIF, ≤ 2 MB) and resumes (PDF/DOC/DOCX, ≤ 10 MB); filenames are sanitised before storage |
| **Edge function error sanitisation** | Edge functions return structured error envelopes without internal stack traces or system details                                                                                |
| **CORS configuration**               | Edge functions only permit requests from the application origin                                                                                                                 |
| **No secrets in client-side code**   | All secrets (e.g., `GITHUB_CLIENT_SECRET`) are stored exclusively as Supabase Edge Function secrets, never in `.env` variables prefixed `VITE_`                                 |
| **Content Security Policy (CSP)**    | CSP headers are configured for the production deployment to mitigate XSS risk                                                                                                   |
| **Secret rotation policy**           | Edge function secrets must be rotated every 90 days or immediately following a suspected exposure                                                                               |

---

## Security Updates

Security patches are documented in [CHANGELOG.md](./CHANGELOG.md) under the **Security** section. We recommend subscribing to [GitHub repository releases](https://github.com/SpaceyaTech/colabs.v2/releases) to be notified of security fixes as they are published.

---

## Attribution — Hall of Thanks

We gratefully acknowledge security researchers who help keep Colabs safe. With your permission, we will list your name or handle here after a vulnerability has been resolved and disclosed.

| Researcher                                | Vulnerability | Date |
| ----------------------------------------- | ------------- | ---- |
| _Be the first — your name could be here!_ | —             | —    |

---

## Related Documents

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [README](./README.md)
- [GitHub Security Advisories](https://github.com/SpaceyaTech/colabs.v2/security/advisories)
