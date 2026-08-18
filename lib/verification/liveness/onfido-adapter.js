/**
 * Onfido Adapter (stub)
 * ----------------------
 * Production implementation shell for Onfido (onfido.com).
 *
 * How to complete this adapter
 * ----------------------------
 * 1. Install the Onfido Web SDK:
 *      npm install onfido-sdk-ui
 *
 * 2. The backend must create an Onfido applicant + SDK token using your
 *    server-side ONFIDO_API_TOKEN (never client-side).
 *    It should return { sdkToken, applicantId } to the frontend.
 *
 * 3. Replace the TODOs below.
 *
 * 4. Set NEXT_PUBLIC_LIVENESS_PROVIDER=onfido in your production .env.
 *
 * Security notes
 * --------------
 * - ONFIDO_API_TOKEN is a server-side secret — never NEXT_PUBLIC_.
 * - Only the short-lived sdkToken (used here) and the check ID returned
 *   by the backend after creating a check are forwarded.  No biometric
 *   frames or vectors are ever stored client-side.
 */

import { LivenessAdapter } from "./adapter";

export class OnfidoLivenessAdapter extends LivenessAdapter {
  constructor() {
    super();
    this._resultCb = null;
    this._onfidoInstance = null;
  }

  /**
   * @param {import("./adapter").LivenessSession} session
   * @returns {Promise<import("./adapter").VerificationResult>}
   */
  async start(session) {
    // TODO: fetch { sdkToken, applicantId } from your backend
    // const { sdkToken, applicantId } = await fetchOnfidoSession(session.userId);

    return new Promise((resolve, reject) => {
      // TODO: replace with real Onfido SDK initialisation
      // import { init } from "onfido-sdk-ui";
      // this._onfidoInstance = init({
      //   token: sdkToken,
      //   containerId: "onfido-mount",
      //   steps: ["face"],
      //   onComplete: (data) => {
      //     // After complete, your backend should create an Onfido check and
      //     // return a verificationToken.  Here we use the applicantId as the
      //     // short-lived token for the hand-off.
      //     const result = { ok: true, token: applicantId };
      //     if (this._resultCb) this._resultCb(result);
      //     resolve(result);
      //   },
      //   onError: (err) => {
      //     const result = { ok: false, reason: "failure", message: err.message };
      //     if (this._resultCb) this._resultCb(result);
      //     reject(result);
      //   },
      //   onModalRequestClose: () => {
      //     const result = { ok: false, reason: "cancelled" };
      //     if (this._resultCb) this._resultCb(result);
      //     reject(result);
      //   },
      // });

      // Placeholder so the module compiles without the real SDK:
      void session;
      reject(
        new Error(
          "OnfidoLivenessAdapter is a stub. Complete the TODO blocks in " +
            "lib/verification/liveness/onfido-adapter.js to go live."
        )
      );
    });
  }

  /** @param {Function} cb */
  onResult(cb) {
    if (typeof cb !== "function") {
      throw new TypeError("onResult: cb must be a function");
    }
    this._resultCb = cb;
  }

  cancel() {
    try {
      this._onfidoInstance?.tearDown?.();
    } catch {
      // SDK may throw if not yet initialised — ignore.
    }
  }
}
