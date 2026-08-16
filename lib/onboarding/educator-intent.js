/**
 * Client-side educator intent + verification flags.
 *
 * The server (user.role) is the source of truth for educator status. These
 * localStorage flags are defence-in-depth: they carry the signup intent across
 * the email-verification round trip (where the email link may open in the same
 * browser before the backend has persisted role nuance) and mark the
 * "skipped verification" state that the dashboard banner surfaces.
 */

const INTENT_KEY = "dnb_educator_intent";
const SKIPPED_KEY = "dnb_educator_verification_skipped";

function read(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

/** Record that the user signed up with educator intent. */
export function setEducatorIntent() {
  write(INTENT_KEY, "1");
}

/** Whether an educator-intent flag was set during signup. */
export function getEducatorIntent() {
  return read(INTENT_KEY) === "1";
}

export function clearEducatorIntent() {
  write(INTENT_KEY, null);
}

/** Mark verification as skipped (Path B) so the dashboard can surface it. */
export function setVerificationSkipped() {
  write(SKIPPED_KEY, "1");
}

export function getVerificationSkipped() {
  return read(SKIPPED_KEY) === "1";
}

export function clearVerificationSkipped() {
  write(SKIPPED_KEY, null);
}
