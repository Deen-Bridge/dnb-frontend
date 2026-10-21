export type BackendVerificationStatus =
  | "confirmed"
  | "pending"
  | "failed"
  | "unknown";

export interface VerifiedPaymentEvidence {
  intentId: string;
  amount: string;
  assetCode: string;
  assetIssuer: string;
  network: "testnet" | "mainnet";
  txHash: string | null;
  ledgerSequence: number | null;
  backendVerified: boolean;
  backendStatus?: BackendVerificationStatus;
  verifiedAt: string | null;
}

export type ReceiptDisplayState =
  | "verified_on_chain"
  | "pending_verification"
  | "failed_verification"
  | "unknown_verification";

export interface PaymentReceiptModel {
  intentId: string;
  displayState: ReceiptDisplayState;
  badgeLabel: string;
  amountLabel: string;
  assetCode: string;
  assetIssuerShort: string;
  networkLabel: string;
  txHash: string | null;
  ledgerSequence: number | null;
  verifiedAt: string | null;
  explorerUrl: string | null;
}

const HEX_TX_HASH_RE = /^[0-9a-f]{64}$/i;
const STELLAR_ISSUER_RE = /^G[A-Z2-7]{55}$/;

export function buildVerifiedPaymentReceipt(
  evidence: VerifiedPaymentEvidence
): PaymentReceiptModel {
  const issuer = evidence.assetIssuer.trim().toUpperCase();
  const validIssuer = STELLAR_ISSUER_RE.test(issuer);
  const issuerShort = validIssuer
    ? `${issuer.slice(0, 6)}...${issuer.slice(-4)}`
    : "UNVERIFIED_ISSUER";

  const rawHash = evidence.txHash ? evidence.txHash.trim() : "";
  const normalizedTxHash = HEX_TX_HASH_RE.test(rawHash)
    ? rawHash.toLowerCase()
    : null;

  const numericAmount = Number(evidence.amount);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const validAssetCode = evidence.assetCode.trim().toUpperCase() === "USDC";

  const effectiveStatus: BackendVerificationStatus =
    evidence.backendStatus ??
    (evidence.backendVerified
      ? "confirmed"
      : normalizedTxHash
        ? "pending"
        : "unknown");

  const isConfirmed =
    effectiveStatus === "confirmed" &&
    evidence.backendVerified &&
    validAmount &&
    validAssetCode &&
    validIssuer &&
    Boolean(normalizedTxHash) &&
    typeof evidence.ledgerSequence === "number" &&
    Number.isInteger(evidence.ledgerSequence) &&
    evidence.ledgerSequence > 0;

  let displayState: ReceiptDisplayState;
  let badgeLabel: string;

  if (effectiveStatus === "failed") {
    displayState = "failed_verification";
    badgeLabel = "Payment Failed — Ledger Verification Rejected";
  } else if (isConfirmed) {
    displayState = "verified_on_chain";
    badgeLabel = "Confirmed on Stellar Ledger";
  } else if (effectiveStatus === "pending" && normalizedTxHash) {
    displayState = "pending_verification";
    badgeLabel = "Submitted — Awaiting Ledger Confirmation";
  } else {
    displayState = "unknown_verification";
    badgeLabel = "Unverified — No Confirmed Settlement Record";
  }

  const explorerBase =
    evidence.network === "mainnet"
      ? "https://stellar.expert/explorer/public/tx"
      : "https://stellar.expert/explorer/testnet/tx";

  return {
    intentId: evidence.intentId,
    displayState,
    badgeLabel,
    amountLabel: `${evidence.amount} ${evidence.assetCode}`,
    assetCode: evidence.assetCode,
    assetIssuerShort: issuerShort,
    networkLabel:
      evidence.network === "mainnet" ? "Stellar Mainnet" : "Stellar Testnet",
    txHash: normalizedTxHash,
    ledgerSequence: isConfirmed ? evidence.ledgerSequence : null,
    verifiedAt: isConfirmed ? evidence.verifiedAt : null,
    explorerUrl:
      isConfirmed && normalizedTxHash
        ? `${explorerBase}/${normalizedTxHash}`
        : null,
  };
}
