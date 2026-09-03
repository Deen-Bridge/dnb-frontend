import axiosInstance from "@/lib/config/axios.config";

// Web Push subscription endpoints (issue #197).
//
// axiosInstance attaches auth + withCredentials via its interceptor, so these
// actions do not manage tokens themselves. The backend persists one push
// subscription per device/endpoint and fans out notifications with web-push.

/**
 * POST /api/users/push-subscription
 * Store (or refresh) a browser push subscription for the current user.
 * `subscription` is the JSON form of a PushSubscription; `preferences` is the
 * per-type toggle map so the backend knows which categories to deliver.
 */
export const savePushSubscription = async (subscription, preferences) => {
  try {
    const res = await axiosInstance.post("/api/users/push-subscription", {
      subscription:
        typeof subscription?.toJSON === "function"
          ? subscription.toJSON()
          : subscription,
      preferences,
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error saving push subscription:", error?.message);
    return { success: false, error: error?.message };
  }
};

/**
 * DELETE /api/users/push-subscription
 * Remove a stored subscription (identified by its endpoint) when the user
 * unsubscribes or the browser rotates the endpoint.
 */
export const deletePushSubscription = async (endpoint) => {
  try {
    const res = await axiosInstance.delete("/api/users/push-subscription", {
      data: { endpoint },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error deleting push subscription:", error?.message);
    return { success: false, error: error?.message };
  }
};

/**
 * PATCH /api/users/push-subscription/preferences
 * Update the per-type notification preferences without re-subscribing.
 */
export const updatePushPreferences = async (endpoint, preferences) => {
  try {
    const res = await axiosInstance.patch(
      "/api/users/push-subscription/preferences",
      { endpoint, preferences }
    );
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error updating push preferences:", error?.message);
    return { success: false, error: error?.message };
  }
};
