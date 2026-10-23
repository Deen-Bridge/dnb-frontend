export type StellarPublicNetwork = "testnet" | "mainnet";

export type PaymentReceiptState =
  | "verified_on_chain"
  | "pending_verification"
  | "failed_verification"
  | "unknown_verification"
  | "unverified_attempt";

export type BackendVerificationStatus =
  | "verified"
  | "pending"
  | "failed"
  | "unknown";

export interface PaymentVerificationEvidence {
  txHash?: string | null;
  network?: StellarPublicNetwork | null;
  expectedNetwork?: StellarPublicNetwork | null;
  ledgerSequence?: number | null;
  ledgerTime?: string | null;
  verifiedAt?: string | null;
  backendVerified: boolean;
  verificationStatus?: BackendVerificationStatus;
  amount?: string | null;
  assetCode?: string | null;
  assetIssuer?: string | null;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export interface VerifiedPaymentReceipt {
  state: PaymentReceiptState;
  statusLabel: string;
  network: StellarPublicNetwork | null;
  networkBadge: string;
  txHash: string | null;
  ledgerSequence: number | null;
  ledgerTime: string | null;
  verifiedAt: string | null;
  explorerUrl: string | null;
  amount: string | null;
  assetCode: string | null;
  assetIssuer: string | null;
  isFinalConfirmation: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  ariaRole: "status" | "alert";
  ariaLive: "polite" | "assertive";
}

const EXPLORER_BASE: Record<StellarPublicNetwork, string> = {
  testnet: "https://stellar.expert/explorer/testnet/tx/",
  mainnet: "https://stellar.expert/explorer/public/tx/",
};

const VALID_STELLAR_TX_HASH = /^[0-9a-fA-F]{64}$/;

/**
 * Validates whether a transaction hash is a canonical 64-character hexadecimal Stellar hash.
 *
 * @param hash - Candidate transaction hash from backend or callback evidence.
 * @returns True when the trimmed hash matches a 64-character hex digest.
 */
export function isValidStellarTxHash(hash: string | null | undefined): boolean {
  return typeof hash === "string" && VALID_STELLAR_TX_HASH.test(hash.trim());
}

/**
 * Validates whether a ledger sequence number is a positive safe integer.
 *
 * @param seq - Candidate ledger sequence number from backend verification.
 * @returns True when the sequence is a positive safe integer.
 */
export function isValidLedgerSequence(seq: number | null | undefined): seq is number {
  return typeof seq === "number" && Number.isSafeInteger(seq) && seq > 0;
}

/**
 * Builds a public Stellar payment receipt from backend verification evidence,
 * enforcing network consistency, ledger/hash validity, and accessible UI state semantics.
 *
 * @param evidence - Backend verification evidence and optional UI loading/error state.
 * @returns Normalized VerifiedPaymentReceipt for confirmed, pending, failed, or unknown states.
 */
export function buildVerifiedPaymentReceipt(
  evidence: PaymentVerificationEvidence,
): VerifiedPaymentReceipt {
  const rawHash = evidence.txHash?.trim() || null;
  const validHash = isValidStellarTxHash(rawHash) ? rawHash : null;
  const validLedger = isValidLedgerSequence(evidence.ledgerSequence)
    ? evidence.ledgerSequence
    : null;
  const network =
    evidence.network === "testnet" || evidence.network === "mainnet"
      ? evidence.network
      : null;
  const networkMismatch =
    Boolean(evidence.expectedNetwork) &&
    Boolean(network) &&
    evidence.expectedNetwork !== network;

  const isLoading = Boolean(evidence.isLoading);
  const errorMessage = evidence.errorMessage?.trim() || null;

  const status: BackendVerificationStatus =
    evidence.verificationStatus ??
    (evidence.backendVerified
      ? "verified"
      : rawHash
        ? "pending"
        : "unknown");

  // Keep an established confirmation visible during a background refetch unless
  // failure, error, or network-mismatch signals supersede it.
  const isConfirmed =
    !errorMessage &&
    !networkMismatch &&
    evidence.backendVerified &&
    status === "verified" &&
    Boolean(validHash) &&
    validLedger !== null &&
    network !== null;

  let state: PaymentReceiptState;
  let statusLabel: string;
  if (networkMismatch || status === "failed" || errorMessage) {
    state = "failed_verification";
    statusLabel = networkMismatch
      ? "Network Mismatch — Verification Failed"
      : "Payment Verification Failed";
  } else if (isConfirmed) {
    state = "verified_on_chain";
    statusLabel = "Confirmed on Stellar Ledger";
  } else if (isLoading) {
    state = "pending_verification";
    statusLabel = "Loading Verification Status";
  } else if (
    status === "pending" ||
    (status === "verified" && (Boolean(rawHash) || validLedger !== null))
  ) {
    state = "pending_verification";
    statusLabel = "Pending Backend Ledger Verification";
  } else if (status === "unknown") {
    state = "unknown_verification";
    statusLabel = "Verification Status Unknown";
  } else {
    state = "unverified_attempt";
    statusLabel = "Unverified Payment Attempt";
  }

  const networkBadge =
    network === "mainnet"
      ? "Stellar Mainnet"
      : network === "testnet"
        ? "Stellar Testnet"
        : "Unknown Network";

  const isFailureState = state === "failed_verification";

  return {
    state,
    statusLabel,
    network: networkMismatch ? null : network,
    networkBadge: networkMismatch ? "Network Mismatch" : networkBadge,
    txHash: isConfirmed ? validHash : state === "pending_verification" ? validHash : null,
    ledgerSequence: isConfirmed ? validLedger : null,
    ledgerTime: isConfirmed ? evidence.ledgerTime?.trim() || null : null,
    verifiedAt: isConfirmed ? evidence.verifiedAt?.trim() || null : null,
    explorerUrl: isConfirmed && validHash && network ? `${EXPLORER_BASE[network]}${validHash}` : null,
    amount: isConfirmed ? evidence.amount?.trim() || null : null,
    assetCode: isConfirmed ? evidence.assetCode?.trim() || null : null,
    assetIssuer: isConfirmed ? evidence.assetIssuer?.trim() || null : null,
    isFinalConfirmation: isConfirmed,
    isLoading,
    errorMessage: networkMismatch
      ? errorMessage ?? "Backend receipt network does not match active Stellar network"
      : errorMessage,
    ariaRole: isFailureState ? "alert" : "status",
    ariaLive: isFailureState ? "assertive" : "polite",
  };
}
