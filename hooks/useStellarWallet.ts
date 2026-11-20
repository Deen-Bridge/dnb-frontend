"use client";
import { useStellar } from "@/components/stellar/StellarProvider";

/**
 * Hook to access Stellar wallet functionality
 * Re-exports the useStellar context for convenience
 */
export const useStellarWallet = () => {
  return useStellar();
};

export default useStellarWallet;
