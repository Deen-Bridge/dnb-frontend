import { StrKey } from "@stellar/stellar-sdk";

export function isValidStellarAddress(address?: string | null): boolean {
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

export function getExplorerUrl(publicKey: string, network: string = "testnet"): string {
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public/account/"
      : "https://stellar.expert/explorer/testnet/account/";
  return base + publicKey;
}

export function getExplorerTransactionUrl(txHash: string, network: string = "testnet"): string {
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public/tx/"
      : "https://stellar.expert/explorer/testnet/tx/";
  return base + txHash;
}
