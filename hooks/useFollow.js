// hooks/useFollowSystem.js
import axiosInstance from "@/lib/config/axios.config";
import config from "@/lib/config/req.header.config";

// Follow/Unfollow
export const followUser = async (userId) => {
  if (!userId) {
    console.log("followUser: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.post(
      `/api/users/follow/${userId}`,
      {},
      config
    );
    console.log("followUser response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error following user:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to follow user",
    };
  }
};

export const unfollowUser = async (userId) => {
  if (!userId) {
    console.log("unfollowUser: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.delete(
      `/api/users/unfollow/${userId}`,
      config
    );
    console.log("unfollowUser response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error unfollowing user:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to unfollow user",
    };
  }
};

// Get Followers
export const getFollowers = async (userId) => {
  if (!userId) {
    console.log("getFollowers: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(
      `/api/users/${userId}/followers`,
      config
    );
    console.log("getFollowers response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error fetching followers:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch followers",
    };
  }
};

export const getFollowersCount = async (userId) => {
  if (!userId) {
    console.log("getFollowersCount: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(
      `/api/users/${userId}/followers/count`,
      config
    );
    console.log("getFollowersCount response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error fetching followers count:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch followers count",
    };
  }
};

// Get Following
export const getFollowing = async (userId) => {
  if (!userId) {
    console.log("getFollowing: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(
      `/api/users/${userId}/following`,
      config
    );
    console.log("getFollowing response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error fetching following:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch following",
    };
  }
};

export const getFollowingCount = async (userId) => {
  if (!userId) {
    console.log("getFollowingCount: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(
      `/api/users/${userId}/following/count`,
      config
    );
    console.log("getFollowingCount response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error fetching following count:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to fetch following count",
    };
  }
};

// Check Follow Status
export const checkIfFollowing = async (userId) => {
  if (!userId) {
    console.log("checkIfFollowing: userId is undefined");
    return { success: false, message: "User ID is required" };
  }
  try {
    const res = await axiosInstance.get(
      `/api/users/${userId}/check-following`,
      config
    );
    console.log("checkIfFollowing response:", res.data);
    return res.data;
  } catch (e) {
    console.log("Error checking follow status:", e.message);
    return {
      success: false,
      message: e.response?.data?.message || "Failed to check follow status",
    };
  }
};
