/**
 * Session status — reason constants, JWT age helpers, and login messaging.
 * ---------------------------------------------------------------------------
 * Single source of truth for *why* a session ended and *how old* the current
 * session is, shared by the admin idle guard (#337), the re-auth prompt, and
 * the login-page "session ended" banner.
 *
 * This is **defense-in-depth / UX only** — exactly like `roles.js` and
 * `admin-tiers.js`. The backend remains the real authority on session validity;
 * everything here exists so the UI can enforce stricter admin session flows and
 * explain to the user what happened.
 *
 * Design rules
 * ------------
 *   - **Pure where it can be.** `decodeJwt`, `getSessionAgeMs`, `reasonMessage`
 *     read only their inputs (or the auth cookie) — no React, no fetching.
 *   - **Fail safe.** When the session age can't be determined (no JWT, no `iat`,
 *     malformed token) the age helpers return `null` and callers must treat
 *     "unknown age" as *not stale enough to force a logout* — we never sign an
 *     admin out on a guess.
 */

import Cookies from "js-cookie";

/**
 * Canonical reasons a session can end. Passed through the `?reason=` query param
 * to the login page so the user gets a precise "expired" vs "revoked" message.
 */
export const SESSION_END_REASONS = Object.freeze({
  /** Backend token lifetime elapsed (JWT `exp` passed). */
  SESSION_EXPIRED: "expired",
  /** An admin revoked this device/session server-side. */
  SESSION_REVOKED: "revoked",
  /** Client-side idle-timeout auto-logout (admin hardening, #337). */
  SESSION_IDLE: "idle",
});

// Convenience named exports mirroring the spec's constant names.
export const SESSION_EXPIRED = SESSION_END_REASONS.SESSION_EXPIRED;
export const SESSION_REVOKED = SESSION_END_REASONS.SESSION_REVOKED;
export const SESSION_IDLE = SESSION_END_REASONS.SESSION_IDLE;

/**
 * Human-facing copy for each end reason. `variant` maps onto the `Alert` UI
 * component so revoked (a security event) reads more urgently than a benign
 * expiry.
 */
const REASON_COPY = Object.freeze({
  [SESSION_END_REASONS.SESSION_EXPIRED]: Object.freeze({
    title: "Your session expired",
    message: "For your security, please sign in again to continue.",
    variant: "default",
  }),
  [SESSION_END_REASONS.SESSION_REVOKED]: Object.freeze({
    title: "Your session was revoked",
    message:
      "This session was signed out from another device or by an administrator. Sign in again if this was you.",
    variant: "destructive",
  }),
  [SESSION_END_REASONS.SESSION_IDLE]: Object.freeze({
    title: "Signed out for inactivity",
    message:
      "You were signed out after a period of inactivity to protect your account. Please sign in again.",
    variant: "default",
  }),
});

/**
 * Normalise an arbitrary `?reason=` value to a known {@link SESSION_END_REASONS}
 * value, or `null` when it is missing/unrecognised.
 *
 * @param {unknown} reason
 * @returns {string|null}
 */
export function normalizeReason(reason) {
  if (typeof reason !== "string") return null;
  const r = reason.trim().toLowerCase();
  const values = Object.values(SESSION_END_REASONS);
  return values.includes(r) ? r : null;
}

/**
 * Resolve the friendly `{ title, message, variant }` copy for an end reason.
 * Returns `null` for an unknown/missing reason so callers can render nothing.
 *
 * @param {unknown} reason
 * @returns {{title: string, message: string, variant: ("default"|"destructive")}|null}
 */
export function reasonMessage(reason) {
  const key = normalizeReason(reason);
  return key ? REASON_COPY[key] : null;
}

/**
 * Build a login URL carrying the end reason so the login page can explain what
 * happened. Locale-agnostic (next-intl middleware adds the locale prefix).
 *
 * @param {string} reason a {@link SESSION_END_REASONS} value
 * @returns {string} e.g. "/login?reason=idle"
 */
export function loginUrlWithReason(reason) {
  const key = normalizeReason(reason);
  return key ? `/login?reason=${key}` : "/login";
}

/**
 * Decode a JWT payload without verifying its signature. **Never** a security
 * check — signature verification is the backend's job; this only reads claims
 * (`iat`, `exp`) the client uses for UX timing. Returns `null` on any malformed
 * input.
 *
 * @param {unknown} token
 * @returns {Record<string, any>|null}
 */
export function decodeJwt(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // Pad to a multiple of 4 for atob.
    while (base64.length % 4) base64 += "=";
    const json =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    // Handle UTF-8 payloads.
    const decoded = decodeURIComponent(
      Array.prototype.map
        .call(json, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** Read the raw auth token cookie (browser only). */
function readToken() {
  try {
    return Cookies.get("authToken") || null;
  } catch {
    return null;
  }
}

/**
 * Module-level "session freshness anchor" bumped whenever the user completes a
 * successful re-authentication (step-up). The stubbed re-auth doesn't mint a new
 * JWT, so without this a re-auth wouldn't reset the perceived session age.
 * @type {number|null} epoch ms
 */
let lastReauthAt = null;

/** Record a successful re-authentication so the session reads as fresh again. */
export function markReauthenticated(at = Date.now()) {
  lastReauthAt = typeof at === "number" && Number.isFinite(at) ? at : Date.now();
}

/** Clear the re-auth anchor (e.g. on logout). */
export function clearReauthMarker() {
  lastReauthAt = null;
}

/**
 * Resolve the effective start of the current session as epoch ms — the most
 * recent of the JWT `iat` and the last successful re-auth. Returns `null` when
 * it cannot be determined (no token / no `iat`), which callers treat as
 * "unknown, don't force anything".
 *
 * @param {string} [token] optional explicit token (defaults to the cookie)
 * @returns {number|null}
 */
export function getSessionStartedAt(token) {
  const claims = decodeJwt(token ?? readToken());
  const iatMs =
    claims && typeof claims.iat === "number" ? claims.iat * 1000 : null;
  if (iatMs == null && lastReauthAt == null) return null;
  return Math.max(iatMs ?? 0, lastReauthAt ?? 0) || null;
}

/**
 * Age of the current session in milliseconds, or `null` when undeterminable.
 *
 * @param {string} [token]
 * @returns {number|null}
 */
export function getSessionAgeMs(token) {
  const startedAt = getSessionStartedAt(token);
  if (startedAt == null) return null;
  return Math.max(0, Date.now() - startedAt);
}

/**
 * Whether the session is "fresh enough" to skip a re-auth prompt for a
 * sensitive action. **Fails safe as fresh** when the age is unknown so a broken
 * or unusual token never hard-blocks admins from acting — the backend still
 * enforces the real rule.
 *
 * @param {number} maxAgeMinutes reauth-after threshold
 * @param {string} [token]
 * @returns {boolean}
 */
export function isSessionFresh(maxAgeMinutes, token) {
  const ageMs = getSessionAgeMs(token);
  if (ageMs == null) return true; // unknown age → don't force re-auth
  const maxMs = Math.max(0, Number(maxAgeMinutes) || 0) * 60_000;
  return ageMs <= maxMs;
}
