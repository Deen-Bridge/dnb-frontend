"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/config/axios.config";
import { config } from "@/lib/config/env";
import { persistSession } from "@/hooks/useAuth";

const GOOGLE_PATH = "/api/auth/google";

export interface UseGoogleAuthResult {
  loginWithGoogle: (idToken: string) => Promise<any | null>; // TODO(types): User object
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

  const loginWithGoogle = useCallback(async (idToken: string) => {
    if (!idToken) {
      toast.error("Google sign-in did not return a credential. Please try again.");
      return null;
    }

    setIsPending(true);
    try {
      const res = await axiosInstance.post(GOOGLE_PATH, { idToken });
      const { token, user } = res.data || {};
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      persistSession(token, user);
      toast.success("Signed in with Google");
      return user;
    } catch (error: any) { // TODO(types): Axios error from Google sign-in
      if (error?.response?.status === 503) {
        toast.error(
          "Continue with Google is not available yet. Please use email login."
        );
      } else {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Google sign-in failed. Please try again.";
        toast.error(message);
      }
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { loginWithGoogle, isPending, googleAuthAvailable };
}

export default useGoogleAuth;
