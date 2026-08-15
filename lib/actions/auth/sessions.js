import axiosInstance from "@/lib/config/axios.config";

// GET /api/auth/sessions -> { success, sessions: [{ id, device:{userAgent,ip,label}, lastUsedAt, isCurrent }] }
export const getSessions = async () => {
  try {
    const res = await axiosInstance.get("/api/auth/sessions");
    return { success: true, sessions: res.data?.sessions || [] };
  } catch (error) {
    console.error("Error fetching sessions:", error?.message);
    return { success: false, error: error?.message, sessions: [] };
  }
};

// DELETE /api/auth/sessions/:sessionId  (revoke one device)
export const revokeSession = async (sessionId) => {
  try {
    await axiosInstance.delete(`/api/auth/sessions/${sessionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error revoking session:", error?.message);
    return { success: false, error: error?.message };
  }
};

// DELETE /api/auth/sessions  (revoke every session except the current one)
export const revokeOtherSessions = async () => {
  try {
    const res = await axiosInstance.delete("/api/auth/sessions");
    return { success: true, count: res.data?.count ?? 0 };
  } catch (error) {
    console.error("Error revoking other sessions:", error?.message);
    return { success: false, error: error?.message };
  }
};
