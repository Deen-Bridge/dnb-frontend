import axiosInstance from "@/lib/config/axios.config";

export interface SessionDevice {
  userAgent?: string;
  ip?: string;
  label?: string;
}

export interface UserSession {
  id: string;
  device?: SessionDevice;
  lastUsedAt?: string;
  isCurrent?: boolean;
}

export interface GetSessionsResult {
  success: boolean;
  sessions: UserSession[];
  error?: string;
}

export const getSessions = async (): Promise<GetSessionsResult> => {
  try {
    const res = await axiosInstance.get("/api/auth/sessions");
    return { success: true, sessions: res.data?.sessions || [] };
  } catch (error: any) { // TODO(types): Axios error from sessions endpoint
    console.error("Error fetching sessions:", error?.message);
    return { success: false, error: error?.message, sessions: [] };
  }
};

export interface RevokeSessionResult {
  success: boolean;
  error?: string;
}

export const revokeSession = async (sessionId: string): Promise<RevokeSessionResult> => {
  try {
    await axiosInstance.delete(`/api/auth/sessions/${sessionId}`);
    return { success: true };
  } catch (error: any) { // TODO(types): Axios error from revoke session
    console.error("Error revoking session:", error?.message);
    return { success: false, error: error?.message };
  }
};

export interface RevokeOtherSessionsResult {
  success: boolean;
  count?: number;
  error?: string;
}

export const revokeOtherSessions = async (): Promise<RevokeOtherSessionsResult> => {
  try {
    const res = await axiosInstance.delete("/api/auth/sessions");
    return { success: true, count: res.data?.count ?? 0 };
  } catch (error: any) { // TODO(types): Axios error from revoke other sessions
    console.error("Error revoking other sessions:", error?.message);
    return { success: false, error: error?.message };
  }
};
