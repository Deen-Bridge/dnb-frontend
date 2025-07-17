import { getAuthToken } from@/lib/config/req.header.config";

// Fetch paginated notifications
export const fetchNotifications = async (page = 1, limit =20, filters =[object Object]) => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(`/api/notifications?${queryParams}`,[object Object]      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      notifications: data.notifications || [],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: error.message,
      notifications: ,
      total: 0    page: 1,
      totalPages: 1
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const response = await fetch(`/api/notifications/${notificationId}/read`,[object Object]      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      notification: data.notification,
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const response = await fetch("/api/notifications/mark-all-read,[object Object]      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      count: data.count || 0,
    };
  } catch (error) {
    console.error(Error marking all notifications as read:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const response = await fetch(`/api/notifications/${notificationId}`,[object Object]   method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "Notification deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const response = await fetch("/api/notifications/stats,[object Object]      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      stats: data.stats || [object Object]        total: 0,
        unread: 0
        read: 0      byType: {},
        byPriority: {},
      },
    };
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return {
      success: false,
      error: error.message,
      stats: [object Object]        total: 0,
        unread: 0
        read: 0      byType: {},
        byPriority: {},
      },
    };
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const response = await fetch("/api/notifications/preferences,[object Object]      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      preferences: data.preferences,
    };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  try[object Object]
    const token = getAuthToken();
    if (!token)[object Object]   throw new Error("Authentication required");
    }

    const response = await fetch("/api/notifications/preferences,[object Object]      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
       Content-Type":application/json",
      },
    });

    if (!response.ok)[object Object]   throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      preferences: data.preferences || {
        email: true,
        push: true,
        newsletter: false,
        courseUpdates: true,
        messageNotifications: true,
        spaceReminders: true,
      },
    };
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return {
      success: false,
      error: error.message,
      preferences: {
        email: true,
        push: true,
        newsletter: false,
        courseUpdates: true,
        messageNotifications: true,
        spaceReminders: true,
      },
    };
  }
}; 