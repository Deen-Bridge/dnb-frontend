export interface VerifiedPaymentEvidence {
  intentId: string;
  amount: string;
  assetCode: string;
  assetIssuer: string;
  network: "testnet" | "mainnet";
  txHash: string | null;
  ledgerSequence: number | null;
  backendVerified: boolean;
  verifiedAt: string | null;
}

export interface PaymentReceiptModel {
  intentId: string;
  displayState: "verified_on_chain" | "pending_verification" | "unverified_attempt";
  badgeLabel: string;
  amountLabel: string;
  assetCode: string;
  assetIssuerShort: string;
  networkLabel: string;
  txHash: string | null;
  ledgerSequence: number | null;
  explorerUrl: string | null;
}

export function buildVerifiedPaymentReceipt(
  evidence: VerifiedPaymentEvidence
): PaymentReceiptModel {
  const issuer = evidence.assetIssuer.trim();
  const issuerShort =
    issuer.length > 12 ? `${issuer.slice(0, 6)}...${issuer.slice(-4)}` : issuer;
  const isConfirmed =
    evidence.backendVerified &&
    Boolean(evidence.txHash && evidence.txHash.length === 64) &&
    typeof evidence.ledgerSequence === "number" &&
    evidence.ledgerSequence > 0;

  const explorerBase =
    evidence.network === "mainnet"
      ? "https://stellar.expert/explorer/public/tx"
      : "https://stellar.expert/explorer/testnet/tx";

  return {
    intentId: evidence.intentId,
    displayState: isConfirmed
      ? "verified_on_chain"
      : evidence.txHash
        ? "pending_verification"
        : "unverified_attempt",
    badgeLabel: isConfirmed
      ? "Confirmed on Stellar Ledger"
      : evidence.txHash
        ? "Submitted — Awaiting Ledger Confirmation"
        : "Attempted — Not Yet Broadcast",
    amountLabel: `${evidence.amount} ${evidence.assetCode}`,
    assetCode: evidence.assetCode,
    assetIssuerShort: issuerShort,
    networkLabel: evidence.network === "mainnet" ? "Stellar Mainnet" : "Stellar Testnet",
    txHash: evidence.txHash,
    ledgerSequence: isConfirmed ? evidence.ledgerSequence : null,
    explorerUrl: isConfirmed && evidence.txHash ? `${explorerBase}/${evidence.txHash}` : null,
  };
}
