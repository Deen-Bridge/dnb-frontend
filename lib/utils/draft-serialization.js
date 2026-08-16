/**
 * Pure helpers backing useDraftAutosave.
 *
 * Kept dependency-free and node-safe so they can be unit-tested without a DOM.
 * The hook consumes these instead of inlining the logic, which lets the draft
 * behaviour (File stripping, per-user key namespacing) be verified directly.
 */

const DEFAULT_PREFIX = "dnb_course_draft_";

/**
 * Build the localStorage key for a draft.
 * @param {string} userId - user id (or "anon" when signed out)
 * @param {string|null} [id] - optional draft discriminator (course id, wizard id)
 * @param {string} [prefix] - key namespace
 * @returns {string}
 */
export function buildDraftStorageKey(userId, id = null, prefix = DEFAULT_PREFIX) {
  return `${prefix}${userId || "anon"}${id ? `_${id}` : ""}`;
}

/** True when the value is a browser File (safe when File is undefined, e.g. SSR/node). */
export function isFile(value) {
  return typeof File !== "undefined" && value instanceof File;
}

/**
 * Serialize draft values for localStorage.
 *
 * File objects are not serializable and must never be restored as mock media,
 * so they are replaced with null. All other values pass through JSON's own
 * serialization (dropping functions, symbols, etc).
 *
 * @param {object} values
 * @returns {object}
 */
export function serializeDraftValues(values) {
  if (values == null) return {};

  const serializable = JSON.parse(
    JSON.stringify(values, (key, value) => {
      if (isFile(value)) return null;
      return value;
    })
  );
  return serializable ?? {};
}

/**
 * Read and parse a stored draft.
 * @param {string} storageKey
 * @returns {object|null}
 */
export function readDraft(storageKey) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Whether a draft exists for the key.
 * @param {string} storageKey
 * @returns {boolean}
 */
export function hasDraft(storageKey) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}

/**
 * Persist a serialized draft.
 * @param {string} storageKey
 * @param {object} values
 */
export function writeDraft(storageKey, values) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(serializeDraftValues(values)));
  } catch {
    // Ignore quota exceeded or disabled storage.
  }
}

/**
 * Remove a draft.
 * @param {string} storageKey
 */
export function clearDraft(storageKey) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore errors.
  }
}

export { DEFAULT_PREFIX };
