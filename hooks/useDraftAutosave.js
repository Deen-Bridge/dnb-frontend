import { useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";

const DRAFT_KEY_PREFIX = "dnb_course_draft_";

export function useDraftAutosave(watch, courseId = null) {
  const { user } = useAuth();
  const storageKey = `${DRAFT_KEY_PREFIX}${user?._id || "anon"}${
    courseId ? `_${courseId}` : ""
  }`;

  // Debounced save form draft to localStorage on form state changes
  useEffect(() => {
    if (!watch) return;

    let timer = null;

    const subscription = watch((formValues) => {
      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        try {
          // Persist File values as null so non-serializable objects aren't restored as mock media
          const serializable = JSON.parse(
            JSON.stringify(formValues, (key, value) => {
              if (typeof window !== "undefined" && value instanceof File) {
                return null;
              }
              return value;
            })
          );
          localStorage.setItem(storageKey, JSON.stringify(serializable));
        } catch (e) {
          // Ignore quota exceeded or storage disabled
        }
      }, 500); // 500ms debounce
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, storageKey]);

  const hasDraft = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem(storageKey);
    } catch (e) {
      return false;
    }
  }, [storageKey]);

  const loadDraft = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
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
