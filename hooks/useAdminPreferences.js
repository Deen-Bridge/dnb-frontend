"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "dnb-admin-prefs";

const DEFAULTS = {
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

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export default function useAdminPreferences() {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

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

  const updatePref = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      saveToStorage(next);
      return next;
    });
  }, []);

  const updateEmailNotification = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        emailNotifications: { ...prev.emailNotifications, [key]: value },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

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
