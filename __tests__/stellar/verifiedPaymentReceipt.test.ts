import { describe, it, expect } from "vitest";
import { buildVerifiedPaymentReceipt } from "@/lib/stellar/verifiedPaymentReceipt";

describe("buildVerifiedPaymentReceipt (#589)", () => {
  it("distinguishes backend-verified ledger settlement from unverified wallet callbacks", () => {
    const confirmed = buildVerifiedPaymentReceipt({
      intentId: "intent_1",
      amount: "25.00",
      assetCode: "USDC",
      assetIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      network: "testnet",
      txHash: "a".repeat(64),
      ledgerSequence: 512340,
      backendVerified: true,
      verifiedAt: "2026-10-21T08:00:00Z",
    });
    expect(confirmed.displayState).toBe("verified_on_chain");
    expect(confirmed.ledgerSequence).toBe(512340);
    expect(confirmed.explorerUrl).toContain("stellar.expert/explorer/testnet/tx/");

    const callbackOnly = buildVerifiedPaymentReceipt({
      intentId: "intent_2",
      amount: "25.00",
      assetCode: "USDC",
      assetIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
      network: "testnet",
      txHash: "b".repeat(64),
      ledgerSequence: null,
      backendVerified: false,
      verifiedAt: null,
    });
    expect(callbackOnly.displayState).toBe("pending_verification");
    expect(callbackOnly.explorerUrl).toBeNull();
  });
});
