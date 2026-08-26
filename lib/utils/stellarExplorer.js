import { StrKey } from "@stellar/stellar-sdk";

/**
 * Shared Stellar explorer URL builders and address validators.
 *
 * stellar.expert hosts separate explorers for the public (mainnet) and test
 * networks. Every user-facing deep link into the chain goes through here so
 * the network branch lives in exactly one place.
 */

/**
 * Validate standard Stellar public key address format (G... 56 characters).
 * @param {string} address
 * @returns {boolean}
 */
export function isValidStellarAddress(address) {
  if (!address || typeof address !== "string") return false;
  const trimmed = address.trim();
  try {
    if (StrKey && typeof StrKey.isValidEd25519PublicKey === "function") {
      return StrKey.isValidEd25519PublicKey(trimmed);
    }
  } catch {
    // Fallback regex if StrKey check throws or fails
  }
  return /^[G][A-Z2-7]{55}$/.test(trimmed);
}

/**
 * Build the stellar.expert URL for an account on the configured network.
 * @param {string} publicKey - Stellar account address (G...).
 * @param {"testnet"|"mainnet"} [network] - Network to deep-link into.
 */
export function getExplorerUrl(publicKey, network = "testnet") {
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public/account/"
      : "https://stellar.expert/explorer/testnet/account/";
  return base + publicKey;
}

/**
 * Build the stellar.expert URL for a transaction hash on the configured
 * network.
 * @param {string} txHash - Transaction hash to deep-link into.
 * @param {"testnet"|"mainnet"} [network] - Network to deep-link into.
 */
export function getExplorerTransactionUrl(txHash, network = "testnet") {
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public/tx/"
      : "https://stellar.expert/explorer/testnet/tx/";
  return base + txHash;
}