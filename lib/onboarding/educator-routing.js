/**
 * Pure routing decision for where a freshly verified user goes.
 *
 * Educators are sent to the Verify-now / Skip branch selector; everyone else
 * goes straight to the dashboard. Kept free of React/router imports so it can
 * be unit-tested and reused by both the verify-email page and any tests.
 */

export const EDUCATOR_ROLE = "educator";

export const EDUCATOR_ONBOARDING_ROUTE = "/onboarding/educator";
export const DASHBOARD_ROUTE = "/dashboard";

/**
 * @param {object|null} [user] - session user ({ role: string } at minimum)
 * @param {boolean} [educatorIntent] - localStorage signup-intent fallback
 * @returns {string} the post-verification route
 */
export function resolvePostVerificationRoute(user, educatorIntent = false) {
  const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";

  if (role === EDUCATOR_ROLE || educatorIntent === true) {
    return EDUCATOR_ONBOARDING_ROUTE;
  }

  return DASHBOARD_ROUTE;
}

/**
 * Whether a user object represents an educator (role case-insensitive).
 * @param {object|null} [user]
 * @returns {boolean}
 */
export function isEducator(user) {
  return (
    typeof user?.role === "string" &&
    user.role.toLowerCase() === EDUCATOR_ROLE
  );
}
