import axiosInstance from "@/lib/config/axios.config";

const defaultPagination = {
  page: 1,
  limit: 10,
};

export interface FetchReelsParams {
  page?: number;
  limit?: number;
  /** Admin views include reels hidden by moderation. */
  includeHidden?: boolean;
}

export interface FetchReelsResult {
  success: boolean;
  reels: any[]; // TODO(types): Reel item records
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const fetchReels = async ({ page, limit, includeHidden = false }: FetchReelsParams = {}): Promise<FetchReelsResult> => {
  try {
    const params = {
      page: page ?? defaultPagination.page,
      limit: limit ?? defaultPagination.limit,
      ...(includeHidden ? { includeHidden: true } : {}),
    };
    const res = await axiosInstance.get("/api/reels", { params });
    // Do not let a stale cache or an older backend response expose moderated
    // content on any learner-facing consumer of this shared action.
    if (!includeHidden && Array.isArray(res.data?.reels)) {
      return {
        ...res.data,
        reels: res.data.reels.filter(
          (reel: any) => !reel.isHidden && reel.visibility !== "hidden"
        ),
      };
    }
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

export interface UpdateReelVisibilityPayload {
  hidden: boolean;
  /** Required when hiding; uses the shared moderation reason categories. */
  reasonCategory?: string;
  /** Required when hiding so the moderation decision is auditable. */
  reasonNote?: string;
}

/**
 * Hides or restores a reel. The backend preserves the prior publication state
 * and only removes a hidden reel from learner-facing responses.
 */
export const updateReelVisibility = async (
  reelId: string,
  payload: UpdateReelVisibilityPayload
): Promise<any> => {
  if (payload.hidden && (!payload.reasonCategory || !payload.reasonNote?.trim())) {
    throw new Error("A reason category and moderation note are required to hide a reel.");
  }
  const res = await axiosInstance.patch(`/api/admin/reels/${reelId}/visibility`, payload);
  return res.data;
};

export const fetchReelById = async (reelId: string): Promise<any | null> => { // TODO(types): Single reel detail
  try {
    const res = await axiosInstance.get(`/api/reels/${reelId}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching reel ${reelId}:`, error);
    return null;
  }
};

export const uploadReel = async (formData: FormData): Promise<any> => { // TODO(types): Upload reel response
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

export const reactToReel = async (reelId: string, type: string): Promise<any> => { // TODO(types): Reel reaction response
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/react`, { type });
    return res.data;
  } catch (error) {
    console.error(`Error reacting to reel ${reelId}:`, error);
    throw error;
  }
};

export const commentOnReel = async (reelId: string, text: string): Promise<any> => { // TODO(types): Reel comment creation response
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

export interface FetchReelCommentsParams {
  page?: number;
  limit?: number;
}

export interface FetchReelCommentsResult {
  success: boolean;
  comments: any[]; // TODO(types): Reel comments array
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const fetchReelComments = async (
  reelId: string,
  { page = 1, limit = 20 }: FetchReelCommentsParams = {}
): Promise<FetchReelCommentsResult> => {
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

export const deleteReelComment = async (reelId: string, commentId: string): Promise<any> => { // TODO(types): Delete reel comment response
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

export const shareReel = async (reelId: string): Promise<any> => { // TODO(types): Share reel response
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/share`);
    return res.data;
  } catch (error) {
    console.error(`Error sharing reel ${reelId}:`, error);
    throw error;
  }
};

export const recordReelView = async (reelId: string): Promise<any | null> => { // TODO(types): Record reel view response
  try {
    const res = await axiosInstance.post(`/api/reels/${reelId}/view`);
    return res.data;
  } catch (error) {
    console.error(`Error recording view for reel ${reelId}:`, error);
    return null;
  }
};

export interface UpdateReelPosterPayload {
  posterUrl?: string;
}

/**
 * Set a reel's poster (cover image) URL.
 * Mirrors the moderation stub pattern so the poster-management UI can be
 * exercised before the backend endpoint exists.
 */
const POSTER_MOCK_DELAY_MS = 400;
const mockReelPosters = new Map<string, string>();

export const updateReelPoster = async (
  reelId: string,
  { posterUrl }: UpdateReelPosterPayload = {}
): Promise<{ reel: { id: string; poster: string; updatedAt: string } }> => {
  if (!posterUrl || typeof posterUrl !== "string") {
    throw new Error("A poster URL is required.");
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
