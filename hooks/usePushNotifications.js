"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isPushSupported,
  getNotificationPermission,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/pushManager";
import {
  savePushSubscription,
  deletePushSubscription,
  updatePushPreferences,
} from "@/lib/actions/push-subscription";

/**
 * Notification categories a user can toggle (issue #197 acceptance criteria).
 * Kept in one place so the settings UI and the subscribe payload stay in sync.
 */
export const PUSH_NOTIFICATION_TYPES = [
  {
    key: "messages",
    label: "Direct messages",
    description: "New direct messages sent to you",
  },
  {
    key: "courseUpdates",
    label: "Course announcements",
    description: "Announcements from educators you follow",
  },
  {
    key: "spaceReplies",
    label: "Space replies",
    description: "New replies in spaces you take part in",
  },
  {
    key: "purchases",
    label: "Purchase confirmations",
    description: "Receipts and confirmations for your purchases",
  },
];

const PREFERENCES_STORAGE_KEY = "dnb:push-preferences";

const DEFAULT_PREFERENCES = PUSH_NOTIFICATION_TYPES.reduce((acc, type) => {
  acc[type.key] = true;
  return acc;
}, {});

function readStoredPreferences() {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function persistPreferences(preferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch {
    /* localStorage may be unavailable (private mode) — ignore */
  }
}

/**
 * Encapsulates the full push-notification lifecycle: feature detection,
 * permission state, subscribe / unsubscribe (syncing with the backend), and
 * per-type preferences.
 */
export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  // Initialise from the browser once mounted (client-only).
  useEffect(() => {
    const ok = isPushSupported();
    setSupported(ok);
    setPermission(getNotificationPermission());
    setPreferences(readStoredPreferences());
    if (!ok) return;
    let active = true;
    getExistingSubscription()
      .then((sub) => {
        if (active) setSubscribed(Boolean(sub));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    try {
      const subscription = await subscribeToPush();
      const result = await savePushSubscription(subscription, preferences);
      if (!result.success) {
        throw new Error(result.error || "Could not save subscription.");
      }
      setSubscribed(true);
      setPermission(getNotificationPermission());
      return { success: true };
    } catch (error) {
      setPermission(getNotificationPermission());
      return { success: false, error: error?.message };
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await deletePushSubscription(endpoint);
      setSubscribed(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const setPreference = useCallback(
    async (key, value) => {
      const next = { ...preferences, [key]: value };
      setPreferences(next);
      persistPreferences(next);
      // Only sync to the backend when there is a live subscription to update.
      if (subscribed) {
        const subscription = await getExistingSubscription();
        if (subscription?.endpoint) {
          await updatePushPreferences(subscription.endpoint, next);
        }
      }
    },
    [preferences, subscribed]
  );

  return {
    supported,
    permission,
    subscribed,
    loading,
    preferences,
    types: PUSH_NOTIFICATION_TYPES,
    subscribe,
    unsubscribe,
    setPreference,
  };
}
