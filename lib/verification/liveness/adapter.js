/**
 * Liveness / Face-Verification Adapter Interface
 * ------------------------------------------------
 * Every provider adapter MUST implement the three methods defined here.
 * UI components import and call this interface only — no vendor SDK name
 * ever appears outside an adapter module.
 *
 * Contract
 * --------
 *   start(session)   — Kick off a verification session.
 *                      Returns a Promise that resolves with a VerificationResult
 *                      or rejects with a VerificationError.
 *
 *   onResult(cb)     — Register a callback to receive the VerificationResult
 *                      (or VerificationError) when the session concludes.
 *                      Some vendors push results via an event/webhook bridge
 *                      rather than resolving the start() promise, so both
 *                      paths are supported.  The callback receives exactly
 *                      one argument: { ok, token?, error? }.
 *
 *   cancel()         — Abort an in-progress session cleanly.
 *                      Must be idempotent (safe to call even if not started).
 *
 * Types (JSDoc only — no runtime enforcement here)
 * -------------------------------------------------
 * @typedef {Object} LivenessSession
 * @property {string}  userId          - Authenticated user's DB id.
 * @property {string}  consentVersion  - Policy version the user agreed to.
 * @property {number}  consentAt       - Unix-ms timestamp of consent.
 * @property {number}  timeoutMs       - Milliseconds before the capture times out.
 *
 * @typedef {Object} VerificationResult
 * @property {true}   ok               - Always true on success.
 * @property {string} token            - Short-lived opaque token from the provider.
 *                                       Forward this to the backend; never store it.
 *
 * @typedef {Object} VerificationError
 * @property {false}  ok               - Always false on failure.
 * @property {'failure'|'timeout'|'cancelled'} reason
 * @property {string} [message]        - Human-readable detail (optional).
 */

/**
 * Base class that enforces the adapter contract via runtime checks.
 * Concrete adapters should extend this class.
 */
export class LivenessAdapter {
  /**
   * @param {LivenessSession} _session
   * @returns {Promise<VerificationResult>}
   */
  start(_session) {
    throw new Error(`${this.constructor.name} must implement start(session)`);
  }

  /**
   * @param {(result: VerificationResult | VerificationError) => void} _cb
   */
  onResult(_cb) {
    throw new Error(`${this.constructor.name} must implement onResult(cb)`);
  }

  cancel() {
    throw new Error(`${this.constructor.name} must implement cancel()`);
  }
}
