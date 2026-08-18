import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * useNotificationSSE
 * ------------------
 * Real-time notification hook backed by Server-Sent Events.
 *
 * Also handles the `verification_status_update` SSE event emitted by
 * dnb-backend#92 when an educator's application state changes (e.g.
 * approved, rejected).  Consumers can subscribe via the returned
 * `onVerificationUpdate` registration helper.
 */
export const useNotificationSSE = () => {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectSSERef = useRef(null);
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastEventId, setLastEventId] = useState(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 1000;

  // Registry of callbacks interested in verification status changes.
  // Stored in a ref so re-renders don't recreate the connectSSE closure.
  const verificationCallbacksRef = useRef(new Set());

  /**
   * Register a callback that fires whenever a `verification_status_update`
   * SSE event arrives.  Returns an unsubscribe function.
   *
   * @param {(payload: { status: string, data: object }) => void} cb
   * @returns {() => void}
   */
  const onVerificationUpdate = useCallback((cb) => {
    verificationCallbacksRef.current.add(cb);
    return () => verificationCallbacksRef.current.delete(cb);
  }, []);

  const getReconnectDelay = (attempts) => {
    return Math.min(RECONNECT_DELAY * Math.pow(2, attempts), 30000);
  };

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n) => !n.isRead).length || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const connectSSE = useCallback(() => {
    if (!token || eventSourceRef.current) return;

    try {
      const eventSource = new EventSource(
        `/api/notifications/sse?token=${token}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection established");
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEventId(event.lastEventId);

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
          } else if (data.type === "verification_status_update") {
            // Emitted by dnb-backend#92 when an educator's application
            // state changes (pending → under_review, under_review → verified,
            // under_review → rejected, etc.).
            // Notify all registered subscribers (e.g. useVerificationStatus).
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

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = getReconnectDelay(reconnectAttempts);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
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
      setError(err.message);
    }
  }, [token, reconnectAttempts]);

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

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(
          `/api/notifications/${notificationId}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }

        // Optimistically update UI
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
        // Revert optimistic update on error
        fetchNotifications();
      }
    },
    [token, fetchNotifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Optimistically update UI
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      // Revert optimistic update on error
      fetchNotifications();
    }
  }, [token, fetchNotifications]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }

        // Optimistically update UI
        const deletedNotification = notifications.find(
          (n) => n._id === notificationId
        );
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
        // Revert optimistic update on error
        fetchNotifications();
      }
    },
    [token, notifications, fetchNotifications]
  );

  const reconnect = useCallback(() => {
    disconnectSSE();
    setReconnectAttempts(0);
    setError(null);
    connectSSERef.current?.();
  }, [disconnectSSE]);

  useEffect(() => {
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
  }, [token, fetchNotifications, disconnectSSE]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSSE();
    };
  }, [disconnectSSE]);

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
    /** Subscribe to educator verification status change events from SSE. */
    onVerificationUpdate,
  };
};
