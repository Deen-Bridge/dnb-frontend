/**
 * Stub notification adapter for creator-facing publishing notifications.
 * Replace this implementation with the platform notification API when it is
 * available without changing callers of this service.
 */

/**
 * Notify a creator that an administrator cancelled one of their scheduled reels.
 *
 * @param {Object} notification
 * @param {string} notification.creatorId
 * @param {string} notification.reelId
 * @param {string} notification.reelCaption
 * @param {string} notification.scheduledFor
 * @param {string} notification.cancelledBy
 * @param {string} [notification.reason]
 * @returns {Promise<{success: boolean, notificationId: string, deliveredBy: string}>}
 */
export async function notifyCreatorOfScheduledReelCancellation(notification) {
  if (!notification?.creatorId || !notification?.reelId) {
    throw new Error("Creator and reel identifiers are required for notification.");
  }

  return {
    success: true,
    notificationId: `stub_reel_cancelled_${notification.reelId}`,
    deliveredBy: "stub",
  };
}
