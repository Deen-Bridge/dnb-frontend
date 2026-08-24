/**
 * Client-side RBAC — roles, capabilities, and the `can()` decision function.
 * ---------------------------------------------------------------------------
 * This is **defense-in-depth only**. The real authorization boundary is the
 * backend (dnb-backend#88 role/ownership enforcement, dnb-backend#92 educator
 * verification). Nothing here is a security control on its own — its job is to
 * stop the UI from *offering* actions the server will reject, so a logged-in
 * student never sees (or can navigate into) instructor-only surfaces.
 *
 * Design rules
 * ------------
 *   - **Fail closed.** Unknown user / unknown role / unknown action → denied.
 *     Callers that don't yet know the user (auth still loading) must also treat
 *     the answer as `false` (see `useCan`).
 *   - **Pure & synchronous.** `can(action, user)` reads only the passed `user`
 *     object so it is trivially unit-testable per role. It never fetches.
 *   - **Verified-educator gating.** Content-creation capabilities require an
 *     educator whose verification has completed. The verification signal is
 *     read from the user object (set by the backend on the user record); the
 *     field name is tolerant (see `isVerified`) because dnb-backend#92 owns the
 *     canonical shape.
 */

/** Canonical role identifiers used across the client. */
export const ROLES = Object.freeze({
  STUDENT: "student",
  EDUCATOR: "educator",
  ADMIN: "admin",
});

/** Capability (action) identifiers. `resource:action`. */
export const CAPABILITIES = Object.freeze({
  COURSE_CREATE: "course:create",
  COURSE_EDIT: "course:edit",
  BOOK_CREATE: "book:create",
  SPACE_CREATE: "space:create",
});

/**
 * Capabilities each role *could* exercise, ignoring verification. Admin is a
 * superuser handled separately in `can`. Students have no mutating capability.
 * Educator capabilities are further gated by verification (see below).
 */
const ROLE_CAPABILITIES = Object.freeze({
  [ROLES.STUDENT]: Object.freeze([]),
  [ROLES.EDUCATOR]: Object.freeze([
    CAPABILITIES.COURSE_CREATE,
    CAPABILITIES.COURSE_EDIT,
    CAPABILITIES.BOOK_CREATE,
    CAPABILITIES.SPACE_CREATE,
  ]),
  [ROLES.ADMIN]: Object.freeze(Object.values(CAPABILITIES)),
});

/**
 * Capabilities that additionally require a *verified* educator. An educator who
 * has not completed verification is denied these (but an admin is not).
 */
const VERIFICATION_REQUIRED = Object.freeze(
  new Set([
    CAPABILITIES.COURSE_CREATE,
    CAPABILITIES.COURSE_EDIT,
    CAPABILITIES.BOOK_CREATE,
    CAPABILITIES.SPACE_CREATE,
  ])
);

/**
 * Normalise a raw role string to a canonical {@link ROLES} value.
 * Tolerates casing/whitespace and common synonyms ("instructor"/"mentor" →
 * educator) so a backend label drift doesn't silently grant/deny wrongly.
 *
 * @param {unknown} role
 * @returns {string|null} canonical role, or null if unrecognised
 */
export function normalizeRole(role) {
  if (typeof role !== "string") return null;
  const r = role.trim().toLowerCase();
  if (r === ROLES.STUDENT || r === "learner") return ROLES.STUDENT;
  if (r === ROLES.EDUCATOR || r === "instructor" || r === "mentor" || r === "teacher") {
    return ROLES.EDUCATOR;
  }
  if (r === ROLES.ADMIN) return ROLES.ADMIN;
  return null;
}

/**
 * Whether the given user is a verified educator, read from the user object.
 * Tolerant of the exact field name owned by dnb-backend#92: accepts a boolean
 * flag (`isVerified` / `educatorVerified` / `isEducatorVerified`) or a string
 * status (`verificationStatus === "verified"`).
 *
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function isVerified(user) {
  if (!user || typeof user !== "object") return false;
  if (user.isVerified === true) return true;
  if (user.educatorVerified === true) return true;
  if (user.isEducatorVerified === true) return true;
  if (
    typeof user.verificationStatus === "string" &&
    user.verificationStatus.trim().toLowerCase() === "verified"
  ) {
    return true;
  }
  return false;
}

/** Whether an action requires educator verification. */
export function requiresVerification(action) {
  return VERIFICATION_REQUIRED.has(action);
}

/**
 * Whether the user's role is, in principle, allowed the action — *before*
 * applying the verification gate. Used by the route guard to tell "wrong role"
 * (→ unauthorized) apart from "right role, not yet verified" (→ verify prompt).
 *
 * @param {object|null|undefined} user
 * @param {string} action
 * @returns {boolean}
 */
export function roleAllows(user, action) {
  if (!user) return false;
  const role = normalizeRole(user.role);
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;
  return (ROLE_CAPABILITIES[role] || []).includes(action);
}

/**
 * Core capability check. Returns true only if the user's role permits the
 * action AND (for verification-gated actions) the educator is verified.
 * Admins bypass the verification gate. Fails closed on any missing/unknown
 * input.
 *
 * @param {string} action  a {@link CAPABILITIES} value
 * @param {object|null|undefined} user  the authenticated user (or null)
 * @returns {boolean}
 */
export function can(action, user) {
  if (!action || !user || typeof user !== "object") return false;

  const role = normalizeRole(user.role);
  if (!role) return false;

  // Admin is a superuser and is not subject to the verification gate.
  if (role === ROLES.ADMIN) return true;

  const allowed = ROLE_CAPABILITIES[role] || [];
  if (!allowed.includes(action)) return false;

  if (requiresVerification(action) && !isVerified(user)) return false;

  return true;
}
