"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { useStellar } from "@/components/stellar/StellarProvider";
import { persistSession } from "@/hooks/useAuth";

const CHALLENGE_PATH = "/api/auth/stellar/challenge";
const VERIFY_PATH = "/api/auth/stellar/verify";

const isModalClosedError = (error: any): boolean => // TODO(types): Error shape from wallet selection
  error?.code === -1 ||
  (typeof error?.message === "string" &&
    /closed|cancel(l)?ed|reject(ed)?/i.test(error.message));

const isExpiredChallengeError = (error: any): boolean => { // TODO(types): Axios error from challenge
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "";
  return /expir|time.?bound|challenge.*(invalid|expired)/i.test(
    String(message)
  );
};

const isUnregisteredWallet = (error: any, data?: any): boolean => { // TODO(types): Response data/error shape
  if (data && data.registered === false) return true;
  const status = error?.response?.status;
  return status === 404 || status === 409;
};

const getNetworkPassphrase = (payload: any = {}): string => // TODO(types): Challenge payload
  payload.networkPassphrase || payload.network_passphrase;

const fetchChallenge = async (account: string): Promise<{ transaction: string; networkPassphrase: string }> => {
  const res = await axiosInstance.get(CHALLENGE_PATH, {
    params: { account },
  });
  const transaction = res.data?.transaction;
  const networkPassphrase = getNetworkPassphrase(res.data);

  if (!transaction || !networkPassphrase) {
    throw new Error("Invalid challenge response from server");
  }

  return { transaction, networkPassphrase };
};

const verifyChallenge = async (signedXdr: string): Promise<any> => { // TODO(types): SEP-10 verify response
  const res = await axiosInstance.post(VERIFY_PATH, {
    transaction: signedXdr,
  });
  return res.data;
};

export interface UseStellarAuthResult {
  loginWithStellar: () => Promise<any | null>; // TODO(types): User or unregistered indicator
  isPending: boolean;
  stellarAuthAvailable: boolean | null;
  availabilityChecked: boolean;
  kitInitialized: boolean;
}

export function useStellarAuth(): UseStellarAuthResult {
  const { kitInitialized, selectWallet, signTransaction } = useStellar();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [stellarAuthAvailable, setStellarAuthAvailable] = useState<boolean | null>(null);
  const [availabilityChecked, setAvailabilityChecked] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        const res = await axiosInstance.get(CHALLENGE_PATH, {
          validateStatus: () => true,
        });

        if (cancelled) return;

        if (res.status === 404 || res.status === 503) {
          setStellarAuthAvailable(false);
        } else {
          setStellarAuthAvailable(true);
        }
      } catch (error: any) { // TODO(types): Network error from probe
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 404 || status === 503) {
          setStellarAuthAvailable(false);
        } else if (status) {
          setStellarAuthAvailable(true);
        } else {
          setStellarAuthAvailable(true);
        }
      } finally {
        if (!cancelled) setAvailabilityChecked(true);
      }
    };

    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithStellar = useCallback(async () => {
    if (!kitInitialized) {
      toast.error("Wallet kit not initialized. Please refresh the page.");
      return null;
    }

    if (stellarAuthAvailable === false) {
      toast.error(
        "Sign in with Stellar is not available yet. Please use email login."
      );
      return null;
    }

    setIsPending(true);

    try {
      const address = await selectWallet();

      const attemptVerify = async (allowRetry: boolean): Promise<any> => { // TODO(types): Verify challenge response payload
        const { transaction, networkPassphrase } = await fetchChallenge(address);
        const signedXdr = await signTransaction(transaction, networkPassphrase);

        try {
          return await verifyChallenge(signedXdr);
        } catch (verifyError) {
          if (allowRetry && isExpiredChallengeError(verifyError)) {
            return attemptVerify(false);
          }
          throw verifyError;
        }
      };

      const data = await attemptVerify(true);

      if (data?.registered === false) {
        toast.error(
          "This wallet is not linked to a Deen Bridge account yet. Sign up with email, then link your wallet from the dashboard."
        );
        return { unregistered: true, account: data.accountProven || address };
      }

      const { token, user } = data || {};
      if (!token || !user) {
        throw new Error("Invalid verify response from server");
      }

      persistSession(token, user);
      toast.success("Signed in with Stellar");
      return user;
    } catch (error: any) { // TODO(types): Error from SEP-10 login
      if (isModalClosedError(error)) {
        toast.message("Wallet connection cancelled");
        return null;
      }

      if (isUnregisteredWallet(error)) {
        toast.error(
          "This wallet is not linked to a Deen Bridge account yet. Sign up with email, then link your wallet from the dashboard."
        );
        return { unregistered: true };
      }

      if (error?.response?.status === 503 || error?.response?.status === 404) {
        setStellarAuthAvailable(false);
        toast.error(
          "Sign in with Stellar is not available on the server yet. Please use email login."
        );
        return null;
      }

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Sign in with Stellar failed. Please try again.";

      console.error("Stellar auth error:", error);
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [kitInitialized, selectWallet, signTransaction, stellarAuthAvailable]);

  return {
    loginWithStellar,
    isPending,
    stellarAuthAvailable,
    availabilityChecked,
    kitInitialized,
  };
}

export default useStellarAuth;
