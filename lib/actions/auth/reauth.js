/**
 * Re-authentication service — password step-up before sensitive admin actions.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves against the mocked contract so the re-auth prompt (#337)
 * can be built and reviewed before the backend endpoint exists. Swap the body
 * for the `axiosInstance` call when the backend lands.
 */

import axiosInstance from "@/lib/config/axios.config";

const MOCK_DELAY_MS = 500;

/**
 * Verify the current user's password to prove a fresh, deliberate presence
 * before a sensitive action proceeds.
 *
 * TODO(backend): POST /api/auth/reauth
 *   - Auth: the current session token in the Authorization header.
 *   - Payload: { password: string }
 *   - 200 → { ok: true, reauthAt: string (ISO 8601) } — server records the
 *     step-up so subsequent sensitive calls within a window are trusted.
 *   - 401 → { ok: false } for a wrong password (rate-limited server-side).
 *
 * @param {{password: string}} payload
 * @returns {Promise<{ok: true, reauthAt: string}>}
 * @throws {Error} with a friendly message on an incorrect password.
 */
export async function reauthenticate({ password } = {}) {
  // TODO(backend):
  //   const res = await axiosInstance.post("/api/auth/reauth", { password });
  //   return res.data;
  void axiosInstance; // referenced so the real wiring is a one-line swap.

  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  // Stub: treat any non-empty password as correct so the flow is demoable.
  if (!password || !String(password).trim()) {
    const err = new Error("Incorrect password. Please try again.");
    err.status = 401;
    throw err;
  }

  return { ok: true, reauthAt: new Date().toISOString() };
}
