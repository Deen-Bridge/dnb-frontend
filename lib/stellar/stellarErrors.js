/**
 * Reusable Stellar error mapping utility.
 * Maps raw SDK/operation errors to human-readable messages with next-step guidance.
 */

const STELLAR_ERRORS = {
  op_no_trust: {
    title: "USDC Trustline Required",
    message: "Your wallet doesn't have a USDC trustline set up.",
    nextStep: "Open your wallet and add the USDC asset before making payments.",
    type: "trustline",
  },
  op_underfunded: {
    title: "Insufficient Balance",
    message: "You don't have enough USDC to complete this transaction.",
    nextStep: "Add more USDC to your wallet and try again.",
    type: "balance",
  },
  op_no_destination: {
    title: "Invalid Recipient",
    message: "The recipient account doesn't exist on Stellar.",
    nextStep: "This is a platform issue. Please contact support.",
    type: "unknown",
  },
  op_low_reserve: {
    title: "Insufficient XLM Reserve",
    message: "Your account doesn't have enough XLM to cover the base reserve.",
    nextStep: "Add more XLM to your wallet for transaction fees.",
    type: "balance",
  },
  tx_bad_auth: {
    title: "Authentication Failed",
    message: "The transaction signature doesn't match.",
    nextStep: "Try reconnecting your wallet and signing again.",
    type: "auth",
  },
  tx_bad_seq: {
    title: "Transaction Sequence Error",
    message: "The transaction sequence number doesn't match your account.",
    nextStep: "Refresh your wallet and try the payment again.",
    type: "sequence",
  },
  tx_insufficient_fee: {
    title: "Insufficient Fee",
    message: "The transaction fee is too low.",
    nextStep: "The platform will handle fees. Please try again.",
    type: "fee",
  },
  tx_not_supported: {
    title: "Transaction Not Supported",
    message: "This transaction type is not supported.",
    nextStep: "Please contact support.",
    type: "unknown",
  },
};

const WALLET_ERRORS = {
  user_rejected: {
    title: "Transaction Cancelled",
    message: "You declined the signing request in your wallet.",
    nextStep: "No action needed. Your wallet is safe.",
    type: "reject",
  },
  wallet_not_installed: {
    title: "No Wallet Found",
    message: "No Stellar wallet extension detected in your browser.",
    nextStep: "Install Freighter to get started.",
    type: "no_wallet",
  },
  network_mismatch: {
    title: "Wrong Network",
    message: "Your wallet is on a different network than DeenBridge.",
    nextStep: "Switch your wallet to testnet (or mainnet) and try again.",
    type: "network",
  },
  trustline_missing: {
    title: "USDC Trustline Missing",
    message: "You need to add a USDC trustline before making payments.",
    nextStep: "Open your wallet, go to assets, and add the USDC token.",
    type: "trustline",
  },
  insufficient_balance: {
    title: "Insufficient USDC",
    message: "Your USDC balance is too low for this purchase.",
    nextStep: "Add USDC to your wallet and try again.",
    type: "balance",
  },
};

const WALLET_INSTALL_LINKS = {
  freighter: {
    name: "Freighter",
    url: "https://www.freighter.app/",
    description: "The most popular Stellar wallet browser extension",
  },
  xbull: {
    name: "xBull",
    url: "https://xbull.app/",
    description: "A secure Stellar wallet",
  },
  albedo: {
    name: "Albedo",
    url: "https://albedo.link/",
    description: "Web-based Stellar wallet (no extension needed)",
  },
};

/**
 * Map a raw error string/code to a user-friendly Stellar error object.
 */
export function mapStellarError(rawError) {
  if (!rawError) return null;

  const errorStr = typeof rawError === "string" ? rawError : rawError.message || "";

  // Check Stellar operation errors
  for (const [code, mapped] of Object.entries(STELLAR_ERRORS)) {
    if (errorStr.includes(code)) {
      return mapped;
    }
  }

  // Check wallet/signing errors
  if (
    errorStr.includes("rejected") ||
    errorStr.includes("cancelled") ||
    errorStr.includes("declined") ||
    errorStr.includes("denied")
  ) {
    return WALLET_ERRORS.user_rejected;
  }

  if (errorStr.includes("insufficient") || errorStr.includes("underfunded")) {
    return WALLET_ERRORS.insufficient_balance;
  }

  if (errorStr.includes("op_no_trust") || errorStr.includes("trustline")) {
    return WALLET_ERRORS.trustline_missing;
  }

  if (errorStr.includes("network") || errorStr.includes("mismatch")) {
    return WALLET_ERRORS.network_mismatch;
  }

  return null;
}

/**
 * Check if a StellarKit auth modal error means no wallet was found.
 */
export function isNoWalletError(error) {
  if (!error) return false;
  const msg = typeof error === "string" ? error : error.message || "";
  return (
    msg.includes("no wallet") ||
    msg.includes("no extension") ||
    msg.includes("not installed") ||
    msg.includes("undefined") ||
    msg.includes("Cannot read") ||
    error.code === -1
  );
}

/**
 * Check if a signing error means the user rejected/cancelled.
 */
export function isUserRejection(error) {
  if (!error) return false;
  const msg = typeof error === "string" ? error : error.message || "";
  return (
    msg.includes("rejected") ||
    msg.includes("cancelled") ||
    msg.includes("declined") ||
    msg.includes("denied") ||
    msg.includes("User declined") ||
    error.code === 4001 ||
    error.code === -1
  );
}

export { STELLAR_ERRORS, WALLET_ERRORS, WALLET_INSTALL_LINKS };
