import { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/config/axios.config";
import { config } from "@/lib/config/env";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

const getReconnectDelay = (attempts: number): number => {
  return Math.min(RECONNECT_DELAY * Math.pow(2, attempts), 30000);
};

const getAuthToken = (): string | undefined => Cookies.get("authToken");

export interface SseNotification {
  _id: string;
  isRead?: boolean;
  title?: string;
  message?: string;
  type?: string;
  [key: string]: any; // TODO(types): Notification payload
}

export interface VerificationUpdatePayload {
  status: string;
  data: Record<string, any>; // TODO(types): Application data payload
}

export interface UseNotificationSSEResult {
  notifications: SseNotification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  reconnectAttempts: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  reconnect: () => void;
  refetch: () => Promise<void>;
  onVerificationUpdate: (cb: (payload: VerificationUpdatePayload) => void) => () => void;
}

export const useNotificationSSE = (): UseNotificationSSEResult => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectSSERef = useRef<(() => void) | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const notificationsRef = useRef<SseNotification[]>([]);

  const [notifications, setNotifications] = useState<SseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  const verificationCallbacksRef = useRef<Set<(payload: VerificationUpdatePayload) => void>>(new Set());

  const onVerificationUpdate = useCallback((cb: (payload: VerificationUpdatePayload) => void) => {
    verificationCallbacksRef.current.add(cb);
    return () => verificationCallbacksRef.current.delete(cb);
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/notifications", {
        params: { page: 1, limit: 50 },
      });

      const data = response.data || {};
      const items: SseNotification[] = data.notifications || [];
      setNotifications(items);
      notificationsRef.current = items;
      setUnreadCount(
        data.unreadCount ?? items.filter((n) => !n.isRead).length
      );
      setError(null);
    } catch (err: any) { // TODO(types): Error from notification fetch
      console.error("Error fetching notifications:", err);
      setError(err?.response?.data?.message || err?.message || "Error fetching notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectSSE = useCallback(() => {
    const token = getAuthToken();
    if (!token || eventSourceRef.current) return;

    try {
      const sseUrl = `${config.apiUrl}/api/notifications/sse?token=${encodeURIComponent(
        token
      )}`;
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        setReconnectAttempts(0);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "new_notification") {
            setNotifications((prev) => {
              const next = [data.notification, ...prev];
              notificationsRef.current = next;
              return next;
            });
            setUnreadCount((prev) => prev + 1);
          } else if (data.type === "notification_read") {
            setNotifications((prev) => {
              const next = prev.map((n) =>
                n._id === data.notificationId ? { ...n, isRead: true } : n
              );
              notificationsRef.current = next;
              return next;
            });
            setUnreadCount((prev) => Math.max(0, prev - 1));
          } else if (data.type === "notification_deleted") {
            setNotifications((prev) => {
              const next = prev.filter((n) => n._id !== data.notificationId);
              notificationsRef.current = next;
              return next;
            });
            setUnreadCount((prev) => {
              const deletedNotification = notificationsRef.current.find(
                (n) => n._id === data.notificationId
              );
              return deletedNotification && !deletedNotification.isRead
                ? Math.max(0, prev - 1)
                : prev;
            });
          } else if (data.type === "all_read") {
            setNotifications((prev) => {
              const next = prev.map((n) => ({ ...n, isRead: true }));
              notificationsRef.current = next;
              return next;
            });
            setUnreadCount(0);
          } else if (data.type === "verification_status_update") {
            verificationCallbacksRef.current.forEach((cb) => {
              try {
                cb({ status: data.status, data: data.applicationData ?? {} });
              } catch (e) {
                console.error("verification update callback error:", e);
              }
            });
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = getReconnectDelay(reconnectAttemptsRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            setReconnectAttempts(reconnectAttemptsRef.current);
            connectSSERef.current?.();
          }, delay);
        } else {
          setError(
            "Failed to connect to notification service after multiple attempts"
          );
        }
      };
    } catch (err: any) { // TODO(types): Error from EventSource creation
      console.error("Error creating SSE connection:", err);
      setError(err?.message || "Failed to connect to notification service");
    }
  }, []);

  connectSSERef.current = connectSSE;

  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const previous = notificationsRef.current;
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      notificationsRef.current = next;
      return next;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setNotifications(previous);
      notificationsRef.current = previous;
      setUnreadCount(previous.filter((n) => !n.isRead).length);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    const previous = notificationsRef.current;
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      notificationsRef.current = next;
      return next;
    });
    setUnreadCount(0);

    try {
      await axiosInstance.put("/api/notifications/mark-all-read");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setNotifications(previous);
      notificationsRef.current = previous;
      setUnreadCount(previous.filter((n) => !n.isRead).length);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const token = getAuthToken();
    if (!token) return;

    const previous = notificationsRef.current;
    setNotifications((prev) => {
      const next = prev.filter((n) => n._id !== notificationId);
      notificationsRef.current = next;
      return next;
    });
    setUnreadCount((prev) => {
      const deletedNotification = previous.find(
        (n) => n._id === notificationId
      );
      return deletedNotification && !deletedNotification.isRead
        ? Math.max(0, prev - 1)
        : prev;
    });

    try {
      await axiosInstance.delete(`/api/notifications/${notificationId}`);
    } catch (err) {
      console.error("Error deleting notification:", err);
      setNotifications(previous);
      notificationsRef.current = previous;
      setUnreadCount(previous.filter((n) => !n.isRead).length);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnectSSE();
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
    setError(null);
    connectSSERef.current?.();
  }, [disconnectSSE]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchNotifications();
      connectSSERef.current?.();
    } else {
      disconnectSSE();
      setNotifications([]);
      notificationsRef.current = [];
      setUnreadCount(0);
      setIsLoading(false);
    }

    return () => {
      disconnectSSE();
    };
  }, [fetchNotifications, disconnectSSE]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    reconnectAttempts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reconnect,
    refetch: fetchNotifications,
    onVerificationUpdate,
  };
};
