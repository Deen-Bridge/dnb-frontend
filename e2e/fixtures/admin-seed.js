/**
 * Deterministic seed / fixtures for the admin smoke E2E (#341).
 * ===========================================================================
 * Everything here is fixed — no randomness, no `Date.now()` — so the smoke
 * flow is reproducible run to run and in CI.
 *
 * WHAT IS SEEDED HERE vs WHAT THE APP PROVIDES
 * --------------------------------------------
 *   - `SEED_SUPER_ADMIN` + `SEED_AUTH_TOKEN`: the logged-in session. This is
 *     the only piece we truly inject — it is returned from the intercepted
 *     `POST /api/auth/login` so the real `persistSession()` / `AuthProvider`
 *     cookie flow treats us as a signed-in super-admin.
 *   - `SEED_ADMIN_ROSTER` / `EXPECTED_AUDIT`: these MIRROR the values the app's
 *     own client-side stub services already return
 *     (`lib/actions/admin-team.js` `listAdmins()` and
 *     `lib/actions/admin-audit.js`). The admin backend is not built yet, so the
 *     team roster and audit trail are deterministic in-app fixtures rather than
 *     network responses. We copy the relevant values here so the spec asserts
 *     against named fixtures instead of magic strings. See
 *     `e2e/README-admin-smoke.md` for the full mocked-vs-real breakdown.
 */

/** Fixed bearer token returned by the mocked login endpoint. */
export const SEED_AUTH_TOKEN = "seed-e2e-super-admin-token-341";

/**
 * The seeded super-admin session user. Shape must satisfy the admin guard:
 * `canManageTeam(user)` requires `role` → "admin" AND `tier` → "super_admin"
 * (see `lib/auth/admin-tiers.js` / `lib/auth/roles.js`). The whole object is
 * JSON-stringified into the `userInfo` cookie by `persistSession()`.
 */
export const SEED_SUPER_ADMIN = Object.freeze({
  id: "e2e-super-admin-001",
  _id: "e2e-super-admin-001",
  name: "Test SuperAdmin",
  email: "superadmin@e2e.deenbridge.test",
  role: "admin",
  tier: "super_admin",
});

/**
 * A non-super-admin seed user, kept for documentation/negative reasoning — the
 * guard must reject this shape. Not currently driven by the happy path.
 */
export const SEED_STAFF_ADMIN = Object.freeze({
  id: "e2e-staff-admin-001",
  _id: "e2e-staff-admin-001",
  name: "Test StaffAdmin",
  email: "staff@e2e.deenbridge.test",
  role: "admin",
  tier: "staff",
});

/**
 * The admin-team roster the app renders. Mirrors `listAdmins()` in
 * `lib/actions/admin-team.js`. Ids/tiers are stable in that stub.
 */
export const SEED_ADMIN_ROSTER = Object.freeze([
  Object.freeze({ id: "admin-001", name: "Amina Yusuf", email: "amina@deenbridge.org", tier: "super_admin" }),
  Object.freeze({ id: "admin-002", name: "Bilal Karim", email: "bilal@deenbridge.org", tier: "staff" }),
  Object.freeze({ id: "admin-003", name: "Zaynab Idris", email: "zaynab@deenbridge.org", tier: "staff" }),
]);

/**
 * The roster member we revoke ("ban" equivalent — remove admin access). A
 * staff member so only the "Revoke access" action is offered. Revoking a
 * member removes their row and fires the fire-and-forget audit event.
 */
export const SEED_REVOKE_TARGET = SEED_ADMIN_ROSTER[1]; // Bilal Karim

/**
 * Deterministic audit-trail action keys the viewer is expected to surface.
 * These correspond to entries in the `AUDIT_LOGS` dataset in
 * `lib/actions/admin-audit.js` (all `category: "moderation"`). They cover the
 * issue's "ban" and "resolve report" moderation-spine steps.
 */
export const EXPECTED_AUDIT = Object.freeze({
  category: "moderation",
  banAction: "moderation.user_banned",
  resolveReportAction: "moderation.report_dismissed",
});

/** Body returned by the mocked `POST /api/auth/login`. */
export function loginResponseBody() {
  return { token: SEED_AUTH_TOKEN, user: SEED_SUPER_ADMIN };
}

/**
 * Cookie descriptors for seeding a super-admin session directly onto a browser
 * context (alternative to driving the login form). Exported for reuse/docs;
 * the happy path exercises the real login form instead, per the issue.
 *
 * @param {string} baseURL e.g. "http://localhost:3123"
 */
export function seedAuthCookies(baseURL) {
  const { hostname } = new URL(baseURL);
  return [
    { name: "authToken", value: SEED_AUTH_TOKEN, domain: hostname, path: "/" },
    {
      name: "userInfo",
      value: encodeURIComponent(JSON.stringify(SEED_SUPER_ADMIN)),
      domain: hostname,
      path: "/",
    },
  ];
}
