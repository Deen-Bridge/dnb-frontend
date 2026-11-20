import { describe, it, expect } from "vitest";
import { CheckoutSubmissionController } from "@/lib/stellar/checkoutSubmissionGuard";

describe("CheckoutSubmissionController (#563)", () => {
  it("prevents repeated clicks from creating duplicate active intents and handles wallet cancellation safely", () => {
    const ctrl = new CheckoutSubmissionController(60_000);
    const first = ctrl.beginSubmission("intent_a", 1_000);
    const duplicateClick = ctrl.beginSubmission("intent_b", 1_200);

    expect(first.started).toBe(true);
    expect(duplicateClick.started).toBe(false);
    expect(duplicateClick.attempt.clientIntentId).toBe("intent_a");

    const cancelled = ctrl.handleWalletCancel();
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.verifiedTxHash).toBeNull();
  });
});
