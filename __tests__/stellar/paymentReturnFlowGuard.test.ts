import { describe, it, expect } from "vitest";
import { PaymentReturnFlowCoordinator } from "@/lib/stellar/paymentReturnFlowGuard";

describe("PaymentReturnFlowCoordinator (#567)", () => {
  it("ignores spoofed query params and reconciles reload/duplicate callbacks with backend state", () => {
    const coord = new PaymentReturnFlowCoordinator();
    const stored = {
      intentId: "intent_567",
      sessionId: "sess_abc",
      expiresAtMs: 2_000_000,
    };

    const first = coord.reconcileReturnCallback(
      stored,
      { intentId: "intent_567", sessionId: "sess_abc", callbackNonce: "n1", claimedStatus: "success" },
      { intentId: "intent_567", status: "pending", txHash: null },
      1_500_000
    );
    expect(first.accepted).toBe(false);
    expect(first.resolvedStatus).toBe("pending");
    expect(first.duplicateCallback).toBe(false);

    const reload = coord.reconcileReturnCallback(
      stored,
      { intentId: "intent_567", sessionId: "sess_abc", callbackNonce: "n1", claimedStatus: "success" },
      { intentId: "intent_567", status: "verified", txHash: "c".repeat(64) },
      1_500_100
    );
    expect(reload.accepted).toBe(true);
    expect(reload.duplicateCallback).toBe(true);
    expect(reload.resolvedStatus).toBe("verified");
  });
});
