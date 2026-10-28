export type CheckoutIntentStatus =
  | "idle"
  | "signing"
  | "broadcasting"
  | "cancelled"
  | "stale"
  | "completed_verified";

export interface CheckoutAttemptRecord {
  clientIntentId: string;
  status: CheckoutIntentStatus;
  createdAtMs: number;
  verifiedTxHash: string | null;
}

export class CheckoutSubmissionController {
  private activeAttempt: CheckoutAttemptRecord | null = null;
  private readonly staleThresholdMs: number;

  constructor(staleThresholdMs: number = 180_000) {
    this.staleThresholdMs = staleThresholdMs;
  }

  beginSubmission(clientIntentId: string, nowMs: number = Date.now()): {
    started: boolean;
    attempt: CheckoutAttemptRecord;
  } {
    if (
      this.activeAttempt &&
      (this.activeAttempt.status === "signing" ||
        this.activeAttempt.status === "broadcasting") &&
      nowMs - this.activeAttempt.createdAtMs <= this.staleThresholdMs
    ) {
      return { started: false, attempt: this.activeAttempt };
    }

    this.activeAttempt = {
      clientIntentId,
      status: "signing",
      createdAtMs: nowMs,
      verifiedTxHash: null,
    };
    return { started: true, attempt: this.activeAttempt };
  }

  handleWalletCancel(): CheckoutAttemptRecord | null {
    if (!this.activeAttempt) return null;
    this.activeAttempt = {
      ...this.activeAttempt,
      status: "cancelled",
      verifiedTxHash: null,
    };
    return this.activeAttempt;
  }

  reconcileBackendConfirmation(txHash: string | null, verified: boolean): CheckoutAttemptRecord | null {
    if (!this.activeAttempt) return null;
    if (verified && txHash) {
      this.activeAttempt = {
        ...this.activeAttempt,
        status: "completed_verified",
        verifiedTxHash: txHash,
      };
    }
    return this.activeAttempt;
  }
}
