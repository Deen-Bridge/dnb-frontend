import axiosInstance from "@/lib/config/axios.config";

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
  [key: string]: any; // TODO(types): Notification item attributes
}

export interface FetchNotificationsResult {
  success: boolean;
  notifications: NotificationItem[];
  total: number;
  page: number;
  totalPages: number;
  unread: number;
  error?: string;
}

export const fetchNotifications = async (
  page: number = 1,
  limit: number = 20,
  filters: Record<string, any> = {} // TODO(types): Notification filter params
): Promise<FetchNotificationsResult> => {
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
  } catch (error: any) { // TODO(types): Axios error from notification fetch
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

export interface MarkNotificationAsReadResult {
  success: boolean;
  notification?: NotificationItem;
  error?: string;
}

export const markNotificationAsRead = async (notificationId: string): Promise<MarkNotificationAsReadResult> => {
  try {
    const res = await axiosInstance.put(
      `/api/notifications/${notificationId}/read`
    );
    return { success: true, notification: res.data?.notification };
  } catch (error: any) { // TODO(types): Axios error from mark notification as read
    console.error("Error marking notification as read:", error?.message);
    return { success: false, error: error?.message };
  }
};

export interface MarkAllNotificationsAsReadResult {
  success: boolean;
  count?: number;
  error?: string;
}

export const markAllNotificationsAsRead = async (): Promise<MarkAllNotificationsAsReadResult> => {
  try {
    const res = await axiosInstance.put("/api/notifications/mark-all-read");
    return { success: true, count: res.data?.count ?? 0 };
  } catch (error: any) { // TODO(types): Axios error from mark all read
    console.error("Error marking all notifications as read:", error?.message);
    return { success: false, error: error?.message };
  }
};

export interface DeleteNotificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const deleteNotification = async (notificationId: string): Promise<DeleteNotificationResult> => {
  try {
    const res = await axiosInstance.delete(
      `/api/notifications/${notificationId}`
    );
    return {
      success: true,
      message: res.data?.message || "Notification deleted",
    };
  } catch (error: any) { // TODO(types): Axios error from delete notification
    console.error("Error deleting notification:", error?.message);
    return { success: false, error: error?.message };
  }
};

export interface NotificationSettingsResult {
  success: boolean;
  settings: Record<string, any>; // TODO(types): Notification preferences settings dictionary
  error?: string;
}

export const getNotificationSettings = async (): Promise<NotificationSettingsResult> => {
  try {
    const res = await axiosInstance.get("/api/notifications/settings");
    return { success: true, settings: res.data?.settings || res.data || {} };
  } catch (error: any) { // TODO(types): Axios error from get settings
    console.error("Error fetching notification settings:", error?.message);
    return { success: false, error: error?.message, settings: {} };
  }
};
