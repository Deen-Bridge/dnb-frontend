/**
 * Validation helpers for space capacity and scheduling guardrails.
 *
 * These are shared by admin settings forms and (later) server-side
 * validation so the same rules apply everywhere.
 */

/** Absolute platform-wide ceilings – these are hard limits, not defaults. */
export const PLATFORM_LIMITS = {
  maxConcurrentSpaces: { min: 1, max: 500 },
  defaultMaxParticipants: { min: 2, max: 1000 },
  minLeadTimeMinutes: { min: 0, max: 10080 }, // 0 – 7 days
};

/**
 * Validate a single numeric setting against its allowed range.
 * Returns an error string or null when valid.
 */
export function validateSettingRange(name, value, { min, max }) {
  if (value === "" || value === null || value === undefined) {
    return `${name} is required`;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num)) {
    return `${name} must be a whole number`;
  }
  if (num < min) return `${name} must be at least ${min}`;
  if (num > max) return `${name} must be at most ${max}`;
  return null;
}

/**
 * Validate all three capacity / scheduling settings at once.
 * Returns an object keyed by field name; each value is an error string
 * or null when valid.
 */
export function validateCapacitySettings({
  maxConcurrentSpaces,
  defaultMaxParticipants,
  minLeadTimeMinutes,
} = {}) {
  return {
    maxConcurrentSpaces: validateSettingRange(
      "Max concurrent live spaces",
      maxConcurrentSpaces,
      PLATFORM_LIMITS.maxConcurrentSpaces,
    ),
    defaultMaxParticipants: validateSettingRange(
      "Default max participants",
      defaultMaxParticipants,
      PLATFORM_LIMITS.defaultMaxParticipants,
    ),
    minLeadTimeMinutes: validateSettingRange(
      "Minimum lead time",
      minLeadTimeMinutes,
      PLATFORM_LIMITS.minLeadTimeMinutes,
    ),
  };
}

/**
 * Check whether every field in a validation result is null (valid).
 */
export function hasValidationErrors(errors) {
  return Object.values(errors).some(Boolean);
}

/**
 * Human-readable helper: given a minutes value, return something like
 * "30 minutes", "1 hour", or "1 day 2 hours".
 */
export function formatLeadTime(minutes) {
  if (minutes === 0) return "No lead time";
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  const parts = [];
  if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (mins) parts.push(`${mins} min${mins !== 1 ? "s" : ""}`);
  return parts.join(" ");
}
