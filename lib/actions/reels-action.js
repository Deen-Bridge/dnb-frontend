import axiosInstance from "@/lib/config/axios.config";

const defaultPagination = {
  page: 1,
  limit: 10,
};

export const fetchReels = async ({ page, limit } = {}) => {
  try {
    const params = {
      page: page ?? defaultPagination.page,
      limit: limit ?? defaultPagination.limit,
    };
    const res = await axiosInstance.get("/api/reels", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching reels:", error);
    return {
      success: false,
      reels: [],
      page: defaultPagination.page,
      limit: defaultPagination.limit,
      total: 0,
      hasMore: false,
    };
  }
};

export const fetchReelById = async (reelId) => {
  try {
    const res = await axiosInstance.get(`/api/reels/${reelId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching reel ${reelId}:`, error);
    return null;
  }
};

export const uploadReel = async (formData) => {
  try {
    const res = await axiosInstance.post("/api/reels", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading reel:", error);
    throw error;
  }
};

export const reactToReel = async (reelId, type) => {
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/react`, { type });
    return res.data;
  } catch (error) {
    console.error(`Error reacting to reel ${reelId}:`, error);
    throw error;
  }
};

export const commentOnReel = async (reelId, text) => {
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/comments`, {
      text,
    });
    return res.data;
  } catch (error) {
    console.error(`Error commenting on reel ${reelId}:`, error);
    throw error;
  }
};

export const fetchReelComments = async (reelId, { page = 1, limit = 20 } = {}) => {
  try {
    const res = await axiosInstance.get(`/api/reels/${reelId}/comments`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching comments for reel ${reelId}:`, error);
    return {
      success: false,
      comments: [],
      page,
      limit,
      total: 0,
      hasMore: false,
    };
  }
};

export const deleteReelComment = async (reelId, commentId) => {
  try {
    const res = await axiosInstance.delete(
      `/api/reels/${reelId}/comments/${commentId}`
    );
    return res.data;
  } catch (error) {
    console.error(
      `Error deleting comment ${commentId} for reel ${reelId}:`,
      error
    );
    throw error;
  }
};

export const shareReel = async (reelId) => {
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/share`);
    return res.data;
  } catch (error) {
    console.error(`Error sharing reel ${reelId}:`, error);
    throw error;
  }
};

export const recordReelView = async (reelId) => {
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/view`);
    return res.data;
  } catch (error) {
    console.error(`Error recording view for reel ${reelId}:`, error);
    // Not throwing because view tracking shouldn't block UX
    return null;
  }
};

/**
 * Set a reel's moderation visibility (hidden / visible).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves against a small in-memory map so the optimistic
 * moderation hook (`useReelModeration`, #335) can be built and reviewed before
 * the backend endpoint exists. Swap the mock body for the `axiosInstance` call
 * shown when the backend lands. Keep the existing reel exports untouched.
 *
 * TODO(backend): PATCH /api/reels/:id/visibility
 *   - Auth: requires a moderator/admin session token (server-side tier check).
 *   - Payload: { hidden: boolean }
 *   - 200 -> { reel: { id: string, hidden: boolean, updatedAt: string } }
 *   - 403 for non-moderators; 404 if the reel does not exist.
 *
 * @param {string} reelId
 * @param {{hidden: boolean}} patch
 * @returns {Promise<{reel: {id: string, hidden: boolean, updatedAt: string}}>}
 */
const MODERATION_MOCK_DELAY_MS = 400;
const mockReelVisibility = new Map();

export const setReelVisibility = async (reelId, { hidden } = {}) => {
  // TODO(backend):
  //   return axiosInstance
  //     .patch(`/api/reels/${reelId}/visibility`, { hidden })
  //     .then((res) => res.data);
  return new Promise((resolve) => {
    setTimeout(() => {
      mockReelVisibility.set(reelId, Boolean(hidden));
      resolve({
        reel: {
          id: reelId,
          hidden: Boolean(hidden),
          updatedAt: new Date().toISOString(),
        },
      });
    }, MODERATION_MOCK_DELAY_MS);
  });
};

export const updateReelVisibility = (reelId, patch = {}) =>
  setReelVisibility(reelId, patch);

/**
 * Hide a reel from public feeds (moderation action).
 * Thin wrapper over {@link setReelVisibility}; see its `TODO(backend)` contract.
 *
 * @param {string} reelId
 * @returns {Promise<{reel: {id: string, hidden: boolean, updatedAt: string}}>}
 */
export const hideReel = (reelId) => setReelVisibility(reelId, { hidden: true });

/**
 * Unhide (restore) a previously hidden reel.
 * Thin wrapper over {@link setReelVisibility}; see its `TODO(backend)` contract.
 *
 * @param {string} reelId
 * @returns {Promise<{reel: {id: string, hidden: boolean, updatedAt: string}}>}
 */
export const unhideReel = (reelId) => setReelVisibility(reelId, { hidden: false });

/**
 * Set a reel's poster (cover image) URL.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves against a small in-memory map, same shape as
 * {@link setReelVisibility} (#335), so the poster-management UI (#265) can be
 * built and reviewed before the backend endpoint exists. The image itself is
 * already uploaded directly to Cloudinary (unsigned, `dnb_reels_posters`
 * preset) by the caller - this action only persists the resulting URL against
 * the reel. Swap the mock body for the `axiosInstance` call shown when the
 * backend lands. Keep the existing reel exports untouched.
 *
 * TODO(backend): PATCH /api/reels/:id/poster
 *   - Auth: requires a moderator/admin session token (server-side tier check).
 *   - Payload: { posterUrl: string }
 *   - 200 -> { reel: { id: string, poster: string, updatedAt: string } }
 *   - 403 for non-moderators; 404 if the reel does not exist; 422 if
 *     posterUrl is missing/not a Cloudinary URL.
 *
 * @param {string} reelId
 * @param {{posterUrl: string}} patch
 * @returns {Promise<{reel: {id: string, poster: string, updatedAt: string}}>}
 */
const POSTER_MOCK_DELAY_MS = 400;
const mockReelPosters = new Map();

export const updateReelPoster = async (reelId, { posterUrl } = {}) => {
  // TODO(backend):
  //   return axiosInstance
  //     .patch(`/api/reels/${reelId}/poster`, { posterUrl })
  //     .then((res) => res.data);
  if (!posterUrl || typeof posterUrl !== "string") {
    return Promise.reject(new Error("A poster URL is required."));
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      mockReelPosters.set(reelId, posterUrl);
      resolve({
        reel: {
          id: reelId,
          poster: posterUrl,
          updatedAt: new Date().toISOString(),
        },
      });
    }, POSTER_MOCK_DELAY_MS);
  });
};
