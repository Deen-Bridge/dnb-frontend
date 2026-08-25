/**
 * Admin tiers — super-admin vs staff gating for admin-team management.
 * ---------------------------------------------------------------------------
 * Deliberately **separate** from `lib/auth/roles.js`: roles.js answers the
 * generic "is this role allowed this capability?" question for the whole app,
 * while this module owns the finer-grained tiering *within* the admin role
 * (staff admins vs super admins). Keeping it isolated means the tier model can
 * evolve (new tiers, delegated scopes, …) without touching the generic RBAC
 * file or every call site.
 *
 * This is **defense-in-depth only**, exactly like `roles.js`. The real
 * authorization boundary is the backend; nothing here is a security control on
 * its own — its job is to stop the UI from offering team-management actions a
 * non-super-admin's requests would be rejected for.
 *
 * Design rules (mirroring `roles.js`)
 * -----------------------------------
 *   - **Fail closed.** Unknown user / unknown tier → staff at best, never
 *     super-admin. Callers that don't yet know the user (auth still loading)
 *     must also treat the answer as `false` (see `useCan`/guards).
 *   - **Pure & synchronous.** Reads only the passed `user` object; no fetching,
 *     no React — trivially unit-testable per user shape.
 */

import { ROLES, normalizeRole } from "@/lib/auth/roles";

/**
 * Canonical admin tier identifiers. Values match the backend contract stubbed
 * in `lib/actions/admin-team.js` (`tier: "staff" | "super_admin"`).
 */
export const TIERS = Object.freeze({
  STAFF: "staff",
  SUPER_ADMIN: "super_admin",
});

/**
 * Normalise a raw tier string to a canonical {@link TIERS} value. Tolerates
 * casing/whitespace and common spellings ("super-admin"/"superadmin" →
 * super_admin) so backend label drift doesn't silently grant/deny wrongly.
 *
 * @param {unknown} tier
 * @returns {string|null} canonical tier, or null if unrecognised
 */
export function normalizeTier(tier) {
  if (typeof tier !== "string") return null;
  const t = tier.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (t === TIERS.STAFF) return TIERS.STAFF;
  if (t === TIERS.SUPER_ADMIN || t === "superadmin" || t === "owner") {
    return TIERS.SUPER_ADMIN;
  }
  return null;
}

/**
 * Resolve a user's admin tier from the user object. Tolerant of the exact
 * field name the backend settles on (`tier` / `adminTier`), and falls back to
 * reading a tier encoded directly into `user.role`. Anything unresolvable
 * degrades to {@link TIERS.STAFF} — an admin is at least staff by definition;
 * only positive evidence grants super-admin.
 *
 * @param {object|null|undefined} user
 * @returns {string} canonical tier ({@link TIERS})
 */
export function getAdminTier(user) {
  if (!user || typeof user !== "object") return TIERS.STAFF;

  const explicit = normalizeTier(user.tier) || normalizeTier(user.adminTier);
  if (explicit) return explicit;

  const viaRole = normalizeTier(user.role);
  if (viaRole) return viaRole;

  return TIERS.STAFF;
}

/**
 * Whether the given user is a super admin. Requires positive evidence of both
 * the admin role (via `normalizeRole`) and the super_admin tier — a staff
 * admin, an educator, or an unknown user all fail closed here.
 *
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  if (!user || typeof user !== "object") return false;
  const role = normalizeRole(user.role);
  if (role !== ROLES.ADMIN) return false;
  return getAdminTier(user) === TIERS.SUPER_ADMIN;
}

/**
 * Whether the user may manage the admin team (view members, invite, demote,
 * revoke). Today this is exactly `isSuperAdmin`, kept as its own seam so the
 * policy has one name call sites depend on when tiers gain nuance.
 *
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function canManageTeam(user) {
  return isSuperAdmin(user);
}

/**
 * Whether the acting user may demote the given member to staff.
 * Super-admin-only; callers additionally enforce self-protection in the UI.
 *
 * @param {object|null|undefined} actor
 * @returns {boolean}
 */
export function canDemoteAdmin(actor) {
  return canManageTeam(actor);
}

/**
 * Whether the acting user may revoke the given member's admin access.
 * Super-admin-only; callers additionally enforce self-protection in the UI.
 *
 * @param {object|null|undefined} actor
 * @returns {boolean}
 */
export function canRevokeAdmin(actor) {
  return canManageTeam(actor);
}
