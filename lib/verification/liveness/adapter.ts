export interface LivenessSession {
  userId: string;
  consentVersion?: string;
  consentAt?: number;
  timeoutMs?: number;
}

export interface VerificationSuccessResult {
  ok: true;
  token: string;
}

export interface VerificationErrorResult {
  ok: false;
  reason: "failure" | "timeout" | "cancelled" | string;
  message?: string;
}

export type VerificationResult = VerificationSuccessResult | VerificationErrorResult;

export abstract class LivenessAdapter {
  abstract start(session: LivenessSession): Promise<VerificationResult>;
  abstract onResult(cb: (result: VerificationResult) => void): void;
  abstract cancel(): void;
}
