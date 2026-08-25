"use client";
/**
 * useEmergencyBroadcast — data hook for the emergency-broadcast quick-action (#307).
 * ---------------------------------------------------------------------------
 * Loads the currently active emergency broadcast via the stubbed service in
 * `lib/actions/admin-emergency-broadcast` and exposes the immediate `send` /
 * `clear` mutations the admin quick-action page uses, so the page and the
 * learner-side `EmergencyBroadcastBanner` drive one code path and stay
 * consistent within a session.
 *
 * The active read is **public** (the banner reads it for any visitor), so this
 * hook fetches it for everyone — unlike `useMaintenanceMode`, which only fetches
 * for admins. Sending/clearing is still an admin-only surface (the page is
 * wrapped in `AdminTierGuard`); this hook does not itself gate the mutations.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getActiveEmergencyBroadcast,
  sendEmergencyBroadcast,
  clearEmergencyBroadcast,
} from "@/lib/actions/admin-emergency-broadcast";

export default function useEmergencyBroadcast() {
  const [broadcast, setBroadcast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const { broadcast: active } = await getActiveEmergencyBroadcast();
      setBroadcast(active);
      return active;
    } catch (err) {
      setError(err?.message || "Failed to load emergency broadcast");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { broadcast: active } = await getActiveEmergencyBroadcast();
        if (!cancelled) setBroadcast(active);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to load emergency broadcast");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Immediately send an emergency broadcast. Surfaces success/failure via toast
   * and re-throws on failure so the caller can keep its confirm dialog open.
   *
   * @param {{template: string, title: string, body?: string, etaAt?: string|null, affectedAreas?: string[]}} payload
   */
  const send = useCallback(async (payload) => {
    setIsSending(true);
    try {
      const { broadcast: next } = await sendEmergencyBroadcast(payload);
      setBroadcast(next);
      toast.success("Emergency broadcast sent — learners are seeing it now.");
      return next;
    } catch (err) {
      toast.error(err?.message || "Couldn't send the emergency broadcast");
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  /** Resolve / dismiss the active emergency broadcast. */
  const clear = useCallback(async () => {
    setIsSending(true);
    try {
      await clearEmergencyBroadcast();
      setBroadcast(null);
      toast.success("Emergency broadcast resolved.");
      return null;
    } catch (err) {
      toast.error(err?.message || "Couldn't resolve the emergency broadcast");
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    broadcast,
    isLoading,
    isSending,
    error,
    send,
    clear,
    refresh,
  };
}
