"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "dnb-admin-prefs";

export interface EmailNotificationsPreferences {
  newUsers: boolean;
  newOrders: boolean;
  reports: boolean;
  systemAlerts: boolean;
}

export interface AdminPreferences {
  defaultLandingPage: string;
  timezone: string;
  mediaBlurDefault: boolean;
  emailNotifications: EmailNotificationsPreferences;
}

const DEFAULTS: AdminPreferences = {
  defaultLandingPage: "/admin",
  timezone: "UTC",
  mediaBlurDefault: false,
  emailNotifications: {
    newUsers: true,
    newOrders: true,
    reports: true,
    systemAlerts: true,
  },
};

function loadFromStorage(): Partial<AdminPreferences> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(value: AdminPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export interface UseAdminPreferencesResult {
  prefs: AdminPreferences;
  loaded: boolean;
  updatePref: <K extends keyof AdminPreferences>(key: K, value: AdminPreferences[K]) => void;
  updateEmailNotification: <K extends keyof EmailNotificationsPreferences>(
    key: K,
    value: EmailNotificationsPreferences[K]
  ) => void;
  resetDefaults: () => void;
}

export default function useAdminPreferences(): UseAdminPreferencesResult {
  const [prefs, setPrefs] = useState<AdminPreferences>(DEFAULTS);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setPrefs((prev) => ({
        ...prev,
        ...stored,
        emailNotifications: {
          ...prev.emailNotifications,
          ...(stored.emailNotifications || {}),
        },
      }));
    }
    setLoaded(true);
  }, []);

  const updatePref = useCallback(<K extends keyof AdminPreferences>(key: K, value: AdminPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateEmailNotification = useCallback(
    <K extends keyof EmailNotificationsPreferences>(key: K, value: EmailNotificationsPreferences[K]) => {
      setPrefs((prev) => {
        const next = {
          ...prev,
          emailNotifications: { ...prev.emailNotifications, [key]: value },
        };
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  const resetDefaults = useCallback(() => {
    setPrefs(DEFAULTS);
    saveToStorage(DEFAULTS);
  }, []);

  return {
    prefs,
    loaded,
    updatePref,
    updateEmailNotification,
    resetDefaults,
  };
}
