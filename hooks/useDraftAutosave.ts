import { useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";

const DRAFT_KEY_PREFIX = "dnb_course_draft_";

export interface UseDraftAutosaveResult<T> {
  hasDraft: () => boolean;
  loadDraft: () => T | null;
  clearDraft: () => void;
}

export function useDraftAutosave<T = any>( // TODO(types): Autosaved draft form data generic shape
  watch?: (callback: (formValues: any) => void) => { unsubscribe: () => void }, // TODO(types): React hook form watch subscription
  courseId: string | null = null
): UseDraftAutosaveResult<T> {
  const { user } = useAuth();
  const storageKey = `${DRAFT_KEY_PREFIX}${user?._id || "anon"}${
    courseId ? `_${courseId}` : ""
  }`;

  useEffect(() => {
    if (!watch) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const subscription = watch((formValues: any) => { // TODO(types): React hook form values
      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        try {
          const serializable = JSON.parse(
            JSON.stringify(formValues, (key, value) => {
              void key;
              if (typeof window !== "undefined" && value instanceof File) {
                return null;
              }
              return value;
            })
          );
          localStorage.setItem(storageKey, JSON.stringify(serializable));
        } catch {
          // Ignore quota exceeded or storage disabled
        }
      }, 500);
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, storageKey]);

  const hasDraft = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(storageKey);
    } catch {
      return false;
    }
  }, [storageKey]);

  const loadDraft = useCallback((): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback((): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore errors
    }
  }, [storageKey]);

  return {
    hasDraft,
    loadDraft,
    clearDraft,
  };
}

export default useDraftAutosave;
