"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { useStellar } from "@/components/stellar/StellarProvider";
import { persistSession } from "@/hooks/useAuth";

/**
 * Frontend SEP-10 client for "Sign in with Stellar".
 *
 * Contract assumption (paired with dnb-backend #25 / frontend #101):
 * - GET  /api/auth/stellar/challenge?account=G… → { transaction, networkPassphrase }
 *   (also accepts snake_case network_passphrase)
 * - POST /api/auth/stellar/verify { transaction } → { token, user } for linked wallets
 * - Unregistered wallets: HTTP 404/409, OR 200 with { registered: false, accountProven }
 * - Feature not deployed: challenge returns 404/503 → button disabled with tooltip
 *
 * No challenge XDR is submitted to Horizon from this client — only challenge + verify HTTP calls.
 */

const CHALLENGE_PATH = "/api/auth/stellar/challenge";
const VERIFY_PATH = "/api/auth/stellar/verify";

const isModalClosedError = (error) =>
  error?.code === -1 ||
  (typeof error?.message === "string" &&
    /closed|cancel(l)?ed|reject(ed)?/i.test(error.message));

const isExpiredChallengeError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "";
  return /expir|time.?bound|challenge.*(invalid|expired)/i.test(
    String(message)
  );
};

const isUnregisteredWallet = (error, data) => {
  if (data && data.registered === false) return true;
  const status = error?.response?.status;
  return status === 404 || status === 409;
};

const getNetworkPassphrase = (payload = {}) =>
  payload.networkPassphrase || payload.network_passphrase;

const fetchChallenge = async (account) => {
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

const verifyChallenge = async (signedXdr) => {
  const res = await axiosInstance.post(VERIFY_PATH, {
    transaction: signedXdr,
  });
  return res.data;
};

export function useStellarAuth() {
  const { kitInitialized, selectWallet, signTransaction } = useStellar();
  const [isPending, setIsPending] = useState(false);
  const [stellarAuthAvailable, setStellarAuthAvailable] = useState(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        // Missing account should yield 400 when the route exists.
        const res = await axiosInstance.get(CHALLENGE_PATH, {
          validateStatus: () => true,
        });

        if (cancelled) return;

        if (res.status === 404 || res.status === 503) {
          setStellarAuthAvailable(false);
        } else {
          setStellarAuthAvailable(true);
        }
      } catch (error) {
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 404 || status === 503) {
          setStellarAuthAvailable(false);
        } else if (status) {
          // Any other HTTP response means the route is reachable
          setStellarAuthAvailable(true);
        } else {
          // Network / unknown — keep enabled so the user can still try
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

      const attemptVerify = async (allowRetry) => {
        const { transaction, networkPassphrase } = await fetchChallenge(address);
        const signedXdr = await signTransaction(transaction, networkPassphrase);

        try {
          return await verifyChallenge(signedXdr);
        } catch (verifyError) {
          if (allowRetry && isExpiredChallengeError(verifyError)) {
            // SEP-10 challenges are short-lived — re-fetch and retry once
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
    } catch (error) {
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
