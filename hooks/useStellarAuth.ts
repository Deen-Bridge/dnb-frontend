"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { useStellar } from "@/components/stellar/StellarProvider";
import { persistSession } from "@/hooks/useAuth";
import type { User } from "@/types/api";

const CHALLENGE_PATH = "/api/auth/stellar/challenge";
const VERIFY_PATH = "/api/auth/stellar/verify";

// ---------------------------------------------------------------------------
// Wire shapes (#514)
// ---------------------------------------------------------------------------

/** SEP-10 challenge payload returned by `GET /api/auth/stellar/challenge`. */
export interface StellarChallengePayload {
  /** Base64 transaction the wallet must sign. */
  transaction?: string;
  /** Network passphrase the challenge was built for (snake_case tolerated). */
  networkPassphrase?: string;
  network_passphrase?: string;
}

/**
 * Response of `POST /api/auth/stellar/verify`. Two outcomes share this
 * envelope: a linked wallet yields `token` + `user`, while an unlinked wallet
 * is flagged with `registered: false` (plus the proven account, when present).
 */
export interface StellarVerifyResponse {
  /** `false` when the wallet has no Deen Bridge account yet. */
  registered?: boolean;
  /** Session token — present only on the linked-wallet outcome. */
  token?: string;
  /** Session user — present only on the linked-wallet outcome. */
  user?: User;
  /** Wallet address proven via the challenge on the unregistered outcome. */
  accountProven?: string;
}

/** `loginWithStellar` success: the persisted session user. */
export type StellarLoginUser = User;

/** `loginWithStellar` outcome for a valid wallet that isn't linked yet. */
export interface StellarUnregisteredResult {
  unregistered: true;
  account?: string;
}

/**
 * What `loginWithStellar` resolves with: a session user, an `unregistered`
 * marker (caller should send the user to sign-up/link), or `null` when the
 * flow was cancelled or Stellar auth is unavailable.
 */
export type StellarLoginResult = StellarLoginUser | StellarUnregisteredResult | null;

// ---------------------------------------------------------------------------
// Error narrowing helpers — caught values are `unknown`, never `any`
// ---------------------------------------------------------------------------

/** Property bag this module actually inspects on thrown values. */
interface InspectableError {
  response?: {
    status?: number;
    data?: {
      message?: unknown;
      error?: unknown;
    };
  };
  message?: unknown;
  code?: unknown;
}

/** Narrow any thrown value to the bag we read; non-objects read as empty. */
const inspect = (error: unknown): InspectableError =>
  typeof error === "object" && error !== null ? (error as InspectableError) : {};

/** HTTP status of a failed axios call; `undefined` for network/SDK errors. */
const getResponseStatus = (error: unknown): number | undefined => {
  const status = inspect(error).response?.status;
  return typeof status === "number" ? status : undefined;
};

/**
 * Best-effort message: the server envelope (`message` / `error`) first, then
 * the client-side error message, else the empty string.
 */
const getErrorMessage = (error: unknown): string => {
  const envelope = inspect(error);
  const candidate =
    envelope.response?.data?.message || envelope.response?.data?.error || envelope.message;
  if (candidate == null) return "";
  return typeof candidate === "string" ? candidate : String(candidate);
};

/** Wallet-modal dismissal: SDK code `-1` or a closed/cancelled/rejected message. */
const isModalClosedError = (error: unknown): boolean => {
  const envelope = inspect(error);
  return (
    envelope.code === -1 ||
    (typeof envelope.message === "string" &&
      /closed|cancel(l)?ed|reject(ed)?/i.test(envelope.message))
  );
};

/** The challenge expired (or was rejected as time-bound) before it was signed. */
const isExpiredChallengeError = (error: unknown): boolean =>
  /expir|time.?bound|challenge.*(invalid|expired)/i.test(getErrorMessage(error));

/** Wallet is valid but has no linked Deen Bridge account (404/409 or explicit flag). */
const isUnregisteredWallet = (error: unknown, data?: unknown): boolean => {
  if (data && typeof data === "object" && (data as { registered?: unknown }).registered === false) {
    return true;
  }
  const status = getResponseStatus(error);
  return status === 404 || status === 409;
};

// ---------------------------------------------------------------------------
// SEP-10 flow
// ---------------------------------------------------------------------------

const getNetworkPassphrase = (payload: StellarChallengePayload = {}): string | undefined =>
  payload.networkPassphrase || payload.network_passphrase;

const fetchChallenge = async (
  account: string
): Promise<{ transaction: string; networkPassphrase: string }> => {
  const res = await axiosInstance.get(CHALLENGE_PATH, {
    params: { account },
  });
  const payload = (res.data ?? {}) as StellarChallengePayload;
  const transaction = payload.transaction;
  const networkPassphrase = getNetworkPassphrase(payload);

  if (!transaction || !networkPassphrase) {
    throw new Error("Invalid challenge response from server");
  }

  return { transaction, networkPassphrase };
};

const verifyChallenge = async (signedXdr: string): Promise<StellarVerifyResponse> => {
  const res = await axiosInstance.post(VERIFY_PATH, {
    transaction: signedXdr,
  });
  return res.data as StellarVerifyResponse;
};

export interface UseStellarAuthResult {
  loginWithStellar: () => Promise<StellarLoginResult>;
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
      } catch (error: unknown) {
        if (cancelled) return;
        const status = getResponseStatus(error);
        if (status === 404 || status === 503) {
          setStellarAuthAvailable(false);
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

  const loginWithStellar = useCallback(async (): Promise<StellarLoginResult> => {
    if (!kitInitialized) {
      toast.error("Wallet kit not initialized. Please refresh the page.");
      return null;
    }

    if (stellarAuthAvailable === false) {
      toast.error("Sign in with Stellar is not available yet. Please use email login.");
      return null;
    }

    setIsPending(true);

    try {
      const address = await selectWallet();

      const attemptVerify = async (allowRetry: boolean): Promise<StellarVerifyResponse> => {
        const { transaction, networkPassphrase } = await fetchChallenge(address);
        const signedXdr = await signTransaction(transaction, networkPassphrase);

        try {
          return await verifyChallenge(signedXdr);
        } catch (verifyError: unknown) {
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

      const token = data?.token;
      const user = data?.user;
      if (!token || !user) {
        throw new Error("Invalid verify response from server");
      }

      persistSession(token, user);
      toast.success("Signed in with Stellar");
      return user;
    } catch (error: unknown) {
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

      if (getResponseStatus(error) === 503 || getResponseStatus(error) === 404) {
        setStellarAuthAvailable(false);
        toast.error(
          "Sign in with Stellar is not available on the server yet. Please use email login."
        );
        return null;
      }

      const message = getErrorMessage(error) || "Sign in with Stellar failed. Please try again.";

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
