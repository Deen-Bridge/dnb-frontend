"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";

// Per-user layout preferences for the admin overview widgets are kept in
// localStorage only. Server-side sync is not implemented.
const STORAGE_PREFIX = "dnb-admin-overview-layout:";

function getUserKey() {
  try {
    const raw = Cookies.get("userInfo");
    if (!raw) return "anonymous";
    const user = JSON.parse(raw);
    const id = user?._id ?? user?.id;
    return id != null && String(id) !== "" ? String(id) : "anonymous";
  } catch {
    return "anonymous";
  }
}

function readStored(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // storage unavailable or invalid JSON - fall back to defaults
    return null;
  }
}

function writeStored(storageKey, layout) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    // storage full or unavailable - change applies for this session only
  }
}

function removeStored(storageKey) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // storage unavailable - nothing persisted to remove
  }
}

/**
 * Coerce untrusted stored data into a valid layout for the given widget keys.
 * Unknown or duplicate keys are dropped and missing keys are appended in their
 * default position, so stale stored data never hides or loses widgets.
 */
export function sanitizeLayout(raw, widgetKeys) {
  const valid = new Set(widgetKeys);
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

  const seen = new Set();
  const order = [];
  if (Array.isArray(source.order)) {
    for (const key of source.order) {
      if (typeof key === "string" && valid.has(key) && !seen.has(key)) {
        seen.add(key);
        order.push(key);
      }
    }
  }
  for (const key of widgetKeys) {
    if (!seen.has(key)) {
      seen.add(key);
      order.push(key);
    }
  }

  const hidden = Array.isArray(source.hidden)
    ? [...new Set(source.hidden.filter((key) => typeof key === "string" && valid.has(key)))]
    : [];

  return { order, hidden };
}

/**
 * Tracks widget order and hidden state for the current admin user.
 * `widgetKeys` must be a stable (module-level) array.
 */
export default function useOverviewLayout(widgetKeys) {
  const defaults = useMemo(() => sanitizeLayout(null, widgetKeys), [widgetKeys]);
  const [storageKey, setStorageKey] = useState(null);
  const [layout, setLayout] = useState(defaults);

  useEffect(() => {
    const key = STORAGE_PREFIX + getUserKey();
    setStorageKey(key);
    setLayout(sanitizeLayout(readStored(key), widgetKeys));
  }, [widgetKeys]);

  const commit = useCallback(
    (next) => {
      setLayout(next);
      if (storageKey) writeStored(storageKey, next);
    },
    [storageKey]
  );

  const toggleHidden = useCallback(
    (key) => {
      const hidden = layout.hidden.includes(key)
        ? layout.hidden.filter((item) => item !== key)
        : [...layout.hidden, key];
      commit({ ...layout, hidden });
    },
    [layout, commit]
  );

  const move = useCallback(
    (key, delta) => {
      const index = layout.order.indexOf(key);
      const target = index + delta;
      if (index === -1 || target < 0 || target >= layout.order.length) return;
      const order = [...layout.order];
      [order[index], order[target]] = [order[target], order[index]];
      commit({ ...layout, order });
    },
    [layout, commit]
  );

  const reset = useCallback(() => {
    if (storageKey) removeStored(storageKey);
    setLayout(defaults);
  }, [storageKey, defaults]);

  const isHidden = useCallback((key) => layout.hidden.includes(key), [layout.hidden]);

  return {
    order: layout.order,
    isHidden,
    toggleHidden,
    move,
    reset,
  };
}
