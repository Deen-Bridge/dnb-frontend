import { describe, it, expect } from "vitest";
import { runTestnetPaymentHappyPath } from "@/lib/stellar/paymentJourneyHarness";

describe("Stellar testnet payment happy path journey (#105)", () => {
  it("transitions deterministically through connect -> initialize -> sign -> submit -> verified", () => {
    const steps = runTestnetPaymentHappyPath({
      walletPublicKey: "G" + "A".repeat(55),
      intentId: "intent_e2e_105",
      unsignedXdr: "AAAAAgAAAAB",
      txHash: "f".repeat(64),
    });
    expect(steps.map((s) => s.step)).toEqual([
      "disconnected",
      "wallet_connected",
      "intent_initialized",
      "xdr_signed",
      "submitted_verified",
    ]);
    expect(steps[4].txHash).toHaveLength(64);
  });
});
