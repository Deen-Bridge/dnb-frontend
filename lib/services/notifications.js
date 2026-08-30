/**
 * Notifications service.
 *
 * This module is the client-side seam for notification delivery. The live-space
 * emergency-stop notification remains stubbed until the notifications backend
 * exposes a supported endpoint. Keeping the stub here prevents moderation UI
 * code from depending on a particular notification provider.
 */

const STUB_DELAY_MS = 100;

function delay(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), STUB_DELAY_MS);
  });
}

/**
 * Notify a host that an administrator ended their live space.
 *
 * TODO(backend): Replace the stub with the notifications API call when the
 * endpoint is available. The intended payload is retained in the returned
 * acknowledgement to make the integration contract explicit and testable.
 *
 * @param {string} hostId
 * @param {{spaceId: string, roomName: string, reason: string, endedAt: string}} payload
 * @returns {Promise<{queued: boolean, notificationId: string, hostId: string, payload: object}>}
 */
export async function notifyHostOfEmergencyStop(hostId, payload) {
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
