/**
 * Notifications service.
 *
 * This module is the client-side seam for notification delivery. The live-space
 * emergency-stop notification remains stubbed until the notifications backend
 * exposes a supported endpoint. Keeping the stub here prevents moderation UI
 * code from depending on a particular notification provider.
 */

const STUB_DELAY_MS = 100;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), STUB_DELAY_MS);
  });
}

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

  return delay({
    queued: true,
    notificationId: `notification_${Date.now()}`,
    hostId,
    payload: { ...payload },
  });
}
