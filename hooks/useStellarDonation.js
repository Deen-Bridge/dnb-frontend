"use client";
import { useState, useCallback } from "react";
import { Networks } from "@creit.tech/stellar-wallets-kit";
import { useStellar } from "@/components/stellar/StellarProvider";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";

/**
 * Hook for handling Stellar Sadaqah donation operations
 */
export const useStellarDonation = () => {
  const { connectedWallet, signTransaction, refreshBalance, network } =
    useStellar();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);

  /**
   * Initialize a donation by creating a pending transaction
   * Returns the XDR to be signed plus a SEP-7 URI for mobile wallets
   */
  const initializeDonation = useCallback(
    async ({ amount }) => {
      if (!connectedWallet) {
        toast.error("Please connect your wallet first");
        return null;
      }

      setIsProcessing(true);
      try {
        const res = await axiosInstance.post(
          "/api/stellar/donation/initialize",
          {
            amount,
            publicKey: connectedWallet,
          }
        );

        if (res.data.success !== false) {
          const donation = { ...res.data, amount };
          setCurrentDonation(donation);
          return donation;
        } else {
          throw new Error(res.data.message);
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        if (error.response?.status === 503) {
          toast.error("Donations are not available right now. Please try again later.");
        } else {
          toast.error(message);
        }
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [connectedWallet]
  );

  /**
   * Execute donation by signing and submitting the transaction
   */
  const executeDonation = useCallback(
    async (donationData) => {
      if (!donationData) {
        toast.error("No donation data available");
        return false;
      }

      setIsProcessing(true);
      try {
        // Sign the transaction with wallet
        const networkPassphrase =
          donationData.networkPassphrase ||
          (network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET);
        const signedXdr = await signTransaction(
          donationData.transactionXdr,
          networkPassphrase
        );

        // Submit to backend
        const res = await axiosInstance.post("/api/stellar/donation/submit", {
          donationId: donationData.donationId,
          signedXdr,
        });

        if (res.data.success) {
          toast.success("JazakAllahu khairan! Donation successful!");

          // Refresh wallet balance
          await refreshBalance();

          setCurrentDonation(null);
          return res.data;
        } else {
          throw new Error(res.data.message);
        }
      } catch (error) {
        import("@sentry/nextjs")
          .then((mod) => {
            const Sentry = mod.default ?? mod;
            if (!Sentry || typeof Sentry.captureException !== "function") return;
            Sentry.withScope((scope) => {
              scope.setTag("feature", "stellar-donation");
              Sentry.captureException(error);
            });
          })
          .catch(() => {});

        const message = error.response?.data?.message || error.message;

        // Handle specific Stellar errors
        if (message.includes("insufficient") || message.includes("underfunded")) {
          toast.error("Insufficient USDC balance");
        } else if (message.includes("op_no_trust") || message.includes("trustline")) {
          toast.error(
            "You need to add USDC trustline to your wallet first"
          );
        } else if (message.includes("rejected") || message.includes("cancelled")) {
          toast.error("Transaction was cancelled");
        } else {
          toast.error(`Donation failed: ${message}`);
        }
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [signTransaction, refreshBalance, network]
  );

  /**
   * Clear the current pending donation
   */
  const cancelDonation = useCallback(() => {
    setCurrentDonation(null);
  }, []);

  /**
   * Get public donation fund stats (pool balance, totals, recent donations)
   */
  const getDonationStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/stellar/donation/stats");
      return res.data;
    } catch (error) {
      console.error("Failed to fetch donation stats:", error);
      return {
        success: false,
        unconfigured: error.response?.status === 503,
        message: error.response?.data?.message || error.message,
      };
    }
  }, []);

  return {
    initializeDonation,
    executeDonation,
    cancelDonation,
    getDonationStats,
    isProcessing,
    currentDonation,
  };
};

export default useStellarDonation;
