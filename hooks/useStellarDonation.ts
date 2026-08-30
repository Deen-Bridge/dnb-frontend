"use client";
import { useState, useCallback } from "react";
import { Networks } from "@creit.tech/stellar-wallets-kit";
import { useStellar } from "@/components/stellar/StellarProvider";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";

export interface InitializeDonationParams {
  amount: number | string;
}

export interface InitializeDonationResult {
  donationId: string;
  transactionXdr: string;
  networkPassphrase?: string;
  amount: number | string;
  [key: string]: any; // TODO(types): Additional donation fields
}

export interface DonationStatsResult {
  success: boolean;
  unconfigured?: boolean;
  message?: string;
  [key: string]: any; // TODO(types): Donation stats payload
}

export interface UseStellarDonationResult {
  initializeDonation: (params: InitializeDonationParams) => Promise<InitializeDonationResult | null>;
  executeDonation: (donationData: any) => Promise<any>; // TODO(types): Donation submission payload
  cancelDonation: () => void;
  getDonationStats: () => Promise<DonationStatsResult>;
  isProcessing: boolean;
  currentDonation: InitializeDonationResult | null;
}

export const useStellarDonation = (): UseStellarDonationResult => {
  const { connectedWallet, signTransaction, refreshBalance, network } =
    useStellar();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentDonation, setCurrentDonation] = useState<InitializeDonationResult | null>(null);

  const initializeDonation = useCallback(
    async ({ amount }: InitializeDonationParams): Promise<InitializeDonationResult | null> => {
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
          const donation: InitializeDonationResult = { ...res.data, amount };
          setCurrentDonation(donation);
          return donation;
        } else {
          throw new Error(res.data.message);
        }
      } catch (error: any) { // TODO(types): Error from donation init
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

  const executeDonation = useCallback(
    async (donationData: any): Promise<any> => { // TODO(types): Donation data object
      if (!donationData) {
        toast.error("No donation data available");
        return false;
      }

      setIsProcessing(true);
      try {
        const networkPassphrase =
          donationData.networkPassphrase ||
          (network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET);
        const signedXdr = await signTransaction(
          donationData.transactionXdr,
          networkPassphrase
        );

        const res = await axiosInstance.post("/api/stellar/donation/submit", {
          donationId: donationData.donationId,
          signedXdr,
        });

        if (res.data.success) {
          toast.success("JazakAllahu khairan! Donation successful!");

          await refreshBalance();

          setCurrentDonation(null);
          return res.data;
        } else {
          throw new Error(res.data.message);
        }
      } catch (error: any) { // TODO(types): Donation execution error
        import("@sentry/nextjs")
          .then((mod) => {
            const Sentry = mod.default ?? mod;
            if (!Sentry || typeof Sentry.captureException !== "function") return;
            Sentry.withScope((scope: any) => { // TODO(types): Sentry scope
              scope.setTag("feature", "stellar-donation");
              Sentry.captureException(error);
            });
          })
          .catch(() => {});

        const message = error.response?.data?.message || error.message;

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

  const cancelDonation = useCallback((): void => {
    setCurrentDonation(null);
  }, []);

  const getDonationStats = useCallback(async (): Promise<DonationStatsResult> => {
    try {
      const res = await axiosInstance.get("/api/stellar/donation/stats");
      return res.data;
    } catch (error: any) { // TODO(types): Error from donation stats
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
