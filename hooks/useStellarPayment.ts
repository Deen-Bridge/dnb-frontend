"use client";
import { useState, useCallback } from "react";
import { useStellar } from "@/components/stellar/StellarProvider";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import useAuth from "./useAuth";
import {
  mapStellarError,
  isUserRejection,
} from "@/lib/stellar/stellarErrors";
import {
  PaymentInitializationParams,
  PaymentInitializationResponse,
  PaymentSubmissionResponse,
} from "@/types/stellar";

export interface GetTransactionHistoryParams {
  role?: string;
  page?: number;
  limit?: number;
}

export interface UseStellarPaymentResult {
  initializePayment: (params: PaymentInitializationParams) => Promise<PaymentInitializationResponse | null>;
  executePayment: (paymentData: any) => Promise<{ success: boolean; data?: any; cancelled?: boolean } | boolean>; // TODO(types): Payment submission data
  cancelPayment: () => Promise<void>;
  getTransactionHistory: (params?: GetTransactionHistoryParams) => Promise<any>; // TODO(types): Transaction history response
  getTransaction: (transactionId: string) => Promise<any | null>; // TODO(types): Single transaction response
  isProcessing: boolean;
  currentTransaction: PaymentInitializationResponse | null;
}

export const useStellarPayment = (): UseStellarPaymentResult => {
  const { connectedWallet, signTransaction, refreshBalance } = useStellar();
  const { refreshUser, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<PaymentInitializationResponse | null>(null);

  const initializePayment = useCallback(
    async ({ itemType, itemId }: PaymentInitializationParams): Promise<PaymentInitializationResponse | null> => {
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
      } catch (error: any) { // TODO(types): Error from payment init
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
    async (paymentData: any): Promise<{ success: boolean; data?: any; cancelled?: boolean } | boolean> => { // TODO(types): Payment data payload
      if (!paymentData) {
        toast.error("No payment data available");
        return { success: false };
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
          return { success: true, data: res.data };
        } else {
          throw new Error(res.data.message);
        }
      } catch (error: any) { // TODO(types): Error from payment execution
        if (isUserRejection(error) || error.code === "USER_REJECTED") {
          toast.info("Transaction cancelled", {
            description: "You declined the signing request. No changes were made.",
          });
          return false;
        }

        import("@sentry/nextjs")
          .then((mod) => {
            const Sentry = mod.default ?? mod;
            if (!Sentry || typeof Sentry.captureException !== "function") return;
            Sentry.withScope((scope: any) => { // TODO(types): Sentry scope
              scope.setTag("feature", "stellar-payment");
              Sentry.captureException(error);
            });
          })
          .catch(() => {});

        const mapped = mapStellarError(error);
        if (mapped) {
          toast.error(mapped.title, {
            description: mapped.nextStep,
          });
        } else {
          const message = error.response?.data?.message || error.message;
          toast.error(`Payment failed: ${message}`);
        }
        return { success: false, cancelled: false };
      } finally {
        setIsProcessing(false);
      }
    },
    [signTransaction, user, refreshUser, refreshBalance]
  );

  const cancelPayment = useCallback(async (): Promise<void> => {
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
    async ({ role = "buyer", page = 1, limit = 20 }: GetTransactionHistoryParams = {}): Promise<any> => { // TODO(types): History result
      try {
        const res = await axiosInstance.get("/api/stellar/payment/transactions", {
          params: { role, page, limit },
        });
        return res.data;
      } catch (error: any) { // TODO(types): Error from getTransactionHistory
        console.error("Failed to fetch transactions:", error);
        return { success: false, transactions: [], pagination: {}, error: error.response?.data?.message || error.message };
      }
    },
    []
  );

  const getTransaction = useCallback(async (transactionId: string): Promise<any | null> => { // TODO(types): Single transaction result
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
