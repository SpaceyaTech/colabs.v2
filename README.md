<div align="center">

<img src="./public/logo.png" alt="Colabs Logo" width="88" height="88" />

# Colabs

**Open-source collaboration meets freelance opportunity.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/CONTRIBUTING.md)
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

[Live Demo](https://sytcolabs.vercel.app/) · [Report a Bug](https://github.com/SpaceyaTech/colabs.v2/issues/new?template=bug_report.md) · [Request a Feature](https://github.com/SpaceyaTech/colabs.v2/issues/new?template=feature_request.md) · [Product Roadmap](./docs/PRD.md)

<br />

> 🚧 **Status: Active Development** — v1.0 in progress. Core features are implemented; contributions are welcome.

</div>

---

## 📚 Documentation Hub

For full technical details, setup instructions, and architecture, visit our [Documentation Hub](./docs/README.md).

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Local Setup & Pre-requisites](./docs/SETUP.md)
- [API & Edge Functions](./docs/EDGE_FUNCTIONS.md)
- [Product Roadmap (PRD)](./docs/PRD.md)

---

## 🌐 What is Colabs?

Developers today juggle fragmented workflows — discovering open-source projects on GitHub, finding freelance gigs on Upwork, and managing teams on Slack. **Colabs unifies all of this into one platform.**

Colabs connects developers with open-source projects, freelance gigs, and collaborative teams. It bridges GitHub-based open-source contribution with a structured freelance marketplace — enabling developers to discover projects, claim issues, submit proposals, and earn, all from a single dashboard backed by their real GitHub activity.

### Who is it for?

| Persona                     | What they get                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Developer / Contributor** | Discover projects and gigs matching their skills, claim GitHub issues, track progress, and build a verifiable contribution profile         |
| **Project Owner**           | Post open-source or paid projects, manage collaboration requests, review proposals, and hire contributors with proven GitHub track records |
| **Team Lead**               | Create teams, invite members by email, assign projects, and manage a shared team workspace                                                 |
| **Organisation Admin**      | Manage organisations with role-based access control, configure integrations, and oversee contributor activity at scale                     |

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

| Layer                 | Technology                                                                                      | Version  |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| Framework             | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)                       | 18 / 5.x |
| Build Tool            | [Vite](https://vitejs.dev)                                                                      | 8        |
| Styling               | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix primitives) | 4.x      |
| Routing               | [React Router DOM](https://reactrouter.com)                                                     | v6       |
| Data Fetching / State | [TanStack React Query](https://tanstack.com/query)                                              | v5       |
| Backend               | [Supabase](https://supabase.com) — Auth, PostgreSQL, Edge Functions, Storage                    | latest   |
| Forms                 | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)                         | —        |
| Animation             | [Framer Motion](https://www.framer.com/motion/)                                                 | —        |
| Charts                | [Recharts](https://recharts.org)                                                                | —        |
| Drag & Drop           | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)                                        | —        |

---

## 🚀 Quick Start

For detailed instructions, including Supabase and environment setup, please read our **[Full Setup Guide](./docs/SETUP.md)**.

```bash
# 1. Fork & Clone
git clone git@github.com:YOUR_USERNAME/colabs.v2.git
cd colabs.v2

# 2. Install Dependencies
npm install

# 3. Start Development Server
npm run dev
```

_(You must configure Supabase and GitHub OAuth before the app will fully function. See [Setup Guide](./docs/SETUP.md).)_

---

## 🤝 Contributing

Colabs is an open-source project and contributions of all kinds are welcome — from bug fixes and documentation improvements to new features and design enhancements.

Before starting, please read our:

- [Code of Conduct](./docs/CODE_OF_CONDUCT.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

---

## 💬 Community & Support

We'd love to have you in the community — whether you're contributing code, sharing feedback, or just following along.

| Channel               | Link                                                                          | Purpose                                                        |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 💬 Discord            | [discord.gg/UKjtBDDFHH](https://discord.gg/UKjtBDDFHH)                        | Real-time chat — ask questions, share ideas, meet contributors |
| 🐛 GitHub Issues      | [colabs.v2/issues](https://github.com/SpaceyaTech/colabs.v2/issues)           | Bug reports and feature requests                               |
| 💡 GitHub Discussions | [colabs.v2/discussions](https://github.com/SpaceyaTech/colabs.v2/discussions) | Long-form questions, proposals, and community conversation     |
| 𝕏 X (Twitter)         | [@SpaceYaTech](https://x.com/SpaceYaTech)                                     | Announcements, updates, and release notes                      |
| 📸 Instagram          | [@SpaceYaTech](https://instagram.com/SpaceYaTech)                             | Behind-the-scenes and community highlights                     |
| 💼 LinkedIn           | [SpaceYaTech](https://linkedin.com/company/SpaceYaTech)                       | Professional updates and milestones                            |
| 🎵 TikTok             | [@SpaceYaTech](https://tiktok.com/@SpaceYaTech)                               | Short-form demos and community content                         |

> 🔒 If you find a **security vulnerability**, please do **not** open a public issue. Follow the responsible disclosure process documented in [SECURITY.md](./docs/SECURITY.md).

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

## Contributors ✨

Thanks goes to these wonderful people

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jumalaw98"><img src="https://avatars.githubusercontent.com/jumalaw98?v=4?s=60" width="60px;" alt="Lawrence Juma"/><br /><sub><b>Lawrence Juma</b></sub></a><br /><a href="#infra-jumalaw98" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/SpaceyaTech/colabs.v2/commits?author=jumalaw98" title="Code">💻</a> <a href="https://github.com/SpaceyaTech/colabs.v2/commits?author=jumalaw98" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

---

<div align="center">

Made with ❤️ by the Colabs community · Powered by [SpaceYaTech](https://x.com/SpaceYaTech)

[Discord](https://discord.gg/UKjtBDDFHH) · [X](https://x.com/SpaceYaTech) · [Instagram](https://instagram.com/SpaceYaTech) · [LinkedIn](https://linkedin.com/company/SpaceYaTech) · [TikTok](https://tiktok.com/@SpaceYaTech)

</div>

[⬆ Back to top](#colabs)
