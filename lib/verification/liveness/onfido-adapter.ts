import { LivenessAdapter, LivenessSession, VerificationResult } from "./adapter";

export class OnfidoLivenessAdapter extends LivenessAdapter {
  private _resultCb: ((result: VerificationResult) => void) | null;
  private _onfidoInstance: any; // TODO(types): Vendor Onfido SDK instance

  constructor() {
    super();
    this._resultCb = null;
    this._onfidoInstance = null;
  }

  async start(session: LivenessSession): Promise<VerificationResult> {
    return new Promise((resolve, reject) => {
      void session;
      reject(
        new Error(
          "OnfidoLivenessAdapter is a stub. Complete the TODO blocks in " +
            "lib/verification/liveness/onfido-adapter.ts to go live."
        )
      );
    });
  }

  onResult(cb: (result: VerificationResult) => void): void {
    if (typeof cb !== "function") {
      throw new TypeError("onResult: cb must be a function");
    }
    this._resultCb = cb;
  }

  cancel(): void {
    try {
      this._onfidoInstance?.tearDown?.();
    } catch {
      // SDK may throw if not yet initialised — ignore.
    }
  }
}
