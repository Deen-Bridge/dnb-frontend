"use client";
import { useState, useCallback } from "react";
import { useStellar } from "@/components/stellar/StellarProvider";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import useAuth from "./useAuth";
import {
  mapStellarError,
  isUserRejection,
  WALLET_ERRORS,
} from "@/lib/stellar/stellarErrors";

export const useStellarPayment = () => {
  const { connectedWallet, signTransaction, refreshBalance } = useStellar();
  const { refreshUser, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const initializePayment = useCallback(
    async ({ itemType, itemId }) => {
      if (!connectedWallet) {
        toast.error("Please connect your wallet first");
        return null;
      }

      setIsProcessing(true);
      try {
        const res = await axiosInstance.post("/api/stellar/payment/initialize", {
          itemType,
          itemId,
          buyerWallet: connectedWallet,
        });

        if (res.data.success) {
          setCurrentTransaction(res.data);
          return res.data;
        } else {
          throw new Error(res.data.message);
        }
      } catch (error) {
        const mapped = mapStellarError(error);
        if (mapped) {
          toast.error(mapped.message, {
            description: mapped.nextStep,
          });
        } else {
          const message = error.response?.data?.message || error.message;
          toast.error(message);
        }
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [connectedWallet]
  );

  const executePayment = useCallback(
    async (paymentData) => {
      if (!paymentData) {
        toast.error("No payment data available");
        return false;
      }

      setIsProcessing(true);
      try {
        const signedXdr = await signTransaction(
          paymentData.payment.xdr,
          paymentData.payment.networkPassphrase
        );

        const res = await axiosInstance.post("/api/stellar/payment/submit", {
          transactionId: paymentData.transactionId,
          signedXdr,
        });

        if (res.data.success) {
          toast.success("Payment successful!");

          if (user?._id) {
            await refreshUser(user._id);
          }

          await refreshBalance();
          setCurrentTransaction(null);
          return res.data;
        } else {
          throw new Error(res.data.message);
        }
      } catch (error) {
        if (isUserRejection(error) || error.code === "USER_REJECTED") {
          toast.info("Transaction cancelled", {
            description: "You declined the signing request. No changes were made.",
          });
          return false;
        }

        const mapped = mapStellarError(error);
        if (mapped) {
          toast.error(mapped.title, {
            description: mapped.nextStep,
          });
        } else {
          const message = error.response?.data?.message || error.message;
          toast.error(`Payment failed: ${message}`);
        }
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [signTransaction, user, refreshUser, refreshBalance]
  );

  const cancelPayment = useCallback(async () => {
    if (currentTransaction?.transactionId) {
      try {
        await axiosInstance.delete(
          `/api/stellar/payment/transactions/${currentTransaction.transactionId}`
        );
      } catch (error) {
        console.error("Failed to cancel transaction:", error);
      }
    }
    setCurrentTransaction(null);
  }, [currentTransaction]);

  const getTransactionHistory = useCallback(
    async ({ role = "buyer", page = 1, limit = 20 } = {}) => {
      try {
        const res = await axiosInstance.get("/api/stellar/payment/transactions", {
          params: { role, page, limit },
        });
        return res.data;
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return { success: false, transactions: [], pagination: {} };
      }
    },
    []
  );

  const getTransaction = useCallback(async (transactionId) => {
    try {
      const res = await axiosInstance.get(
        `/api/stellar/payment/transactions/${transactionId}`
      );
      return res.data;
    } catch (error) {
      console.error("Failed to fetch transaction:", error);
      return null;
    }
  }, []);

  return {
    initializePayment,
    executePayment,
    cancelPayment,
    getTransactionHistory,
    getTransaction,
    isProcessing,
    currentTransaction,
  };
};

export default useStellarPayment;
