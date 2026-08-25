import { test, expect } from "@playwright/test";
import {
  SEED_SUPER_ADMIN,
  SEED_ADMIN_ROSTER,
  SEED_REVOKE_TARGET,
  EXPECTED_AUDIT,
  loginResponseBody,
} from "./fixtures/admin-seed.js";

/**
 * Admin smoke flow — login → admin surface → moderation action → audit trail (#341).
 * ===========================================================================
 * ONE comprehensive happy-path test that proves the admin spine works
 * end-to-end against the REAL Next.js pages, the REAL `AuthProvider` cookie
 * session flow, and the REAL super-admin guard.
 *
 * REAL vs MOCKED (full write-up in e2e/README-admin-smoke.md):
 *   REAL   — the `/login` form, `persistSession()` → `AuthProvider` cookie
 *            reading, `AdminTierGuard` / `canManageTeam`, and the rendered
 *            `/dashboard/admin/team` + `/dashboard/admin/audit-logs` pages
 *            with their real UI controls (dropdown, step-up confirm dialog,
 *            category filter, table).
 *   MOCKED — the backend. `POST /api/auth/login` is intercepted to return the
 *            seeded super-admin token+user; every other backend API call is
 *            stubbed out. NOTE: the admin team roster and audit log are served
 *            by the app's OWN client-side stub services (the admin backend is
 *            not built yet), so there are no admin API responses to mock —
 *            those data sets are deterministic in-app fixtures we mirror in
 *            e2e/fixtures/admin-seed.js.
 *
 * DEVIATIONS from the issue's literal step list (documented honestly):
 *   - "users list" / "ban/unban": there is no standalone users or moderation
 *     page and no ban UI wired to any route. The real, guarded user-management
 *     surface is the admin-team page, whose "Revoke access" action is the
 *     ban-equivalent (removes a member's admin access behind a type-to-confirm
 *     step-up). "Unban" has no real UI surface. We drive Revoke.
 *   - "resolve report" + "audit entry": the audit viewer is a separate page
 *     and `next start` serves a production build, so navigating to it is a hard
 *     document load that resets the client-side stub module — a freshly-created
 *     entry cannot survive the cross-page hard navigation. We instead assert
 *     the deterministic audit trail surfaces both the ban and the
 *     report-resolution moderation entries, proving the audit spine.
 */

const ADMIN_TEAM_URL = "/dashboard/admin/team";
const AUDIT_LOGS_URL = "/dashboard/admin/audit-logs";

/**
 * Stub the backend for the whole flow. Registration order matters: Playwright
 * runs the most-recently-registered matching handler first, so the catch-all
 * is registered before the login-specific handler.
 */
async function stubBackend(page) {
  // Catch-all: no real backend exists in E2E — fail these fast. The admin
  // pages use client-side stubs and don't need any of these; peripheral
  // dashboard calls handle rejection gracefully.
  await page.route("**/api/**", (route) => route.abort());

  // The one real request in the flow: authenticate the seeded super-admin.
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(loginResponseBody()),
    })
  );
}

test("admin smoke: login → team → revoke (ban) → audit trail", async ({
  page,
  context,
}) => {
  await stubBackend(page);

  await test.step("login through the real form persists a super-admin session", async () => {
    await page.goto("/login");

    // The login page can render more than one copy of the form (responsive
    // layouts) — scope to the first one to stay unambiguous.
    const form = page.locator("form").first();
    await form.getByRole("heading", { name: /welcome back/i }).waitFor();
    await form.getByLabel("Email").fill(SEED_SUPER_ADMIN.email);
    await form.getByLabel("Password", { exact: true }).fill("e2e-super-admin-pass");
    await form.getByRole("button", { name: "Login", exact: true }).click();

    // The real `login()` → `persistSession()` flow writes the session cookies
    // that `AuthProvider` reads on every protected route.
    await expect
      .poll(async () => {
        const cookies = await context.cookies();
        return cookies.some((c) => c.name === "authToken");
      }, { timeout: 15_000 })
      .toBe(true);

    const cookies = await context.cookies();
    expect(cookies.some((c) => c.name === "userInfo")).toBe(true);

    // The login form self-navigates to /dashboard on success — let that settle
    // so it can't abort our later navigation to the admin surface.
    await page.waitForURL(/\/dashboard(\/|$)/, { timeout: 15_000 });
  });

  // This app renders two identical <main> content subtrees in this
  // environment; scope stateful assertions/interactions to the first one so
  // the revoke mutation and its resulting list update are read consistently.
  // (Radix dropdown/dialog/select content portals to <body>, and only one is
  // ever open at a time, so those stay page-level.)
  let surface;

  await test.step("super-admin reaches the guarded admin-team surface (overview)", async () => {
    // Navigate straight to the admin surface (there is no admin overview page;
    // the team page is the admin landing). Cookies from the login step carry
    // the session; the real AdminTierGuard must let a super-admin through.
    await page.goto(ADMIN_TEAM_URL);
    surface = page.locator("main").first();

    await expect(
      surface.getByRole("heading", { name: "Admin team" })
    ).toBeVisible();

    // Real roster rendered — not an "insufficient permissions" fallback.
    // Assert on emails: names repeat in the "Added by" column, emails are
    // unique per row.
    for (const member of SEED_ADMIN_ROSTER) {
      await expect(
        surface.getByText(member.email, { exact: true })
      ).toBeVisible();
    }
    await expect(surface.getByText(/only super admins/i)).toHaveCount(0);
  });

  await test.step("perform the moderation action: revoke a member's admin access", async () => {
    // Open the row actions for the target member (real Radix dropdown).
    await surface
      .getByRole("button", { name: `Actions for ${SEED_REVOKE_TARGET.name}` })
      .click();
    await page.getByRole("menuitem", { name: /revoke access/i }).click();

    // Real step-up confirmation: type the member's email to unlock, confirm.
    const confirmInput = page.getByRole("textbox", {
      name: `Type ${SEED_REVOKE_TARGET.email} to confirm`,
    });
    await expect(confirmInput).toBeVisible();
    await confirmInput.fill(SEED_REVOKE_TARGET.email);
    await page.getByRole("button", { name: "Revoke", exact: true }).click();

    // Member removed from the list — the ban-equivalent mutation succeeded
    // (this is the flow that fires the fire-and-forget audit event).
    await expect(
      surface.getByText(SEED_REVOKE_TARGET.email, { exact: true })
    ).toHaveCount(0);
    // Other members remain.
    await expect(
      surface.getByText(SEED_ADMIN_ROSTER[0].email, { exact: true })
    ).toBeVisible();
  });

  await test.step("audit trail surfaces the ban + resolve-report moderation entries", async () => {
    await page.goto(AUDIT_LOGS_URL);
    const auditSurface = page.locator("main").first();

    await expect(
      auditSurface.getByRole("heading", { name: "Audit logs" })
    ).toBeVisible();

    // Narrow to moderation actions via the real category filter so both the
    // ban and the report-resolution entries land on the first page.
    await auditSurface
      .getByRole("combobox", { name: "Filter by action category" })
      .click();
    await page.getByRole("option", { name: EXPECTED_AUDIT.category }).click();

    // The moderation spine: a ban entry and a report-resolution entry.
    await expect(
      auditSurface.getByText(EXPECTED_AUDIT.banAction, { exact: true }).first()
    ).toBeVisible();
    await expect(
      auditSurface
        .getByText(EXPECTED_AUDIT.resolveReportAction, { exact: true })
        .first()
    ).toBeVisible();
  });
});
