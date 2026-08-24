/**
 * Shared Stellar explorer URL builders.
 *
 * stellar.expert hosts separate explorers for the public (mainnet) and test
 * networks. Every user-facing deep link into the chain goes through here so
 * the network branch lives in exactly one place.
 */

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