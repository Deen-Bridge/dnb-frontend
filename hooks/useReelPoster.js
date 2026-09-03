"use client";
/**
 * useReelPoster - optimistic poster (cover image) update for a single reel (#265).
 * ---------------------------------------------------------------------------
 * Wraps {@link useOptimisticMutation} to update a reel's `poster` URL
 * instantly, reverting + toasting if the `PATCH /api/reels/:id/poster`
 * mutation (stubbed in `lib/actions/reels-action`) fails. Queue safety is
 * keyed by the reel id, mirroring `useReelModeration` (#335).
 *
 * This hook only persists an already-uploaded Cloudinary URL - it does not
 * perform the upload itself. See `ReelPosterDialog` for frame capture /
 * custom image upload.
 *
 * @example
 * const { poster, setPoster, isPending } = useReelPoster(reel.id, reel.poster);
 * await setPoster(uploadedSecureUrl);
 *
 * @param {string} reelId
 * @param {string|null} [initialPoster=null]
 * @returns {{ poster: string|null, setPoster: (url: string) => Promise<string|null>, isPending: boolean, error: Error|null }}
 */
import { useCallback } from "react";
import useOptimisticMutation from "@/hooks/useOptimisticMutation";
import { updateReelPoster } from "@/lib/actions/reels-action";

export default function useReelPoster(reelId, initialPoster = null) {
  const { value: poster, mutate, isPending, error } = useOptimisticMutation({
    initialValue: initialPoster ?? null,
    key: reelId,
    errorMessage: "Couldn't update this reel's poster",
  });

  /** Persist a newly uploaded poster URL (optimistic, with rollback). */
  const setPoster = useCallback(
    (posterUrl) =>
      mutate({
        applyOptimistic: () => posterUrl,
        run: (value) => updateReelPoster(reelId, { posterUrl: value }),
        commit: (result, optimistic) =>
          result?.reel ? result.reel.poster : optimistic,
      }),
    [mutate, reelId]
  );

  return { poster, setPoster, isPending, error };
}
