import { LivenessAdapter, LivenessSession, VerificationResult } from "./adapter";

export class PersonaLivenessAdapter extends LivenessAdapter {
  private _resultCb: ((result: VerificationResult) => void) | null;
  private _client: any; // TODO(types): Vendor Persona SDK client instance

  constructor() {
    super();
    this._resultCb = null;
    this._client = null;
  }

  async start(session: LivenessSession): Promise<VerificationResult> {
    return new Promise((resolve, reject) => {
      void session;
      reject(
        new Error(
          "PersonaLivenessAdapter is a stub. Complete the TODO blocks in " +
            "lib/verification/liveness/persona-adapter.ts to go live."
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
      this._client?.cancel?.();
    } catch {
      // SDK may throw if not yet initialised — ignore.
    }
  }
}
