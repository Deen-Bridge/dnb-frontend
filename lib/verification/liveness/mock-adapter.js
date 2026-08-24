/**
 * Mock Liveness Adapter
 * ----------------------
 * Deterministic fake that drives the full UI flow without any vendor SDK.
 * Safe for local development, Storybook, and automated tests.
 *
 * Behaviour (controllable via the `outcome` option)
 * --------------------------------------------------
 *   "success"   — resolves after `delayMs` with a fake verification token.
 *   "failure"   — resolves after `delayMs` with a failure result.
 *   "timeout"   — does nothing until the caller's timeout fires, then the
 *                 adapter's own cancel() is invoked; the result callback
 *                 receives { ok: false, reason: "timeout" }.
 *   "cancelled" — resolves immediately (simulates user pressing Cancel).
 *
 * Usage
 * -----
 *   import { MockLivenessAdapter } from "@/lib/verification/liveness/mock-adapter";
 *   const adapter = new MockLivenessAdapter({ outcome: "success" });
 */

import { LivenessAdapter } from "./adapter";

/** Fake token prefix — makes it easy to spot mock tokens in logs / tests */
const MOCK_TOKEN_PREFIX = "mock_liveness_token_";

/**
 * Generate a short opaque fake token.
 * Does NOT use Math.random() in a way that leaks biometric data —
 * this is purely an identifier, never a biometric vector.
 */
function generateMockToken() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${MOCK_TOKEN_PREFIX}${ts}_${rand}`;
}

export class MockLivenessAdapter extends LivenessAdapter {
  /**
   * @param {Object}  [options]
   * @param {"success"|"failure"|"timeout"|"cancelled"} [options.outcome="success"]
   * @param {number}  [options.delayMs=1500]  - Simulated network/capture delay.
   */
  constructor({ outcome = "success", delayMs = 1500 } = {}) {
    super();
    this._outcome = outcome;
    this._delayMs = delayMs;
    this._resultCb = null;
    this._timerId = null;
    this._cancelled = false;
  }

  /**
   * @param {import("./adapter").LivenessSession} session
   * @returns {Promise<import("./adapter").VerificationResult>}
   */
  start(session) {
    this._cancelled = false;

    return new Promise((resolve, reject) => {
      const finish = (result) => {
        // Fire the event-style callback if registered.
        if (this._resultCb) this._resultCb(result);
        if (result.ok) {
          resolve(result);
        } else {
          reject(result);
        }
      };

      if (this._outcome === "timeout") {
        // Intentionally never resolves — the wizard's timeout guard fires.
        // When cancel() is called (by the timeout handler), we emit the result.
        this._pendingReject = () =>
          finish({ ok: false, reason: "timeout", message: "Capture timed out." });
        return;
      }

      if (this._outcome === "cancelled") {
        finish({ ok: false, reason: "cancelled", message: "User cancelled." });
        return;
      }

      this._timerId = setTimeout(() => {
        if (this._cancelled) return;

        if (this._outcome === "failure") {
          finish({
            ok: false,
            reason: "failure",
            message: "Liveness check did not pass. Please try again.",
          });
        } else {
          // success
          finish({
            ok: true,
            // The token is the ONLY thing forwarded to the backend.
            // session.userId is used here only to tag the fake token for tracing.
            token: generateMockToken(session?.userId),
          });
        }
      }, this._delayMs);
    });
  }

  /**
   * Register an event-style callback (mirrors real provider SDKs that push
   * results via events rather than resolved Promises).
   *
   * @param {(result: import("./adapter").VerificationResult | import("./adapter").VerificationError) => void} cb
   */
  onResult(cb) {
    if (typeof cb !== "function") {
      throw new TypeError("onResult: cb must be a function");
    }
    this._resultCb = cb;
  }

  /**
   * Abort the current session.  Safe to call multiple times.
   */
  cancel() {
    this._cancelled = true;
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
    // If we were in "timeout" mode, resolve the pending reject.
    if (this._pendingReject) {
      const fn = this._pendingReject;
      this._pendingReject = null;
      fn();
    }
  }
}
