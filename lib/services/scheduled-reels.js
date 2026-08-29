import { notifyCreatorOfScheduledReelCancellation } from "@/lib/services/creator-notifications";

/**
 * Expected scheduled reel contract for future platform integration.
 *
 * @typedef {Object} ScheduledReel
 * @property {string} id Stable reel identifier.
 * @property {string} caption Creator-provided reel caption.
 * @property {string|null} thumbnailUrl Optional preview image URL.
 * @property {{id: string, name: string, email: string}} creator Reel owner.
 * @property {string} scheduledFor ISO-8601 go-live timestamp.
 * @property {string} timezone IANA timezone selected by the creator.
 * @property {"scheduled"|"publishing"|"published"|"cancelled"} status Publishing state.
 * @property {string} createdAt ISO-8601 creation timestamp.
 * @property {string} updatedAt ISO-8601 last-update timestamp.
 * @property {string|null} cancelledAt ISO-8601 cancellation timestamp when cancelled.
 * @property {string|null} cancelledBy Administrator identifier when cancelled.
 * @property {string|null} cancellationReason Optional administrator-provided reason.
 */

export const SCHEDULED_REEL_FIELDS = Object.freeze({
  id: "Stable reel identifier",
  caption: "Creator-provided reel caption",
  thumbnailUrl: "Optional preview image URL",
  creator: "Creator object containing id, name, and email",
  scheduledFor: "ISO-8601 go-live timestamp",
  timezone: "IANA timezone selected by the creator",
  status: "scheduled, publishing, published, or cancelled",
  createdAt: "ISO-8601 creation timestamp",
  updatedAt: "ISO-8601 last-update timestamp",
  cancelledAt: "ISO-8601 cancellation timestamp or null",
  cancelledBy: "Cancelling administrator identifier or null",
  cancellationReason: "Optional cancellation reason or null",
});

const hoursFromNow = (hours) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

/** @type {ScheduledReel[]} */
let scheduledReels = [
  {
    id: "reel_scheduled_103",
    caption: "A reminder about maintaining good character in daily life.",
    thumbnailUrl: null,
    creator: {
      id: "creator_103",
      name: "Ustadha Maryam J.",
      email: "maryam@example.com",
    },
    scheduledFor: hoursFromNow(72),
    timezone: "Europe/London",
    status: "scheduled",
    createdAt: hoursFromNow(-12),
    updatedAt: hoursFromNow(-12),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
  },
  {
    id: "reel_scheduled_101",
    caption: "Three practical ways to prepare for the Friday prayer.",
    thumbnailUrl: null,
    creator: {
      id: "creator_101",
      name: "Sheikh Ibrahim",
      email: "ibrahim@example.com",
    },
    scheduledFor: hoursFromNow(8),
    timezone: "Africa/Lagos",
    status: "scheduled",
    createdAt: hoursFromNow(-30),
    updatedAt: hoursFromNow(-4),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
  },
  {
    id: "reel_scheduled_102",
    caption: "A short reflection on gratitude and using our time well.",
    thumbnailUrl: null,
    creator: {
      id: "creator_102",
      name: "Dr. Amina Yusuf",
      email: "amina@example.com",
    },
    scheduledFor: hoursFromNow(30),
    timezone: "America/New_York",
    status: "scheduled",
    createdAt: hoursFromNow(-20),
    updatedAt: hoursFromNow(-6),
    cancelledAt: null,
    cancelledBy: null,
    cancellationReason: null,
  },
];

const cloneReel = (reel) => ({
  ...reel,
  creator: { ...reel.creator },
});

/**
 * Return only future reels that remain scheduled, sorted by earliest go-live time.
 * This in-memory adapter can be replaced by a platform request while preserving
 * the return shape.
 *
 * @returns {Promise<ScheduledReel[]>}
 */
export async function listUpcomingScheduledReels() {
  const now = Date.now();

  return scheduledReels
    .filter(
      (reel) =>
        reel.status === "scheduled" &&
        Number.isFinite(Date.parse(reel.scheduledFor)) &&
        Date.parse(reel.scheduledFor) > now
    )
    .sort(
      (first, second) =>
        Date.parse(first.scheduledFor) - Date.parse(second.scheduledFor)
    )
    .map(cloneReel);
}

/**
 * Cancel a reel before publishing and notify its creator through the stub adapter.
 *
 * @param {string} reelId
 * @param {{cancelledBy: string, reason?: string}} cancellation
 * @returns {Promise<{reel: ScheduledReel, notification: {success: boolean, notificationId: string, deliveredBy: string}}>} 
 */
export async function cancelScheduledReel(reelId, cancellation) {
  const reelIndex = scheduledReels.findIndex((reel) => reel.id === reelId);

  if (reelIndex === -1) {
    throw new Error("Scheduled reel was not found.");
  }

  const reel = scheduledReels[reelIndex];
  if (reel.status !== "scheduled" || Date.parse(reel.scheduledFor) <= Date.now()) {
    throw new Error("This reel can no longer be cancelled before publishing.");
  }

  if (!cancellation?.cancelledBy) {
    throw new Error("The cancelling administrator is required.");
  }

  const cancelledAt = new Date().toISOString();
  const cancelledReel = {
    ...reel,
    status: "cancelled",
    updatedAt: cancelledAt,
    cancelledAt,
    cancelledBy: cancellation.cancelledBy,
    cancellationReason: cancellation.reason?.trim() || null,
  };

  scheduledReels = scheduledReels.map((item) =>
    item.id === reelId ? cancelledReel : item
  );

  const notification = await notifyCreatorOfScheduledReelCancellation({
    creatorId: reel.creator.id,
    reelId: reel.id,
    reelCaption: reel.caption,
    scheduledFor: reel.scheduledFor,
    cancelledBy: cancellation.cancelledBy,
    reason: cancellation.reason?.trim() || "",
  });

  return {
    reel: cloneReel(cancelledReel),
    notification,
  };
}
