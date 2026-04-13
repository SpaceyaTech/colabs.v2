# Colabs Documentation Hub

Welcome to the Colabs project documentation. This directory contains comprehensive technical and process documentation for the platform. For a brief overview and quick start, see the main [README.md](../README.md).

## Table of Contents

| Document                                      | Description                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| [Architecture](./ARCHITECTURE.md)             | Project structure, components, hooks, pages, and design system            |
| [Database](./DATABASE.md)                     | Supabase tables, RLS policies, and database functions                     |
| [GitHub Integration](./GITHUB_INTEGRATION.md) | OAuth flow, edge functions, repository sync, and issue fetching           |
| [Data Fetching](./DATA_FETCHING.md)           | Hooks, React Query patterns, and API layer                                |
| [Data Flow](./DATA_FLOW.md)                   | End-to-end data flow, mock vs live audit, and migration plan              |
| [Edge Functions](./EDGE_FUNCTIONS.md)         | Supabase edge function reference                                          |
| [PRD](./PRD.md)                               | Product Requirements Document — features, users, roadmap, and metrics     |
| [Changelog](./CHANGELOG.md)                   | Version history, feature releases, and security patches                   |
| [Contributing](./CONTRIBUTING.md)             | PR guidelines, commit conventions, and branching strategy                 |
| [Code of Conduct](./CODE_OF_CONDUCT.md)       | Community guidelines and enforcement policy                               |
| [Security](./SECURITY.md)                     | Vulnerability disclosure policy and responsible reporting                 |
| [Subscriptions](./SUBSCRIPTIONS.md)           | Pricing tiers, subscription lifecycle, auto-demotion, and feature gating  |
| [Stripe Integration](./STRIPE_INTEGRATION.md) | Stripe payment setup, webhook handling, checkout flow, and TODO checklist |
| [Setup & Configuration](./SETUP.md)           | Local development setup, environment variables, Supabase CLI              |

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | React 18 + TypeScript                        |
| Build Tool   | Vite 5                                       |
| Styling      | Tailwind CSS + shadcn/ui                     |
| Routing      | React Router DOM v6                          |
| State / Data | TanStack React Query v5                      |
| Backend      | Supabase (Auth, DB, Edge Functions, Storage) |
| Animation    | Framer Motion                                |
| Forms        | React Hook Form + Zod                        |
| Charts       | Recharts                                     |
