/**
 * Scheduled report digests service — read/write the recurring digest-email
 * configuration and validate a cron-like delivery schedule (#306).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every network function here resolves with mocked data so the
 * digests configuration page (#306) can be built and reviewed before the
 * backend endpoints exist. Swap the mock bodies for `axiosInstance` calls
 * (see `lib/config/axios.config.js`) when the backend lands.
 *
 * Frontend owns the *configuration UX* only — the backend runs the schedule
 * and actually sends the emails. This module additionally exports two **pure**
 * helpers (`scheduleToCron`, `validateDigestConfig`) that are the deliverable
 * "client-side cron-ish validation": the UI previews and validates the
 * selection before it is ever submitted.
 *
 * Config shape owned by the backend:
 *
 *   {
 *     digests: {
 *       moderation: { enabled: boolean }, // content-moderation summary
 *       revenue:    { enabled: boolean }, // revenue / payouts summary
 *       signups:    { enabled: boolean }, // new-user signups summary
 *     },
 *     schedule: {
 *       dayOfWeek: number,   // 0-6, 0 = Sunday … 6 = Saturday
 *       hour: number,        // 0-23 (24h clock, in `timezone`)
 *       minute: number,      // one of 0 | 15 | 30 | 45
 *       timezone: string,    // IANA tz, e.g. "UTC", "America/New_York"
 *     },
 *     recipients: string[],  // admin email addresses that receive the digests
 *   }
 */

const MOCK_DELAY_MS = 400;

/** The three digest types this feature manages, in display order. */
export const DIGEST_TYPES = Object.freeze(["moderation", "revenue", "signups"]);

/** Minutes the schedule picker allows — quarter-hour granularity. */
export const ALLOWED_MINUTES = Object.freeze([0, 15, 30, 45]);

/** Sunday-first day labels, indexed by `schedule.dayOfWeek` (0-6). */
export const DAY_LABELS = Object.freeze([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

/** A small, sensible timezone allow-list for the read-only-ish tz select. */
export const TIMEZONES = Object.freeze([
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kuala_Lumpur",
  "Asia/Jakarta",
]);

/**
 * Reasonably strict email pattern. Deliberately not RFC-5322-exhaustive — it
 * rejects the obviously-malformed addresses an admin would fat-finger while
 * accepting the ordinary `local@domain.tld` shape.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** In-memory store so the stubbed update mutation round-trips in dev. */
let mockConfig = null;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function seedConfig() {
  return {
    digests: {
      moderation: { enabled: true },
      revenue: { enabled: true },
      signups: { enabled: false },
    },
    schedule: {
      dayOfWeek: 1, // Monday
      hour: 9,
      minute: 0,
      timezone: "UTC",
    },
    recipients: ["admin@deenbridge.org", "ops@deenbridge.org"],
  };
}

/** Deep-ish clone of the config so callers never mutate the mock store. */
function cloneConfig(config) {
  return {
    digests: {
      moderation: { enabled: Boolean(config?.digests?.moderation?.enabled) },
      revenue: { enabled: Boolean(config?.digests?.revenue?.enabled) },
      signups: { enabled: Boolean(config?.digests?.signups?.enabled) },
    },
    schedule: {
      dayOfWeek: config?.schedule?.dayOfWeek,
      hour: config?.schedule?.hour,
      minute: config?.schedule?.minute,
      timezone: config?.schedule?.timezone,
    },
    recipients: Array.isArray(config?.recipients) ? [...config.recipients] : [],
  };
}

function getMockConfig() {
  if (!mockConfig) mockConfig = seedConfig();
  return mockConfig;
}

/**
 * Convert a delivery `schedule` into a 5-field cron expression. Digests fire on
 * a specific minute/hour of a single weekday every week, so day-of-month and
 * month are always wildcards: `"minute hour * * dayOfWeek"`.
 *
 * Pure and total: out-of-range or missing fields are emitted verbatim (or as
 * `*`) rather than throwing — validation is `validateDigestConfig`'s job, and
 * the preview should still render something for a half-built selection.
 *
 * @param {{dayOfWeek?: number, hour?: number, minute?: number}} schedule
 * @returns {string} e.g. `"0 9 * * 1"` (Mondays at 09:00)
 */
export function scheduleToCron(schedule = {}) {
  const field = (value) =>
    Number.isInteger(value) ? String(value) : "*";
  const minute = field(schedule.minute);
  const hour = field(schedule.hour);
  const dow = field(schedule.dayOfWeek);
  return `${minute} ${hour} * * ${dow}`;
}

/**
 * Validate a digest configuration before submit — the "cron-ish" client-side
 * check. Returns a flat map of field → message plus a `valid` boolean.
 *
 * Rules:
 *   - `dayOfWeek` is an integer 0-6.
 *   - `hour` is an integer 0-23.
 *   - `minute` is one of {0, 15, 30, 45}.
 *   - `timezone` is a non-empty string.
 *   - Every recipient is a well-formed email; no duplicates.
 *   - If **any** digest is enabled there must be at least one recipient.
 *   - All digests off is *allowed* but surfaces a non-blocking `warning`
 *     (nothing will be sent) — it does not flip `valid` to false.
 *
 * @param {object} config config in the shape documented at the top of the file
 * @returns {{valid: boolean, errors: Record<string, string>, warning: string|null}}
 */
export function validateDigestConfig(config) {
  const errors = {};
  let warning = null;

  const digests = config?.digests || {};
  const anyEnabled = DIGEST_TYPES.some((type) => digests?.[type]?.enabled);
  if (!anyEnabled) {
    warning =
      "All digests are off — no scheduled emails will be sent until you enable one.";
  }

  const schedule = config?.schedule || {};

  if (
    !Number.isInteger(schedule.dayOfWeek) ||
    schedule.dayOfWeek < 0 ||
    schedule.dayOfWeek > 6
  ) {
    errors.dayOfWeek = "Pick a day of the week.";
  }

  if (
    !Number.isInteger(schedule.hour) ||
    schedule.hour < 0 ||
    schedule.hour > 23
  ) {
    errors.hour = "Hour must be between 00 and 23.";
  }

  if (!ALLOWED_MINUTES.includes(schedule.minute)) {
    errors.minute = "Minute must be 00, 15, 30, or 45.";
  }

  if (typeof schedule.timezone !== "string" || schedule.timezone.trim() === "") {
    errors.timezone = "Select a timezone.";
  }

  const recipients = Array.isArray(config?.recipients) ? config.recipients : [];
  const seen = new Set();
  const bad = [];
  let hasDuplicate = false;
  recipients.forEach((raw) => {
    const email = String(raw || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      bad.push(raw);
      return;
    }
    if (seen.has(email)) hasDuplicate = true;
    seen.add(email);
  });
  if (bad.length > 0) {
    errors.recipients = `Fix invalid email${bad.length > 1 ? "s" : ""}: ${bad.join(
      ", "
    )}.`;
  } else if (hasDuplicate) {
    errors.recipients = "Remove duplicate recipients.";
  } else if (anyEnabled && recipients.length === 0) {
    errors.recipients = "Add at least one recipient while a digest is enabled.";
  }

  return { valid: Object.keys(errors).length === 0, errors, warning };
}

/**
 * Whether a single email string is well-formed. Exposed so the recipient input
 * can validate inline without pulling in the whole config validator.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || "").trim().toLowerCase());
}

/**
 * Read the current digest configuration.
 *
 * TODO(backend): GET /api/admin/digests
 *   - Auth: requires an admin session token (server-side tier check).
 *   - 200 → { config: DigestConfig } using the shape above.
 *   - 403 for non-admins.
 *
 * @returns {Promise<{config: object}>}
 */
export async function getDigestConfig() {
  // TODO(backend): return axiosInstance.get("/api/admin/digests").then((res) => res.data);
  return withMockDelay({ config: cloneConfig(getMockConfig()) });
}

/**
 * Persist a new digest configuration (full replace, PUT semantics).
 *
 * TODO(backend): PUT /api/admin/digests
 *   - Auth: admin only.
 *   - Payload: DigestConfig (the full config object).
 *   - 200 → { config: DigestConfig } echoing the stored value.
 *   - 422 if the schedule / recipients fail server-side validation.
 *
 * @param {object} config the full config to store
 * @returns {Promise<{config: object}>}
 */
export async function updateDigestConfig(config) {
  // TODO(backend):
  //   return axiosInstance.put("/api/admin/digests", config).then((res) => res.data);
  const { valid, errors } = validateDigestConfig(config);
  if (!valid) {
    await withMockDelay(null);
    const first = Object.values(errors)[0] || "Invalid digest configuration";
    throw new Error(first);
  }
  mockConfig = cloneConfig(config);
  return withMockDelay({ config: cloneConfig(mockConfig) });
}
