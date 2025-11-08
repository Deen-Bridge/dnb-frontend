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
