import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { buildVerifiedPaymentReceipt } from "@/lib/stellar/verifiedPaymentReceipt";
import { VerifiedReceipt } from "@/components/payment/VerifiedReceipt";

const VALID_HASH = "a".repeat(64);
const ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB";

describe("buildVerifiedPaymentReceipt & VerifiedReceipt (#589)", () => {
  it("marks receipt confirmed with amount, asset, issuer, ledger, and allowlisted explorer URL on testnet & mainnet, and preserves confirmation during refetch", () => {
    const testnetConfirmed = buildVerifiedPaymentReceipt({
      backendVerified: true,
      verificationStatus: "verified",
      txHash: VALID_HASH,
      network: "testnet",
      expectedNetwork: "testnet",
      ledgerSequence: 512340,
      ledgerTime: "2026-10-20T12:00:00Z",
      verifiedAt: "2026-10-20T12:00:02Z",
      amount: "45.00",
      assetCode: "USDC",
      assetIssuer: ISSUER,
    });
    expect(testnetConfirmed.state).toBe("verified_on_chain");
    expect(testnetConfirmed.isFinalConfirmation).toBe(true);
    expect(testnetConfirmed.amount).toBe("45.00");
    expect(testnetConfirmed.assetCode).toBe("USDC");
    expect(testnetConfirmed.assetIssuer).toBe(ISSUER);
    expect(testnetConfirmed.explorerUrl).toBe(
      `https://stellar.expert/explorer/testnet/tx/${VALID_HASH}`
    );

    const refetchingConfirmed = buildVerifiedPaymentReceipt({
      backendVerified: true,
      verificationStatus: "verified",
      txHash: VALID_HASH,
      network: "mainnet",
      expectedNetwork: "mainnet",
      ledgerSequence: 991234,
      amount: "100.00",
      assetCode: "USDC",
      assetIssuer: ISSUER,
      isLoading: true,
    });
    expect(refetchingConfirmed.state).toBe("verified_on_chain");
    expect(refetchingConfirmed.isFinalConfirmation).toBe(true);
    expect(refetchingConfirmed.amount).toBe("100.00");
    expect(refetchingConfirmed.assetCode).toBe("USDC");
    expect(refetchingConfirmed.assetIssuer).toBe(ISSUER);
    expect(refetchingConfirmed.explorerUrl).toBe(
      `https://stellar.expert/explorer/public/tx/${VALID_HASH}`
    );
  });

  it("never exposes a malformed txHash in pending or confirmed states", () => {
    const malformedPending = buildVerifiedPaymentReceipt({
      backendVerified: false,
      verificationStatus: "pending",
      txHash: "not-a-valid-64-char-hex-hash/../../phish",
      network: "testnet",
    });
    expect(malformedPending.state).toBe("pending_verification");
    expect(malformedPending.txHash).toBeNull();
    expect(malformedPending.explorerUrl).toBeNull();
  });

  it("collapses a failed backend verification into the failed state and strips confirmation data", () => {
    const failed = buildVerifiedPaymentReceipt({
      backendVerified: false,
      verificationStatus: "failed",
      txHash: VALID_HASH,
      network: "testnet",
      expectedNetwork: "testnet",
      ledgerSequence: 512340,
      amount: "45.00",
      assetCode: "USDC",
      assetIssuer: ISSUER,
    });
    expect(failed.state).toBe("failed_verification");
    expect(failed.statusLabel).toBe("Payment Verification Failed");
    expect(failed.isFinalConfirmation).toBe(false);
    expect(failed.txHash).toBeNull();
    expect(failed.ledgerSequence).toBeNull();
    expect(failed.explorerUrl).toBeNull();
    expect(failed.amount).toBeNull();
    expect(failed.ariaRole).toBe("alert");
    expect(failed.ariaLive).toBe("assertive");
  });

  it("reports a backend receipt network that disagrees with the active network as a mismatch", () => {
    const mismatched = buildVerifiedPaymentReceipt({
      backendVerified: true,
      verificationStatus: "verified",
      txHash: VALID_HASH,
      network: "testnet",
      expectedNetwork: "mainnet",
      ledgerSequence: 512340,
      amount: "45.00",
    });
    expect(mismatched.state).toBe("failed_verification");
    expect(mismatched.statusLabel).toBe("Network Mismatch — Verification Failed");
    expect(mismatched.isFinalConfirmation).toBe(false);
    expect(mismatched.network).toBeNull();
    expect(mismatched.networkBadge).toBe("Network Mismatch");
    expect(mismatched.explorerUrl).toBeNull();
    expect(mismatched.errorMessage).toBe(
      "Backend receipt network does not match active Stellar network"
    );
    expect(mismatched.ariaRole).toBe("alert");
  });

  it("renders accessible verified, pending, failed, mismatched-network, loading, and error states in VerifiedReceipt", () => {
    const { rerender } = render(
      <VerifiedReceipt
        evidence={{
          backendVerified: true,
          verificationStatus: "verified",
          txHash: VALID_HASH,
          network: "testnet",
          expectedNetwork: "testnet",
          ledgerSequence: 40010,
          ledgerTime: "2026-10-20T12:00:00Z",
          amount: "25.00",
          assetCode: "USDC",
          assetIssuer: ISSUER,
        }}
      />
    );
    expect(screen.getByText("Confirmed on Stellar Ledger")).toBeInTheDocument();
    expect(screen.getByText("Amount: 25.00 USDC")).toBeInTheDocument();
    expect(screen.getByText(`Issuer: ${ISSUER}`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view verified transaction/i })).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/testnet/tx/${VALID_HASH}`
    );

    rerender(
      <VerifiedReceipt
        evidence={{
          backendVerified: false,
          verificationStatus: "pending",
          txHash: VALID_HASH,
          network: "testnet",
          amount: "25.00",
          assetCode: "USDC",
        }}
      />
    );
    expect(screen.getByText("Pending Backend Ledger Verification")).toBeInTheDocument();
    expect(screen.queryByText("Amount: 25.00 USDC")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view verified transaction/i })).not.toBeInTheDocument();

    rerender(
      <VerifiedReceipt
        evidence={{
          backendVerified: false,
          isLoading: true,
          network: "testnet",
        }}
      />
    );
    expect(screen.getByLabelText("Payment receipt")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading Verification Status")).toBeInTheDocument();

    rerender(
      <VerifiedReceipt
        evidence={{
          backendVerified: false,
          verificationStatus: "failed",
          network: "testnet",
          errorMessage: "Transaction failed with op_underfunded",
        }}
      />
    );
    expect(screen.getAllByRole("alert")[0]).toBeInTheDocument();
    expect(screen.getByText("Payment Verification Failed")).toBeInTheDocument();
    expect(screen.getByText("Transaction failed with op_underfunded")).toBeInTheDocument();

    rerender(
      <VerifiedReceipt
        evidence={{
          backendVerified: true,
          verificationStatus: "verified",
          txHash: VALID_HASH,
          ledgerSequence: 40010,
          network: "testnet",
          expectedNetwork: "mainnet",
        }}
      />
    );
    expect(screen.getByText("Network Mismatch — Verification Failed")).toBeInTheDocument();
    expect(
      screen.getByText("Backend receipt network does not match active Stellar network")
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view verified transaction/i })).not.toBeInTheDocument();
  });

  it("does not fabricate a ledger sequence or explorer link for confirmed legacy props without ledgerSequence", () => {
    render(
      <VerifiedReceipt
        status="confirmed"
        hash={VALID_HASH}
        network="testnet"
        amount="15.00"
        asset="USDC"
      />
    );
    expect(screen.getByText("Pending Backend Ledger Verification")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view verified transaction/i })).not.toBeInTheDocument();
  });

  it("returns null when explorerUrl contains conflicting testnet and public markers", () => {
    expect(
      resolveBackendReceiptNetwork({
        explorerUrl: `https://stellar.expert/explorer/public/tx/${VALID_HASH}?network=testnet`,
      })
    ).toBeNull();
    expect(
      resolveBackendReceiptNetwork({
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${VALID_HASH}`,
      })
    ).toBe("testnet");
    expect(
      resolveBackendReceiptNetwork({
        explorerUrl: `https://stellar.expert/explorer/public/tx/${VALID_HASH}`,
      })
    ).toBe("mainnet");
  });
});
