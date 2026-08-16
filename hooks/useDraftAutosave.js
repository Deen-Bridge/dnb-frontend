import { useEffect, useCallback, useMemo } from "react";
import useAuth from "@/hooks/useAuth";
import {
  buildDraftStorageKey,
  readDraft,
  hasDraft,
  writeDraft,
  clearDraft,
} from "@/lib/utils/draft-serialization";

/**
 * Debounced draft autosave to per-user localStorage.
 *
 * @param {function} watch - react-hook-form `watch` (subscribes to form values)
 * @param {string|null} [id] - optional draft discriminator (course id, wizard id)
 * @param {string} [prefix] - key namespace; defaults to the course-draft prefix
 */
export function useDraftAutosave(watch, id = null, prefix = "dnb_course_draft_") {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => buildDraftStorageKey(user?._id || "anon", id, prefix),
    [user?._id, id, prefix]
  );

  // Debounced save on form state changes
  useEffect(() => {
    if (!watch) return;

    let timer = null;

    const subscription = watch((formValues) => {
      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        writeDraft(storageKey, formValues);
      }, 500); // 500ms debounce
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, storageKey]);

  const loadDraft = useCallback(() => readDraft(storageKey), [storageKey]);
  const clearStoredDraft = useCallback(() => clearDraft(storageKey), [storageKey]);
  const checkHasDraft = useCallback(() => hasDraft(storageKey), [storageKey]);

  return {
    hasDraft: checkHasDraft,
    loadDraft,
    clearDraft: clearStoredDraft,
  };
}

export default useDraftAutosave;
