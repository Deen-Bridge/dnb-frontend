/**
 * Admin session-security config service — configurable session hardening values.
 * ---------------------------------------------------------------------------
 * **STUBBED.** These functions resolve with mocked data so the session-security
 * settings editor (#337) can be built and reviewed before the backend endpoints
 * exist. Swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * Config shape owned by the backend:
 *
 *   {
 *     idleTimeoutMinutes: number,  // auto-logout after this much inactivity
 *     idleWarningSeconds: number,  // show the "you'll be signed out" warning this
 *                                  //   many seconds *before* the timeout fires
 *     reauthAfterMinutes: number,  // require re-auth for sensitive actions once
 *                                  //   the session is older than this
 *   }
 */

const MOCK_DELAY_MS = 300;

/** Sane, security-minded defaults used until the backend responds. */
export const DEFAULT_SESSION_SECURITY_CONFIG = Object.freeze({
  idleTimeoutMinutes: 15,
  idleWarningSeconds: 60,
  reauthAfterMinutes: 30,
});

/** Validation bounds, exported so the settings editor can hint them inline. */
export const SESSION_SECURITY_BOUNDS = Object.freeze({
  idleTimeoutMinutes: Object.freeze({ min: 1, max: 480 }),
  idleWarningSeconds: Object.freeze({ min: 5, max: 600 }),
  reauthAfterMinutes: Object.freeze({ min: 1, max: 1440 }),
});

/** In-memory store so the stubbed update round-trips in dev. */
let mockConfig = { ...DEFAULT_SESSION_SECURITY_CONFIG };

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function isIntegerInRange(value, { min, max }) {
  return Number.isInteger(value) && value >= min && value <= max;
}

/**
 * Pure validator for a session-security config. Returns a per-field error map
 * plus a `valid` flag; never throws. Enforces integer bounds and the
 * cross-field rule that the warning lead time must be shorter than the idle
 * timeout (you can't warn for longer than the whole timeout window).
 *
 * @param {Partial<{idleTimeoutMinutes: number, idleWarningSeconds: number, reauthAfterMinutes: number}>} cfg
 * @returns {{valid: boolean, errors: {idleTimeoutMinutes?: string, idleWarningSeconds?: string, reauthAfterMinutes?: string}}}
 */
export function validateSessionSecurityConfig(cfg) {
  const errors = {};
  const c = cfg || {};

  const idleT = SESSION_SECURITY_BOUNDS.idleTimeoutMinutes;
  const idleW = SESSION_SECURITY_BOUNDS.idleWarningSeconds;
  const reauth = SESSION_SECURITY_BOUNDS.reauthAfterMinutes;

  if (!isIntegerInRange(c.idleTimeoutMinutes, idleT)) {
    errors.idleTimeoutMinutes = `Enter a whole number between ${idleT.min} and ${idleT.max} minutes.`;
  }
  if (!isIntegerInRange(c.idleWarningSeconds, idleW)) {
    errors.idleWarningSeconds = `Enter a whole number between ${idleW.min} and ${idleW.max} seconds.`;
  }
  if (!isIntegerInRange(c.reauthAfterMinutes, reauth)) {
    errors.reauthAfterMinutes = `Enter a whole number between ${reauth.min} and ${reauth.max} minutes.`;
  }

  // Cross-field: the warning must fit inside the idle window.
  if (
    !errors.idleTimeoutMinutes &&
    !errors.idleWarningSeconds &&
    c.idleWarningSeconds >= c.idleTimeoutMinutes * 60
  ) {
    errors.idleWarningSeconds =
      "The warning lead time must be shorter than the idle timeout.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Fetch the current session-security config.
 *
 * TODO(backend): GET /api/admin/session-security
 *   - Auth: requires an admin session token (server-side tier check).
 *   - 200 → { config: { idleTimeoutMinutes, idleWarningSeconds, reauthAfterMinutes } }
 *   - 403 for non-admins.
 *
 * @returns {Promise<{idleTimeoutMinutes: number, idleWarningSeconds: number, reauthAfterMinutes: number}>}
 */
export async function getSessionSecurityConfig() {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/session-security")
  //     .then((res) => res.data.config);
  return withMockDelay({ ...mockConfig });
}

/**
 * Persist an updated session-security config. Validates before "saving" and
 * rejects an invalid payload the same way the backend's 422 would.
 *
 * TODO(backend): PUT /api/admin/session-security
 *   - Auth: admin only.
 *   - Payload: { idleTimeoutMinutes, idleWarningSeconds, reauthAfterMinutes }
 *   - 200 → { config: Config }
 *   - 422 with a per-field error map for out-of-range / cross-field violations.
 *
 * @param {{idleTimeoutMinutes: number, idleWarningSeconds: number, reauthAfterMinutes: number}} cfg
 * @returns {Promise<{idleTimeoutMinutes: number, idleWarningSeconds: number, reauthAfterMinutes: number}>}
 */
export async function updateSessionSecurityConfig(cfg) {
  // TODO(backend):
  //   return axiosInstance
  //     .put("/api/admin/session-security", cfg)
  //     .then((res) => res.data.config);
  const { valid, errors } = validateSessionSecurityConfig(cfg);
  if (!valid) {
    const err = new Error("Invalid session-security configuration.");
    err.fieldErrors = errors;
    throw err;
  }
  mockConfig = {
    idleTimeoutMinutes: cfg.idleTimeoutMinutes,
    idleWarningSeconds: cfg.idleWarningSeconds,
    reauthAfterMinutes: cfg.reauthAfterMinutes,
  };
  return withMockDelay({ ...mockConfig });
}
