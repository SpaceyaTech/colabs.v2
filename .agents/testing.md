# Testing agent — Colabs

You are writing or reviewing tests for Colabs. The testing strategy is defined in `docs/PRD.md` §9. This file covers what to test, how to test it, and the tools for each layer.

**Testing tools:**

- **Vitest** — unit tests and component tests
- **React Testing Library** — component rendering and interaction
- **MSW (Mock Service Worker)** — mock Supabase and API responses
- **Playwright** — end-to-end tests (Phase 2 target)

**Coverage targets:** 80% on `src/lib/` and `src/hooks/`

---

## Table of Contents

- [Setup](#setup)
- [What to test — priority order](#what-to-test--priority-order)
- [Unit tests — utilities and validators](#unit-tests--utilities-and-validators)
- [Unit tests — hooks](#unit-tests--hooks)
- [Component tests](#component-tests)
- [Integration tests with MSW](#integration-tests-with-msw)
- [Edge function tests](#edge-function-tests)
- [End-to-end tests — Playwright](#end-to-end-tests--playwright)
- [Test data and factories](#test-data-and-factories)
- [Security-focused tests](#security-focused-tests)
- [Testing checklist](#testing-checklist)
- [Anti-patterns](#anti-patterns)

---

## Setup

```bash
# Install testing dependencies
npm install --save-dev vitest @vitest/ui jsdom
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install --save-dev msw
npm install --save-dev @playwright/test   # Phase 2
```

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/hooks/**'],
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
});
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start MSW server before tests, reset handlers between tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## What to test — priority order

Start with the highest business impact. These tests prevent regressions in critical flows.

| Priority | What                                               | Why                                                        |
| -------- | -------------------------------------------------- | ---------------------------------------------------------- |
| P0       | Subscription gating logic (`useSubscription`)      | Determines what paid features users can access             |
| P0       | Zod validation schemas (`src/lib/validators.ts`)   | Gates all user input — a broken validator is a broken form |
| P0       | Auth redirect behaviour (`AuthGuard`)              | Broken auth gates expose protected pages                   |
| P1       | Form submission: gig creation, proposal submission | Core user actions                                          |
| P1       | React Query hooks against mocked Supabase          | Data fetching contracts                                    |
| P1       | Empty / loading / error states                     | UX consistency                                             |
| P2       | Utility functions (`src/lib/utils.ts`)             | Low complexity, fast to write                              |
| P2       | GitHub integration flow (MSW)                      | Complex multi-step flow                                    |
| P3       | E2E critical journeys (Playwright)                 | Phase 2 target                                             |

---

## Unit tests — utilities and validators

These are the easiest tests to write and have the highest ROI. Start here.

### File: `src/lib/__tests__/validators.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import the schemas from your validators file
import { createGigSchema, createProjectSchema, proposalSchema } from '../validators';

describe('createGigSchema', () => {
  it('accepts a valid gig', () => {
    const valid = {
      title: 'Build a React dashboard',
      description: 'We need a responsive analytics dashboard',
      budget_value: 3000,
      difficulty: 'intermediate',
      technologies: ['React', 'TypeScript'],
      duration: '2-4 weeks',
    };
    expect(createGigSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createGigSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined();
    }
  });

  it('rejects negative budget', () => {
    const result = createGigSchema.safeParse({ budget_value: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects unknown difficulty level', () => {
    const result = createGigSchema.safeParse({ difficulty: 'wizard' });
    expect(result.success).toBe(false);
  });

  it('rejects empty technologies array', () => {
    const result = createGigSchema.safeParse({ technologies: [] });
    expect(result.success).toBe(false);
  });
});
```

### File: `src/lib/__tests__/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatPostedAt, gigRowToExploreGig } from '../utils';

describe('formatPostedAt', () => {
  it("returns 'Just now' for timestamps within the last minute", () => {
    const now = new Date().toISOString();
    expect(formatPostedAt(now)).toBe('Just now');
  });

  it('formats hours correctly', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatPostedAt(threeHoursAgo)).toBe('3 hours ago');
  });

  it('formats days correctly', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatPostedAt(twoDaysAgo)).toBe('2 days ago');
  });
});

describe('gigRowToExploreGig', () => {
  it('maps database row to UI interface', () => {
    const row = {
      id: 'abc-123',
      title: 'Build a dashboard',
      company: 'Acme Corp',
      budget: '$3,000 - $5,000',
      budget_value: 3000,
      technologies: ['React', 'TypeScript'],
      difficulty: 'intermediate',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const result = gigRowToExploreGig(row as any);

    expect(result.id).toBe('abc-123');
    expect(result.title).toBe('Build a dashboard');
    expect(result.technologies).toEqual(['React', 'TypeScript']);
  });
});
```

---

## Unit tests — hooks

Hook tests use a `QueryClient` wrapper and MSW to mock Supabase responses.

### Shared test wrapper: `src/test/wrappers.tsx`

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },      // disable retries in tests
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}
```

### File: `src/hooks/__tests__/useGigs.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { createWrapper } from '@/test/wrappers';
import { useGigs } from '../useGigs';
import { mockGig } from '@/test/factories';

describe('useGigs', () => {
  it('returns active gigs on success', async () => {
    server.use(http.get('*/rest/v1/gigs*', () => HttpResponse.json([mockGig])));

    const { result } = renderHook(() => useGigs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].id).toBe(mockGig.id);
  });

  it('returns error state on failure', async () => {
    server.use(
      http.get('*/rest/v1/gigs*', () => HttpResponse.json({ message: 'DB error' }, { status: 500 }))
    );

    const { result } = renderHook(() => useGigs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('returns empty array when no gigs exist', async () => {
    server.use(http.get('*/rest/v1/gigs*', () => HttpResponse.json([])));

    const { result } = renderHook(() => useGigs(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
```

### File: `src/hooks/__tests__/useSubscription.test.ts`

This is a P0 test — the subscription logic gates paid features.

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { createWrapper } from '@/test/wrappers';
import { useSubscription } from '../useSubscription';

const mockSubscription = (plan: 'starter' | 'pro' | 'pro_plus', status = 'active') => ({
  id: 'sub-1',
  user_id: 'user-1',
  plan,
  status,
  expires_at: plan === 'starter' ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
});

describe('useSubscription', () => {
  it('starter plan — canCreateGig is false', async () => {
    server.use(
      http.get('*/rest/v1/user_subscriptions*', () =>
        HttpResponse.json([mockSubscription('starter')])
      )
    );

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isPro).toBe(false);
    expect(result.current.canCreateGig).toBe(false);
    expect(result.current.canCreateTeam).toBe(false);
  });

  it('pro plan — canCreateGig is true', async () => {
    server.use(
      http.get('*/rest/v1/user_subscriptions*', () => HttpResponse.json([mockSubscription('pro')]))
    );

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isPro).toBe(true);
    expect(result.current.canCreateGig).toBe(true);
  });

  it('expired pro plan — isExpired is true', async () => {
    const expired = {
      ...mockSubscription('pro'),
      expires_at: new Date(Date.now() - 1000).toISOString(), // 1 second ago
    };

    server.use(http.get('*/rest/v1/user_subscriptions*', () => HttpResponse.json([expired])));

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isExpired).toBe(true);
  });
});
```

---

## Component tests

### MSW server setup: `src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { defaultHandlers } from './handlers';

export const server = setupServer(...defaultHandlers);
```

### Default handlers: `src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';
import { mockGig, mockProject, mockUser } from '../factories';

export const defaultHandlers = [
  // Supabase REST API
  http.get('*/rest/v1/gigs*', () => HttpResponse.json([mockGig])),
  http.get('*/rest/v1/projects*', () => HttpResponse.json([mockProject])),

  // Supabase Auth
  http.get('*/auth/v1/user', () => HttpResponse.json({ user: mockUser })),
];
```

### File: `src/components/__tests__/GigCard.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { GigCard } from "../gigs/GigCard";
import { mockExploreGig } from "@/test/factories";

describe("GigCard", () => {
  it("renders title, company, and budget", () => {
    render(<GigCard gig={mockExploreGig} onSave={vi.fn()} />);

    expect(screen.getByText(mockExploreGig.title)).toBeInTheDocument();
    expect(screen.getByText(mockExploreGig.company)).toBeInTheDocument();
    expect(screen.getByText(mockExploreGig.budget)).toBeInTheDocument();
  });

  it("calls onSave with gig ID when save button is clicked", async () => {
    const onSave = vi.fn();
    render(<GigCard gig={mockExploreGig} onSave={onSave} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith(mockExploreGig.id);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("shows urgent badge when is_urgent is true", () => {
    render(<GigCard gig={{ ...mockExploreGig, isUrgent: true }} onSave={vi.fn()} />);
    expect(screen.getByText(/urgent/i)).toBeInTheDocument();
  });
});
```

### Testing the three states (loading, error, empty)

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { createWrapper } from "@/test/wrappers";
import { GigListPage } from "../../pages/Marketplace";

describe("Marketplace page states", () => {
  it("shows skeleton while loading", () => {
    // Don't resolve the handler — component stays in loading state
    server.use(http.get("*/rest/v1/gigs*", () => new Promise(() => {})));
    render(<GigListPage />, { wrapper: createWrapper() });
    expect(screen.getByTestId("gig-list-skeleton")).toBeInTheDocument();
  });

  it("shows empty state when no gigs exist", async () => {
    server.use(http.get("*/rest/v1/gigs*", () => HttpResponse.json([])));
    render(<GigListPage />, { wrapper: createWrapper() });
    await screen.findByText(/no active gigs/i);
  });

  it("shows error state on fetch failure", async () => {
    server.use(
      http.get("*/rest/v1/gigs*", () => HttpResponse.json({}, { status: 500 }))
    );
    render(<GigListPage />, { wrapper: createWrapper() });
    await screen.findByText(/something went wrong/i);
  });
});
```

### Testing SubscriptionGuard

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { createWrapper } from "@/test/wrappers";
import { SubscriptionGuard } from "../shared/SubscriptionGuard";

const Protected = () => <div>Protected content</div>;
const Upgrade = () => <div>Upgrade required</div>;

function renderGuard(plan: "starter" | "pro") {
  server.use(
    http.get("*/rest/v1/user_subscriptions*", () =>
      HttpResponse.json([{ plan, status: "active", expires_at: null }])
    )
  );
  return render(
    <SubscriptionGuard requiredPlan="pro" fallback={<Upgrade />}>
      <Protected />
    </SubscriptionGuard>,
    { wrapper: createWrapper() }
  );
}

describe("SubscriptionGuard", () => {
  it("renders children for pro users", async () => {
    renderGuard("pro");
    await screen.findByText("Protected content");
    expect(screen.queryByText("Upgrade required")).not.toBeInTheDocument();
  });

  it("renders fallback for starter users", async () => {
    renderGuard("starter");
    await screen.findByText("Upgrade required");
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });
});
```

---

## Integration tests with MSW

Integration tests verify the full hook → component data flow against realistic mocked responses.

### Testing the GitHub integration flow

```typescript
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { createWrapper } from '@/test/wrappers';
import { useGitHub } from '../hooks/useGitHub';

describe('useGitHub integration', () => {
  it('syncRepositories updates local state', async () => {
    const mockRepos = [{ id: 'repo-1', full_name: 'user/my-repo', allow_collaboration: false }];

    server.use(
      // Mock the edge function invocation
      http.post('*/functions/v1/github-repositories', () =>
        HttpResponse.json({ success: true, repositories: mockRepos })
      ),
      // Mock the DB query after sync
      http.get('*/rest/v1/github_repositories*', () => HttpResponse.json(mockRepos))
    );

    const { result } = renderHook(() => useGitHub(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.syncRepositories();
    });

    await waitFor(() => expect(result.current.repositories).toHaveLength(1));
    expect(result.current.repositories[0].full_name).toBe('user/my-repo');
  });
});
```

---

## Edge function tests

Extract pure business logic from Deno handlers into testable functions. The handler itself is tested via integration.

### File: `supabase/functions/github-issues/_lib/categorize.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
// Import logic extracted from the edge function
import { categorizeByLabel, prioritizeByLabel } from './categorize';

describe('categorizeByLabel', () => {
  it('categorises bug labels', () => {
    expect(categorizeByLabel(['bug', 'priority-high'])).toBe('bug');
  });

  it('categorises documentation labels', () => {
    expect(categorizeByLabel(['documentation'])).toBe('documentation');
    expect(categorizeByLabel(['docs'])).toBe('documentation');
  });

  it('defaults to feature for unknown labels', () => {
    expect(categorizeByLabel(['needs-discussion'])).toBe('feature');
    expect(categorizeByLabel([])).toBe('feature');
  });
});

describe('prioritizeByLabel', () => {
  it('marks critical labels as urgent', () => {
    expect(prioritizeByLabel(['critical'])).toBe('urgent');
    expect(prioritizeByLabel(['urgent'])).toBe('urgent');
  });

  it('defaults to medium priority', () => {
    expect(prioritizeByLabel(['good first issue'])).toBe('medium');
  });
});
```

---

## End-to-end tests — Playwright

**Phase 2 target.** These are the critical user journeys from `docs/PRD.md` §9.4.

### File structure

```
tests/
├── auth.spec.ts          # Sign-up, sign-in, sign-out
├── github-connect.spec.ts # GitHub integration OAuth flow
├── gig-creation.spec.ts  # Post a gig, view it, edit it
├── issue-claim.spec.ts   # Browse issues, claim, update status
├── proposal.spec.ts      # Submit a proposal with file upload
└── subscription.spec.ts  # Upgrade plan, feature gate enforcement
```

### Setup: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example: `tests/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up with email', async ({ page }) => {
    await page.goto('/sign-up');

    await page.fill('[name=email]', `test-${Date.now()}@example.com`);
    await page.fill('[name=password]', 'TestPassword123!');
    await page.click('[type=submit]');

    // Should redirect to dashboard after sign-up
    await expect(page).toHaveURL(/dashboard/);
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('[name=email]', 'notauser@example.com');
    await page.fill('[name=password]', 'wrongpassword');
    await page.click('[type=submit]');

    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL(/sign-in/); // stays on sign-in
  });

  test('AuthGuard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/sign-up/);
  });
});
```

### Example: `tests/subscription.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Subscription gating', () => {
  test('starter user sees upgrade prompt on gig creation', async ({ page }) => {
    // Use a pre-seeded starter account in the test environment
    await page.goto('/sign-in');
    await page.fill('[name=email]', process.env.TEST_STARTER_EMAIL!);
    await page.fill('[name=password]', process.env.TEST_PASSWORD!);
    await page.click('[type=submit]');

    await page.goto('/seller');
    await expect(page.getByText(/upgrade/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /post a gig/i })).not.toBeVisible();
  });
});
```

---

## Test data and factories

### File: `src/test/factories.ts`

Centralise all test fixtures here. Never scatter mock data across individual test files.

```typescript
import type { Database } from '@/integrations/supabase/types';

type GigRow = Database['public']['Tables']['gigs']['Row'];

export const mockGig: GigRow = {
  id: 'gig-test-1',
  creator_id: 'user-test-1',
  title: 'Build a React dashboard',
  company: 'Acme Corp',
  description: 'We need a responsive analytics dashboard',
  full_description: 'Full description here...',
  budget: '$3,000 - $5,000',
  budget_value: 3000,
  duration: '2-4 weeks',
  location: 'Remote',
  difficulty: 'intermediate',
  category: 'frontend',
  technologies: ['React', 'TypeScript'],
  requirements: ['3 years React experience'],
  deliverables: ['Source code', 'Documentation'],
  status: 'active',
  is_urgent: false,
  featured: false,
  proposals_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockExploreGig = {
  id: mockGig.id,
  title: mockGig.title,
  company: mockGig.company,
  budget: mockGig.budget,
  technologies: mockGig.technologies,
  difficulty: mockGig.difficulty,
  isUrgent: mockGig.is_urgent,
  isFeatured: mockGig.featured,
  postedAt: mockGig.created_at,
};

export const mockUser = {
  id: 'user-test-1',
  email: 'test@example.com',
  created_at: '2026-01-01T00:00:00Z',
};

export const mockProject = {
  id: 'project-test-1',
  creator_id: 'user-test-1',
  name: 'Open Source Dashboard',
  description: 'A community analytics dashboard',
  visibility: 'public',
  technologies: ['React', 'Supabase'],
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
};

// Factory function for overrides
export function createMockGig(overrides: Partial<GigRow> = {}): GigRow {
  return { ...mockGig, ...overrides };
}
```

---

## Security-focused tests

These tests specifically verify that security-sensitive behaviours work correctly.

### RLS — users cannot access other users' data

```typescript
it('useClaimedIssues only returns issues owned by the current user', async () => {
  // MSW returns issues for two different users
  server.use(
    http.get('*/rest/v1/claimed_issues*', () =>
      HttpResponse.json([
        { id: '1', user_id: 'user-current', title: 'Issue A' },
        { id: '2', user_id: 'user-other', title: 'Issue B' }, // another user's issue
      ])
    )
  );

  // The hook should only expose the current user's issues
  // (In production, RLS filters this at DB level — this test verifies the hook doesn't bypass it)
  const { result } = renderHook(() => useClaimedIssues(), { wrapper: createWrapper() });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  // This test documents the expected behaviour — it passes because RLS (mocked here)
  // only returns the current user's rows
  expect(result.current.claimedIssues.every(i => i.user_id === 'user-current')).toBe(true);
});
```

### Subscription — expired plan treated as starter

```typescript
it('expired Pro plan has isPro = false', async () => {
  server.use(
    http.get('*/rest/v1/user_subscriptions*', () =>
      HttpResponse.json([
        {
          plan: 'pro',
          status: 'active',
          expires_at: new Date(Date.now() - 1000).toISOString(), // 1 second ago
        },
      ])
    )
  );

  const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });
  await waitFor(() => !result.current.isLoading);

  expect(result.current.isExpired).toBe(true);
  expect(result.current.isPro).toBe(false);
  expect(result.current.canCreateGig).toBe(false);
});
```

### OAuth state validation

```typescript
it('handleOAuthCallback rejects mismatched state', async () => {
  sessionStorage.setItem('oauth_state', 'expected-state');

  const { result } = renderHook(() => useGitHub(), { wrapper: createWrapper() });

  await expect(result.current.handleOAuthCallback('some-code', 'wrong-state')).rejects.toThrow(
    /state mismatch/i
  );
});
```

---

## Testing checklist

Before marking a PR as ready for review:

- [ ] `npm run test` passes with zero failures
- [ ] `npm run test:coverage` shows ≥ 80% on `src/lib/` and `src/hooks/`
- [ ] New Zod schemas have tests for valid input and each invalid case
- [ ] New hooks have tests for success, error, and empty states
- [ ] New components that receive async data have loading/error/empty state tests
- [ ] SubscriptionGuard usage has tests for both starter and pro states
- [ ] No `console.error` suppression in tests — fix the actual warnings

---

## Anti-patterns

| Anti-pattern                                | Why                                        | Correct approach                                  |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| `wrapper: undefined` on hook tests          | React Query hooks fail without QueryClient | Always use `createWrapper()`                      |
| No MSW handler for a test's request         | `onUnhandledRequest: "error"` throws       | Add a handler in `server.use()` or `handlers.ts`  |
| `vi.mock("@/integrations/supabase/client")` | Mocks the wrong layer — harder to maintain | Use MSW to mock HTTP responses                    |
| Testing implementation details              | Breaks on refactors                        | Test behaviour from the user's perspective        |
| Sharing mutable state between tests         | Test pollution — order-dependent failures  | Use `afterEach(() => server.resetHandlers())`     |
| `waitFor` without an assertion              | Passes immediately — test is meaningless   | `await waitFor(() => expect(...).toBe(...))`      |
| Skipped tests with `it.skip`                | Untracked failures                         | Fix or delete — never skip and forget             |
| `as any` in test factories                  | Hides type errors in test data             | Use typed factory functions with `Database` types |
