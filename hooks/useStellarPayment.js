"use client";
import { useState, useCallback } from "react";
import { useStellar } from "@/components/stellar/StellarProvider";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import useAuth from "./useAuth";

/**
 * Hook for handling Stellar payment operations
 */
export const useStellarPayment = () => {
  const { connectedWallet, signTransaction, refreshBalance } = useStellar();
  const { refreshUser, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  /**
   * Initialize a payment by creating a pending transaction
   * Returns the XDR to be signed by the wallet
   */
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
        const message = error.response?.data?.message || error.message;
        toast.error(message);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [connectedWallet]
  );

  /**
   * Execute payment by signing and submitting the transaction
   */
  const executePayment = useCallback(
    async (paymentData) => {
      if (!paymentData) {
        toast.error("No payment data available");
        return { success: false };
      }

      setIsProcessing(true);
      try {
        // Sign the transaction with wallet
        const signedXdr = await signTransaction(
          paymentData.payment.xdr,
          paymentData.payment.networkPassphrase
        );

        // Submit to backend
        const res = await axiosInstance.post("/api/stellar/payment/submit", {
          transactionId: paymentData.transactionId,
          signedXdr,
        });

        if (res.data.success) {
          toast.success("Payment successful!");

          // Refresh user data to update purchased items
          if (user?._id) {
            await refreshUser(user._id);
          }

          // Refresh wallet balance
          await refreshBalance();

          setCurrentTransaction(null);
          return { success: true, data: res.data };
        } else {
          throw new Error(res.data.message);
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        const isCancelled = message.includes("rejected") || message.includes("cancelled");

        if (message.includes("insufficient") || message.includes("underfunded")) {
          toast.error("Insufficient USDC balance");
        } else if (message.includes("op_no_trust") || message.includes("trustline")) {
          toast.error(
            "You need to add USDC trustline to your wallet first"
          );
        } else if (isCancelled) {
          toast.error("Transaction was cancelled");
        } else {
          toast.error(`Payment failed: ${message}`);
        }
        return { success: false, cancelled: isCancelled };
      } finally {
        setIsProcessing(false);
      }
    },
    [signTransaction, user, refreshUser, refreshBalance]
  );

  /**
   * Cancel the current pending transaction
   */
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

  /**
   * Get user's transaction history
   */
  const getTransactionHistory = useCallback(
    async ({ role = "buyer", page = 1, limit = 20 } = {}) => {
      try {
        const res = await axiosInstance.get("/api/stellar/payment/transactions", {
          params: { role, page, limit },
        });
        return res.data;
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return { success: false, transactions: [], pagination: {}, error: error.response?.data?.message || error.message };
      }
    },
    []
  );

  /**
   * Get a single transaction's details
   */
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
