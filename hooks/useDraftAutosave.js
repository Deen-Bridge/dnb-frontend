import { useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";

const DRAFT_KEY_PREFIX = "dnb_course_draft_";

export function useDraftAutosave(watch, courseId = null) {
  const { user } = useAuth();
  const storageKey = `${DRAFT_KEY_PREFIX}${user?._id || "anon"}${
    courseId ? `_${courseId}` : ""
  }`;

  // Save form draft to localStorage on form state changes
  useEffect(() => {
    if (!watch) return;
    const subscription = watch((formValues) => {
      try {
        // Strip non-serializable File objects
        const serializable = JSON.parse(
          JSON.stringify(formValues, (key, value) => {
            if (typeof window !== "undefined" && value instanceof File) {
              return { _file: true, name: value.name, size: value.size };
            }
            return value;
          })
        );
        localStorage.setItem(storageKey, JSON.stringify(serializable));
      } catch (e) {
        // Ignore quota exceeded or storage disabled
      }
    });

    return () => subscription.unsubscribe();
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
