import axiosInstance from "@/lib/config/axios.config";

/**
 * Re-verification reminder notification seam.
 *
 * Reminders are acknowledged only after the backend queues the delivery.
 */

export interface ReverificationReminderParams {
  mentorId?: string;
  credentialId?: string;
  credentialType?: string;
  expiresAt?: string | null;
}

export interface ReverificationReminderResult {
  queued: boolean;
  notificationId: string;
  queuedAt: string;
}

/**
 * Queue a re-verification reminder for one mentor credential.
 */
export async function sendReverificationReminder(
  reminder: ReverificationReminderParams
): Promise<ReverificationReminderResult> {
  if (!reminder?.mentorId) {
    throw new Error("mentorId is required");
  }
  if (!reminder?.credentialId) {
    throw new Error("credentialId is required");
  }
  if (!reminder?.credentialType) {
    throw new Error("credentialType is required");
  }

  const response = await axiosInstance.post("/api/admin/reverification-reminders", reminder);
  if (!response.data?.queued || !response.data?.notificationId) {
    throw new Error("The server did not confirm the re-verification reminder.");
  }
  return response.data;
}
