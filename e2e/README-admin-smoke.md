# Admin smoke E2E (#341)

A single, comprehensive **happy-path** Playwright test that proves the admin
spine works end-to-end: **login → guarded admin surface → moderation action →
audit trail**.

- Spec: [`e2e/admin-smoke.spec.js`](./admin-smoke.spec.js)
- Deterministic fixtures/seed: [`e2e/fixtures/admin-seed.js`](./fixtures/admin-seed.js)

## The happy path covered

1. **Login** — drives the real `/login` form. `POST /api/auth/login` is
   intercepted to return the seeded super-admin `{ token, user }`; the app's own
   `login()` → `persistSession()` then writes the `authToken` + `userInfo`
   cookies. The test asserts those cookies were persisted (the real
   `AuthProvider` session flow).
2. **Admin surface (overview)** — navigates to `/dashboard/admin/team`, the
   admin landing surface, and asserts the real super-admin guard
   (`AdminTierGuard` / `canManageTeam`) lets the seeded super-admin through and
   the real roster renders (not the "insufficient permissions" fallback).
3. **Moderation action (ban-equivalent)** — opens the row actions dropdown for a
   seeded member, chooses **Revoke access**, satisfies the real type-to-confirm
   **step-up dialog** (typing the member's email), and confirms. The member's
   row disappears — the mutation that fires the fire-and-forget audit event.
4. **Audit trail** — navigates to `/dashboard/admin/audit-logs`, filters by the
   **moderation** category using the real filter control, and asserts the trail
   surfaces both a **ban** entry (`moderation.user_banned`) and a
   **report-resolution** entry (`moderation.report_dismissed`).

## What is REAL vs MOCKED

**REAL (exercised for real):**

- The Next.js pages: `/login`, `/dashboard/admin/team`,
  `/dashboard/admin/audit-logs` (served by `next start`, a production build).
- The auth session flow: `persistSession()` + `AuthProvider` reading the
  `authToken` / `userInfo` cookies and deriving `user`.
- The authorization guard: `AdminTierGuard` → `canManageTeam` (super-admin
  tiering in `lib/auth/admin-tiers.js`).
- The rendered UI controls: login form, actions dropdown, the step-up
  confirmation dialog, the audit category filter, and the tables.

**MOCKED / SEEDED:**

- `POST /api/auth/login` is intercepted (Playwright `page.route`) and returns
  the seeded super-admin token+user. There is **no real auth server** — the
  token is a fixed seed string.
- Every other `**/api/**` call is stubbed out (aborted).
- The seeded session user lives in `e2e/fixtures/admin-seed.js`
  (`SEED_SUPER_ADMIN`, `SEED_AUTH_TOKEN`), deterministic (fixed ids, no
  randomness).

**Important reality — no `/api/admin/*` to mock.** The admin backend is not
built yet, so the admin **team roster** (`lib/actions/admin-team.js`
`listAdmins()`) and the **audit log** (`lib/actions/admin-audit.js`) are served
by the app's **own client-side stub services**, not the network. The fixtures
file mirrors the relevant values from those stubs so the spec asserts against
named fixtures. When the backend lands and those services switch to
`axiosInstance` calls, the same flow can be re-pointed at `page.route`-mocked
`/api/admin/*` responses.

## Deviations from the issue's literal step list

- **"users list" / "ban/unban":** there is no standalone users page, no
  moderation/reports page, and no ban UI wired to any route (`banUser` in
  `lib/actions/admin-users.js` is unused by any page). The real, guarded
  user-management surface is the **admin-team** page, whose **Revoke access**
  action is the ban-equivalent (removes a member's admin access behind a
  step-up confirmation). **Unban** has no real UI surface, so it is not driven.
- **Fresh audit entry after the action:** `next start` serves a production
  build, so moving from the team page to the audit-logs page is a hard document
  load that resets the client-side stub module — a just-created entry cannot
  survive that cross-page hard navigation. The test therefore asserts the
  deterministic audit trail already surfaces the **ban** and **report-resolution**
  moderation entries, which proves the audit viewer spine.

## Failure artifacts

`playwright.config.js` sets `trace: "retain-on-failure"` and
`screenshot: "only-on-failure"` (global; harmless to the other specs). On a
failing run, the trace + screenshot are written under `test-results/`.

## How to run

Local (Playwright's `webServer` starts `next start -p 3123` automatically):

```bash
# build once (production build is what the webServer serves)
NEXT_PUBLIC_API_URL=https://api.example.com \
NEXT_PUBLIC_STELLAR_NETWORK=testnet \
npm run build

# run the admin smoke spec headless
npm run test:e2e:admin
# or: npx playwright test e2e/admin-smoke.spec.js --reporter=list
```

If Chromium is missing: `npx playwright install chromium`.

**CI note:** this repo's CI is **Lint-and-Build only** — Playwright is not run
in CI. This spec is the local "working demo (test output)" proof and is run via
`npm run test:e2e:admin` after `npm run build`.
