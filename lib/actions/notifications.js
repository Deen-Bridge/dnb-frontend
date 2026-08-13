import axiosInstance from "@/lib/config/axios.config";

// axiosInstance attaches auth + withCredentials via its interceptor, so these
// actions do not manage tokens themselves.

// GET /api/notifications?page=&limit=
export const fetchNotifications = async (page = 1, limit = 20, filters = {}) => {
  try {
    const res = await axiosInstance.get("/api/notifications", {
      params: { page, limit, ...filters },
    });
    const data = res.data || {};
    return {
      success: true,
      notifications: data.notifications || [],
      total: data.total ?? 0,
      page: data.page ?? page,
      totalPages: data.totalPages ?? 1,
      unread: data.unread ?? 0,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error?.message);
    return {
      success: false,
      error: error?.message,
      notifications: [],
      total: 0,
      page: 1,
      totalPages: 1,
      unread: 0,
    };
  }
};

// PUT /api/notifications/:id/read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await axiosInstance.put(
      `/api/notifications/${notificationId}/read`
    );
    return { success: true, notification: res.data?.notification };
  } catch (error) {
    console.error("Error marking notification as read:", error?.message);
    return { success: false, error: error?.message };
  }
};

// PUT /api/notifications/mark-all-read
export const markAllNotificationsAsRead = async () => {
  try {
    const res = await axiosInstance.put("/api/notifications/mark-all-read");
    return { success: true, count: res.data?.count ?? 0 };
  } catch (error) {
    console.error("Error marking all notifications as read:", error?.message);
    return { success: false, error: error?.message };
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (notificationId) => {
  try {
    const res = await axiosInstance.delete(
      `/api/notifications/${notificationId}`
    );
    return {
      success: true,
      message: res.data?.message || "Notification deleted",
    };
  } catch (error) {
    console.error("Error deleting notification:", error?.message);
    return { success: false, error: error?.message };
  }
};

// GET /api/notifications/settings
export const getNotificationSettings = async () => {
  try {
    const res = await axiosInstance.get("/api/notifications/settings");
    return { success: true, settings: res.data?.settings || res.data || {} };
  } catch (error) {
    console.error("Error fetching notification settings:", error?.message);
    return { success: false, error: error?.message, settings: {} };
  }
};
