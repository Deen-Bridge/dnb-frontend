import axiosInstance from "@/lib/config/axios.config";

export const NOTIFICATION_FIELDS = [
  "email",
  "push",
  "inApp",
  "marketing",
  "courseUpdates",
  "prayerReminders",
  "securityAlerts",
];

export const PRIVACY_FIELDS = [
  "profileVisibility",
  "showActivity",
  "showLearningProgress",
  "allowMessagesFrom",
  "showInLeaderboards",
];

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const unwrapPreferences = (data) => data?.data || data?.preferences || data || {};

export const getAccountPreferences = async () => {
  try {
    const response = await axiosInstance.get("/api/users/me/preferences");
    return unwrapPreferences(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load your preferences."));
  }
};

export const updateAccountPreferences = async (preferences) => {
  try {
    const response = await axiosInstance.put(
      "/api/users/me/preferences",
      preferences
    );
    return unwrapPreferences(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to save your preferences."));
  }
};

export const changeAccountPassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axiosInstance.put("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to update your password."));
  }
};

export const deleteAccount = async (userId) => {
  if (!userId) {
    throw new Error("You must be signed in to delete your account.");
  }

  try {
    const response = await axiosInstance.delete(
      `/api/users/${encodeURIComponent(userId)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to delete your account."));
  }
};
