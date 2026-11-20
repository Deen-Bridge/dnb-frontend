"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRecentEvents } from "@/lib/actions/admin-recent-events";

export const RECENT_EVENTS_LIMIT = 25;
export const RECENT_EVENTS_POLL_MS = 30000;

/**
 * Polls recent platform events every 30s while the tab is visible. Polling
 * pauses when hidden and refreshes immediately when the tab becomes visible.
 */
export default function useRecentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchRecentEvents(RECENT_EVENTS_LIMIT);
      setEvents((Array.isArray(list) ? list : []).slice(0, RECENT_EVENTS_LIMIT));
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load recent activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stop = () => {
      clearInterval(timer.current);
      timer.current = null;
    };
    const start = () => {
      stop();
      timer.current = setInterval(load, RECENT_EVENTS_POLL_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        load();
        start();
      } else {
        stop();
      }
    };

    load();
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  return { events, loading, error, refresh: load };
}
