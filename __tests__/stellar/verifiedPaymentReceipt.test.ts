import { describe, it, expect } from "vitest";
import { buildVerifiedPaymentReceipt } from "@/lib/stellar/verifiedPaymentReceipt";

const VALID_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

describe("buildVerifiedPaymentReceipt (#589)", () => {
  it("distinguishes confirmed, pending, failed, and unknown states with strict hex txHash validation", () => {
    const confirmed = buildVerifiedPaymentReceipt({
      intentId: "intent_1",
      amount: "25.00",
      assetCode: "USDC",
      assetIssuer: VALID_ISSUER,
      network: "testnet",
      txHash: "A".repeat(64),
      ledgerSequence: 512340,
      backendVerified: true,
      backendStatus: "confirmed",
      verifiedAt: "2026-10-21T08:00:00Z",
    });
    expect(confirmed.displayState).toBe("verified_on_chain");
    expect(confirmed.ledgerSequence).toBe(512340);
    expect(confirmed.verifiedAt).toBe("2026-10-21T08:00:00Z");
    expect(confirmed.explorerUrl).toBe(
      `https://stellar.expert/explorer/testnet/tx/${"a".repeat(64)}`
    );

    const pending = buildVerifiedPaymentReceipt({
      intentId: "intent_2",
      amount: "25.00",
      assetCode: "USDC",
      assetIssuer: VALID_ISSUER,
      network: "testnet",
      txHash: "b".repeat(64),
      ledgerSequence: null,
      backendVerified: false,
      backendStatus: "pending",
      verifiedAt: null,
    });
    expect(pending.displayState).toBe("pending_verification");
    expect(pending.explorerUrl).toBeNull();

    const failed = buildVerifiedPaymentReceipt({
      intentId: "intent_3",
      amount: "25.00",
      assetCode: "USDC",
      assetIssuer: VALID_ISSUER,
      network: "testnet",
      txHash: "c".repeat(64),
      ledgerSequence: null,
      backendVerified: false,
      backendStatus: "failed",
      verifiedAt: null,
    });
    expect(failed.displayState).toBe("failed_verification");
    expect(failed.explorerUrl).toBeNull();

    const malformedHash = buildVerifiedPaymentReceipt({
      intentId: "intent_4",
      amount: "25.00",
      assetCode: "USDC",
      assetIssuer: VALID_ISSUER,
      network: "testnet",
      txHash: "z".repeat(64),
      ledgerSequence: 512340,
      backendVerified: true,
      backendStatus: "confirmed",
      verifiedAt: "2026-10-21T08:00:00Z",
    });
    expect(malformedHash.displayState).toBe("unknown_verification");
    expect(malformedHash.txHash).toBeNull();
  });
});
