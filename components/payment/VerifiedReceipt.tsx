"use client";

import React from "react";
import {
  buildVerifiedPaymentReceipt,
  type BackendVerificationStatus,
  type PaymentVerificationEvidence,
  type StellarPublicNetwork,
} from "@/lib/stellar/verifiedPaymentReceipt";

export type ReceiptStatus = "pending" | "confirmed" | "failed" | "unknown";

export interface VerifiedReceiptProps {
  evidence?: PaymentVerificationEvidence;
  status?: ReceiptStatus;
  amount?: string;
  asset?: string;
  issuer?: string;
  network?: string;
  expectedNetwork?: StellarPublicNetwork;
  hash?: string;
  ledgerSequence?: number;
  ledgerTime?: string;
  verifiedAt?: string;
  isLoading?: boolean;
  errorMessage?: string;
}

/**
 * Converts legacy status props into normalized `PaymentVerificationEvidence` when
 * `evidence` is not passed directly.
 *
 * @param props - Component props supplied to `VerifiedReceipt`.
 * @returns Normalized `PaymentVerificationEvidence` input for `buildVerifiedPaymentReceipt`.
 */
function toVerificationEvidence(props: VerifiedReceiptProps): PaymentVerificationEvidence {
  if (props.evidence) {
    return props.evidence;
  }
  const mappedStatus: BackendVerificationStatus =
    props.status === "confirmed"
      ? "verified"
      : props.status === "pending"
        ? "pending"
        : props.status === "failed"
          ? "failed"
          : "unknown";
  const normalizedNetwork: StellarPublicNetwork | null =
    props.network === "testnet" || props.network === "mainnet" ? props.network : null;

  return {
    backendVerified: props.status === "confirmed",
    verificationStatus: mappedStatus,
    amount: props.amount ?? null,
    assetCode: props.asset ?? "USDC",
    assetIssuer: props.issuer ?? null,
    network: normalizedNetwork,
    expectedNetwork: props.expectedNetwork ?? null,
    txHash: props.hash ?? null,
    ledgerSequence: props.ledgerSequence ?? null,
    ledgerTime: props.ledgerTime ?? null,
    verifiedAt: props.verifiedAt ?? null,
    isLoading: props.isLoading ?? false,
    errorMessage: props.errorMessage ?? null,
  };
}

/**
 * Reusable accessible Stellar payment receipt view backed by verified backend
 * transaction evidence (#589). Distinguishes confirmed, pending, failed, unknown,
 * loading, and mismatched-network responses without treating an unverified hash as settled.
 *
 * @param props - `VerifiedReceiptProps` carrying `evidence` or individual receipt fields.
 * @returns Accessible `<section>` element displaying the verified receipt state.
 */
export function VerifiedReceipt(props: VerifiedReceiptProps) {
  const receipt = buildVerifiedPaymentReceipt(toVerificationEvidence(props));

  return (
    <section
      aria-label="Payment receipt"
      aria-busy={receipt.isLoading}
      data-receipt-state={receipt.state}
      className="mt-4 rounded-lg border p-4 text-left text-sm space-y-2"
    >
      <div
        role={receipt.ariaRole}
        aria-live={receipt.ariaLive}
        className="flex items-center justify-between gap-2"
      >
        <strong>{receipt.statusLabel}</strong>
        <span className="text-xs text-muted-foreground">{receipt.networkBadge}</span>
      </div>

      {receipt.isLoading && (
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
          Refreshing verification status…
        </p>
      )}

      {receipt.errorMessage && (
        <p role="alert" className="text-xs text-red-600">
          {receipt.errorMessage}
        </p>
      )}

      {receipt.amount && (
        <p>
          Amount: {receipt.amount} {receipt.assetCode ?? "USDC"}
        </p>
      )}
      {receipt.assetIssuer && <p>Issuer: {receipt.assetIssuer}</p>}
      {receipt.network && <p>Network: {receipt.network}</p>}
      {receipt.txHash && <p className="break-all">Transaction: {receipt.txHash}</p>}
      {receipt.ledgerSequence !== null && <p>Ledger: #{receipt.ledgerSequence}</p>}
      {receipt.ledgerTime && <p>Ledger time: {receipt.ledgerTime}</p>}
      {receipt.verifiedAt && <p>Verified at: {receipt.verifiedAt}</p>}

      {receipt.explorerUrl && (
        <a
          href={receipt.explorerUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="inline-block text-primary underline"
        >
          View verified transaction
        </a>
      )}
    </section>
  );
}

export default VerifiedReceipt;
