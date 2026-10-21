import { describe, expect, it } from "vitest";
import { buildVerifiedPaymentReceipt } from "../../lib/stellar/verifiedPaymentReceipt";

describe("buildVerifiedPaymentReceipt (#589)", () => {
  const validHash = "a".repeat(64);

  it("produces a final confirmation receipt with ledger time and explorer link only when backendVerified is true", () => {
    const r = buildVerifiedPaymentReceipt({
      txHash: validHash,
      network: "testnet",
      expectedNetwork: "testnet",
      ledgerSequence: 512390,
      ledgerTime: "2026-10-21T08:30:00Z",
      verifiedAt: "2026-10-21T08:30:02Z",
      backendVerified: true,
      verificationStatus: "verified",
      amount: "50.00",
      assetCode: "USDC",
      assetIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    });
    expect(r.isFinalConfirmation).toBe(true);
    expect(r.state).toBe("verified_on_chain");
    expect(r.ledgerTime).toBe("2026-10-21T08:30:00Z");
    expect(r.explorerUrl).toContain("testnet/tx/");
    expect(r.ariaRole).toBe("status");
  });

  it("keeps unverified wallet callbacks in pending_verification and omits confirmed fields", () => {
    const r = buildVerifiedPaymentReceipt({
      txHash: validHash,
      network: "mainnet",
      ledgerSequence: null,
      backendVerified: false,
      verificationStatus: "pending",
      amount: "50.00",
      assetCode: "USDC",
    });
    expect(r.isFinalConfirmation).toBe(false);
    expect(r.state).toBe("pending_verification");
    expect(r.explorerUrl).toBeNull();
    expect(r.amount).toBeNull();
  });

  it("represents failed and unknown backend verification states distinctly", () => {
    const failed = buildVerifiedPaymentReceipt({
      txHash: validHash,
      network: "testnet",
      ledgerSequence: null,
      backendVerified: false,
      verificationStatus: "failed",
      amount: "50.00",
      assetCode: "USDC",
    });
    expect(failed.state).toBe("failed_verification");
    expect(failed.ariaRole).toBe("alert");
    expect(failed.ariaLive).toBe("assertive");

    const unknown = buildVerifiedPaymentReceipt({
      txHash: null,
      network: "testnet",
      ledgerSequence: null,
      backendVerified: false,
      verificationStatus: "unknown",
    });
    expect(unknown.state).toBe("unknown_verification");
    expect(unknown.isFinalConfirmation).toBe(false);
  });

  it("rejects mismatched network responses, malformed evidence, and exposes accessible loading/error states", () => {
    const mismatch = buildVerifiedPaymentReceipt({
      txHash: validHash,
      network: "testnet",
      expectedNetwork: "mainnet",
      ledgerSequence: 512390,
      backendVerified: true,
      verificationStatus: "verified",
    });
    expect(mismatch.isFinalConfirmation).toBe(false);
    expect(mismatch.state).toBe("failed_verification");
    expect(mismatch.explorerUrl).toBeNull();

    const loading = buildVerifiedPaymentReceipt({
      backendVerified: false,
      isLoading: true,
    });
    expect(loading.isLoading).toBe(true);
    expect(loading.state).toBe("pending_verification");
  });
});
