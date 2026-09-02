import axiosInstance from "@/lib/config/axios.config";

export interface FollowActionResult {
  success: boolean;
  message?: string;
  [key: string]: any; // TODO(types): Follow API response shape
}

export const followUser = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("followUser: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.post(`/api/users/follow/${userId}`, {});
    console.log("followUser response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from followUser
    console.log("Error following user:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to follow user",
    };
  }
};

export const unfollowUser = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("unfollowUser: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.delete(`/api/users/unfollow/${userId}`);
    console.log("unfollowUser response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from unfollowUser
    console.log("Error unfollowing user:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to unfollow user",
    };
  }
};

export const getFollowers = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("getFollowers: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}/followers`);
    console.log("getFollowers response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from getFollowers
    console.log("Error fetching followers:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch followers",
    };
  }
};

export const getFollowersCount = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("getFollowersCount: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}/followers/count`);
    console.log("getFollowersCount response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from getFollowersCount
    console.log("Error fetching followers count:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch followers count",
    };
  }
};

export const getFollowing = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("getFollowing: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}/following`);
    console.log("getFollowing response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from getFollowing
    console.log("Error fetching following:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch following",
    };
  }
};

export const getFollowingCount = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("getFollowingCount: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}/following/count`);
    console.log("getFollowingCount response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from getFollowingCount
    console.log("Error fetching following count:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch following count",
    };
  }
};

export const checkIfFollowing = async (userId?: string): Promise<FollowActionResult> => {
  if (!userId) {
    console.log("checkIfFollowing: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(`/api/users/${userId}/check-following`);
    console.log("checkIfFollowing response:", res.data);
    return res.data;
  } catch (e: any) { // TODO(types): Axios error from checkIfFollowing
    console.log("Error checking follow status:", e?.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to check follow status",
    };
  }
};
