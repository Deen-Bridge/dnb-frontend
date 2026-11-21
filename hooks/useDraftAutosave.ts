import { useEffect, useCallback } from "react";
import useAuth from "@/hooks/useAuth";
import {
  learningStorageKey,
  LEARNING_RETENTION_MS,
  readLearningValue,
  removeLearningValue,
  writeLearningValue,
} from "@/lib/privacy/learningStorage";

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
  const userId = user?._id;
  const storageKey = userId
    ? learningStorageKey("courseDraft", userId, courseId || "new")
    : null;

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
          if (storageKey) {
            writeLearningValue(storageKey, serializable, LEARNING_RETENTION_MS.courseDraft);
          }
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
    return storageKey ? readLearningValue(storageKey) !== null : false;
  }, [storageKey]);

  const loadDraft = useCallback((): T | null => {
    return storageKey ? readLearningValue<T>(storageKey) : null;
  }, [storageKey]);

  const clearDraft = useCallback((): void => {
    if (storageKey) removeLearningValue(storageKey);
  }, [storageKey]);

  return {
    hasDraft,
    loadDraft,
    clearDraft,
  };
}

export default useDraftAutosave;
