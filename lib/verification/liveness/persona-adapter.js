/**
 * Persona Verification Adapter (stub)
 * -------------------------------------
 * Production implementation shell for Persona (withpersona.com).
 *
 * How to complete this adapter
 * ----------------------------
 * 1. Install the Persona Web SDK (kept OUT of package.json intentionally so the
 *    build stays clean until you are ready to go live):
 *      npm install @persona-kyc/persona
 *
 * 2. The backend must create a short-lived "inquiry" session via the Persona
 *    REST API using your server-side PERSONA_API_KEY (never exposed client-side).
 *    It should return { inquiryId, sessionToken } to the frontend.
 *
 * 3. Replace the TODOs below with the real SDK calls.
 *
 * 4. Set NEXT_PUBLIC_LIVENESS_PROVIDER=persona in your production .env.
 *
 * Security notes
 * --------------
 * - PERSONA_API_KEY is a server-side secret — it must never appear in any
 *   NEXT_PUBLIC_ environment variable.
 * - This adapter forwards ONLY the provider's short-lived verificationToken to
 *   the backend.  Raw frames, face vectors, and SDK blobs are never stored
 *   in component state, localStorage, or cookies.
 */

import { LivenessAdapter } from "./adapter";

export class PersonaLivenessAdapter extends LivenessAdapter {
  constructor() {
    super();
    this._resultCb = null;
    this._client = null;
  }

  /**
   * @param {import("./adapter").LivenessSession} session
   * @returns {Promise<import("./adapter").VerificationResult>}
   */
  async start(session) {
    // TODO: fetch { inquiryId, sessionToken } from your backend
    // const { inquiryId, sessionToken } = await fetchPersonaSession(session.userId);

    return new Promise((resolve, reject) => {
      // TODO: replace with real Persona SDK initialisation
      // const { Persona } = await import("@persona-kyc/persona");
      // this._client = new Persona.Client({
      //   inquiryId,
      //   sessionToken,
      //   onComplete: ({ inquiryId: id, status, fields }) => {
      //     if (status === "completed") {
      //       const result = { ok: true, token: id };
      //       if (this._resultCb) this._resultCb(result);
      //       resolve(result);
      //     } else {
      //       const result = { ok: false, reason: "failure", message: status };
      //       if (this._resultCb) this._resultCb(result);
      //       reject(result);
      //     }
      //   },
      //   onError: (error) => {
      //     const result = { ok: false, reason: "failure", message: error.message };
      //     if (this._resultCb) this._resultCb(result);
      //     reject(result);
      //   },
      //   onCancel: () => {
      //     const result = { ok: false, reason: "cancelled" };
      //     if (this._resultCb) this._resultCb(result);
      //     reject(result);
      //   },
      // });
      // this._client.open();

      // Placeholder so the module compiles without the real SDK:
      void session;
      reject(
        new Error(
          "PersonaLivenessAdapter is a stub. Complete the TODO blocks in " +
            "lib/verification/liveness/persona-adapter.js to go live."
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
      this._client?.cancel?.();
    } catch {
      // SDK may throw if not yet initialised — ignore.
    }
  }
}
