export interface StoredPaymentIntentRef {
  intentId: string;
  sessionId: string;
  expiresAtMs: number;
}

export interface WalletCallbackParams {
  intentId: string;
  sessionId: string;
  callbackNonce: string;
  claimedStatus?: string;
}

export interface BackendIntentVerification {
  intentId: string;
  status: "pending" | "verified" | "failed" | "expired";
  txHash: string | null;
}

export class PaymentReturnFlowCoordinator {
  private processedCallbacks = new Set<string>();

  reconcileReturnCallback(
    stored: StoredPaymentIntentRef | null,
    callback: WalletCallbackParams,
    backendState: BackendIntentVerification,
    nowMs: number = Date.now()
  ): {
    accepted: boolean;
    duplicateCallback: boolean;
    resolvedStatus: "pending" | "verified" | "failed" | "expired" | "untrusted_callback";
    txHash: string | null;
  } {
    if (!stored || stored.intentId !== callback.intentId || stored.sessionId !== callback.sessionId) {
      return {
        accepted: false,
        duplicateCallback: false,
        resolvedStatus: "untrusted_callback",
        txHash: null,
      };
    }

    const dedupeKey = `${callback.intentId}:${callback.callbackNonce}`;
    const isDuplicate = this.processedCallbacks.has(dedupeKey);
    this.processedCallbacks.add(dedupeKey);

    if (nowMs > stored.expiresAtMs && backendState.status !== "verified") {
      return {
        accepted: false,
        duplicateCallback: isDuplicate,
        resolvedStatus: "expired",
        txHash: null,
      };
    }

    return {
      accepted: backendState.status === "verified",
      duplicateCallback: isDuplicate,
      resolvedStatus: backendState.status,
      txHash: backendState.status === "verified" ? backendState.txHash : null,
    };
  }
}
