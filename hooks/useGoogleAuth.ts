"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { config } from "@/lib/config/env";
import { persistSession } from "@/hooks/useAuth";
import type { User } from "@/types/api";

const GOOGLE_PATH = "/api/auth/google";

export interface UseGoogleAuthResult {
  loginWithGoogle: (idToken: string) => Promise<User | null>;
  isPending: boolean;
  googleAuthAvailable: boolean;
}

/**
 * Wraps the backend's "Continue with Google" endpoint. Unlike Stellar, this
 * doubles as signup — a brand-new Google account creates a user server-side,
 * so there's no separate "unregistered" branch to handle here.
 */
export function useGoogleAuth(): UseGoogleAuthResult {
  const [isPending, setIsPending] = useState<boolean>(false);
  const googleAuthAvailable = Boolean(config.googleClientId);
  // Guards against an older exchange's response landing after a newer one
  // (e.g. two overlapping clicks) and clobbering the session it just set.
  const latestRequestId = useRef(0);

  const loginWithGoogle = useCallback(async (idToken: string): Promise<User | null> => {
    if (!idToken) {
      toast.error("Google sign-in did not return a credential. Please try again.");
      return null;
    }

    const requestId = ++latestRequestId.current;
    setIsPending(true);
    try {
      const res = await axiosInstance.post(GOOGLE_PATH, { idToken });
      if (requestId !== latestRequestId.current) {
        return null;
      }

      const { token, user } = res.data || {};
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      persistSession(token, user);
      toast.success("Signed in with Google");
      return user as User;
    } catch (error: unknown) {
      if (requestId !== latestRequestId.current) {
        return null;
      }
      if (axios.isAxiosError(error) && error.response?.status === 503) {
        toast.error(
          "Continue with Google is not available yet. Please use email login."
        );
      } else {
        const message =
          (axios.isAxiosError(error) && error.response?.data?.message) ||
          (error instanceof Error ? error.message : undefined) ||
          "Google sign-in failed. Please try again.";
        toast.error(message);
      }
      return null;
    } finally {
      if (requestId === latestRequestId.current) {
        setIsPending(false);
      }
    }
  }, []);

  return { loginWithGoogle, isPending, googleAuthAvailable };
}

export default useGoogleAuth;
