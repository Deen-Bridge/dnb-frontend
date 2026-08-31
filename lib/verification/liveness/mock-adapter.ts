import { LivenessAdapter, LivenessSession, VerificationResult } from "./adapter";

const MOCK_TOKEN_PREFIX = "mock_liveness_token_";

function generateMockToken(userId?: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const tag = userId ? `_${userId.slice(-4)}` : "";
  return `${MOCK_TOKEN_PREFIX}${ts}_${rand}${tag}`;
}

export interface MockLivenessAdapterOptions {
  outcome?: "success" | "failure" | "timeout" | "cancelled";
  delayMs?: number;
}

export class MockLivenessAdapter extends LivenessAdapter {
  private _outcome: "success" | "failure" | "timeout" | "cancelled";
  private _delayMs: number;
  private _resultCb: ((result: VerificationResult) => void) | null;
  private _timerId: NodeJS.Timeout | null;
  private _cancelled: boolean;
  private _pendingReject: (() => void) | null;

  constructor({ outcome = "success", delayMs = 1500 }: MockLivenessAdapterOptions = {}) {
    super();
    this._outcome = outcome;
    this._delayMs = delayMs;
    this._resultCb = null;
    this._timerId = null;
    this._cancelled = false;
    this._pendingReject = null;
  }

  start(session: LivenessSession): Promise<VerificationResult> {
    this._cancelled = false;

    return new Promise((resolve, reject) => {
      const finish = (result: VerificationResult) => {
        if (this._resultCb) this._resultCb(result);
        if (result.ok) {
          resolve(result);
        } else {
          reject(result);
        }
      };

      if (this._outcome === "timeout") {
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
          finish({
            ok: true,
            token: generateMockToken(session?.userId),
          });
        }
      }, this._delayMs);
    });
  }

  onResult(cb: (result: VerificationResult) => void): void {
    if (typeof cb !== "function") {
      throw new TypeError("onResult: cb must be a function");
    }
    this._resultCb = cb;
  }

  cancel(): void {
    this._cancelled = true;
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
    if (this._pendingReject) {
      const fn = this._pendingReject;
      this._pendingReject = null;
      fn();
    }
  }
}
