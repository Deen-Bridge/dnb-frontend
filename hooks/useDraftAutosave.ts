import { useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";
import { accountStorageKey, getAccountValue, setAccountValue } from "@/lib/storage/accountStorage";

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
  const storageKey = accountStorageKey("course-draft", user?._id || null, courseId || "default");

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
          setAccountValue(localStorage, storageKey, serializable, 24 * 60 * 60 * 1000);
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
      return getAccountValue(localStorage, storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  const loadDraft = useCallback((): T | null => {
    if (typeof window === "undefined") return null;
    try {
      return getAccountValue<T>(localStorage, storageKey);
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
