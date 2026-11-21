/**
 * Notifications service.
 *
 * This module is the client-side seam for notification delivery. The live-space
 * Emergency-stop notifications are sent through the authenticated backend so
 * the UI never reports a notification that was only fabricated locally.
 */

import axiosInstance from "@/lib/config/axios.config";

export interface EmergencyStopNotificationPayload {
  spaceId: string;
  roomName: string;
  reason: string;
  endedAt: string;
  [key: string]: any; // TODO(types): Notification payload metadata
}

export interface EmergencyStopNotificationResult {
  queued: boolean;
  notificationId: string;
  hostId: string;
  payload: EmergencyStopNotificationPayload;
}

/**
 * Notify a host that an administrator ended their live space.
 */
export async function notifyHostOfEmergencyStop(
  hostId: string,
  payload: EmergencyStopNotificationPayload
): Promise<EmergencyStopNotificationResult> {
  if (!hostId) {
    throw new Error("The live-space host could not be identified.");
  }

  const response = await axiosInstance.post("/api/notifications/emergency-stop", {
    hostId,
    ...payload,
  });
  if (!response.data?.queued || !response.data?.notificationId) {
    throw new Error("The notification service did not confirm delivery.");
  }
  return response.data;
}
