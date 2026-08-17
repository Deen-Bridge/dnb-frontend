import { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/config/axios.config";
import { config } from "@/lib/config/env";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

const getReconnectDelay = (attempts) => {
  return Math.min(RECONNECT_DELAY * Math.pow(2, attempts), 30000);
};

const getAuthToken = () => Cookies.get("authToken");

export const useNotificationSSE = () => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectSSERef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const notificationsRef = useRef([]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/notifications", {
        params: { page: 1, limit: 50 },
      });

      const data = response.data || {};
      const items = data.notifications || [];
      setNotifications(items);
      setUnreadCount(
        data.unreadCount ?? items.filter((n) => !n.isRead).length
      );
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectSSE = useCallback(() => {
    const token = getAuthToken();
    if (!token || eventSourceRef.current) return;

    try {
      // EventSource cannot send an Authorization header, so the JWT is passed
      // as a query param. The backend's /api/notifications/sse route reads
      // req.query.token via its sseAuth middleware
      // (dnb-backend/src/routes/notificationRoutes.js), so this is the
      // supported path. Tradeoff: the token is exposed in server/proxy logs
      // for this request. A short-lived SSE ticket would be cleaner but is
      // not implemented on the backend yet.
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
            setNotifications((prev) => [data.notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } else if (data.type === "notification_read") {
            setNotifications((prev) =>
              prev.map((n) =>
                n._id === data.notificationId ? { ...n, isRead: true } : n
              )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
          } else if (data.type === "notification_deleted") {
            setNotifications((prev) =>
              prev.filter((n) => n._id !== data.notificationId)
            );
            setUnreadCount((prev) => {
              const deletedNotification = prev.find(
                (n) => n._id === data.notificationId
              );
              return deletedNotification && !deletedNotification.isRead
                ? Math.max(0, prev - 1)
                : prev;
            });
          } else if (data.type === "all_read") {
            setNotifications((prev) =>
              prev.map((n) => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
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
    } catch (err) {
      console.error("Error creating SSE connection:", err);
      setError(err?.message || "Failed to connect to notification service");
    }
  }, []);

  connectSSERef.current = connectSSE;

  // Disconnect from SSE
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

  // Mark notification as read (optimistic, with rollback on failure)
  const markAsRead = useCallback(async (notificationId) => {
    const token = getAuthToken();
    if (!token) return;

    const previous = notificationsRef.current;
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setNotifications(previous);
      setUnreadCount(previous.filter((n) => !n.isRead).length);
    }
  }, []);

  // Mark all notifications as read (optimistic, with rollback on failure)
  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    const previous = notificationsRef.current;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await axiosInstance.put("/api/notifications/mark-all-read");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setNotifications(previous);
      setUnreadCount(previous.filter((n) => !n.isRead).length);
    }
  }, []);

  // Delete notification (optimistic, with rollback on failure)
  const deleteNotification = useCallback(async (notificationId) => {
    const token = getAuthToken();
    if (!token) return;

    const previous = notificationsRef.current;
    setNotifications((prev) =>
      prev.filter((n) => n._id !== notificationId)
    );
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
  };
};