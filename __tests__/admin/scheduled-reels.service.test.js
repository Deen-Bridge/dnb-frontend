import { beforeEach, describe, expect, it, vi } from "vitest";

const { notifyCreator } = vi.hoisted(() => ({
  notifyCreator: vi.fn().mockResolvedValue({
    success: true,
    notificationId: "stub_notification",
    deliveredBy: "stub",
  }),
}));

vi.mock("@/lib/services/creator-notifications", () => ({
  notifyCreatorOfScheduledReelCancellation: notifyCreator,
}));

beforeEach(() => {
  vi.resetModules();
  notifyCreator.mockClear();
});

describe("scheduled reels service", () => {
  it("returns upcoming scheduled reels sorted by go-live time", async () => {
    const { listUpcomingScheduledReels } = await import(
      "@/lib/services/scheduled-reels"
    );

    const reels = await listUpcomingScheduledReels();
    const timestamps = reels.map((reel) => Date.parse(reel.scheduledFor));

    expect(reels.length).toBeGreaterThan(0);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    expect(reels.every((reel) => reel.status === "scheduled")).toBe(true);
    expect(reels.every((reel) => Date.parse(reel.scheduledFor) > Date.now())).toBe(true);
  });

  it("cancels an upcoming reel and notifies its creator", async () => {
    const { cancelScheduledReel, listUpcomingScheduledReels } = await import(
      "@/lib/services/scheduled-reels"
    );
    const [reel] = await listUpcomingScheduledReels();

    const result = await cancelScheduledReel(reel.id, {
      cancelledBy: "admin_test",
      reason: "Editorial review",
    });

    expect(result.reel.status).toBe("cancelled");
    expect(result.reel.cancelledBy).toBe("admin_test");
    expect(result.reel.cancellationReason).toBe("Editorial review");
    expect(notifyCreator).toHaveBeenCalledOnce();
    expect(notifyCreator).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: reel.creator.id,
        reelId: reel.id,
        cancelledBy: "admin_test",
        reason: "Editorial review",
      })
    );

    const remaining = await listUpcomingScheduledReels();
    expect(remaining.some((item) => item.id === reel.id)).toBe(false);
  });

  it("rejects cancellation when the scheduled reel does not exist", async () => {
    const { cancelScheduledReel } = await import(
      "@/lib/services/scheduled-reels"
    );

    await expect(
      cancelScheduledReel("missing_reel", { cancelledBy: "admin_test" })
    ).rejects.toThrow("Scheduled reel was not found.");
    expect(notifyCreator).not.toHaveBeenCalled();
  });

  it("exports the expected scheduling fields for platform integration", async () => {
    const { SCHEDULED_REEL_FIELDS } = await import(
      "@/lib/services/scheduled-reels"
    );

    expect(SCHEDULED_REEL_FIELDS).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        creator: expect.any(String),
        scheduledFor: expect.any(String),
        timezone: expect.any(String),
        status: expect.any(String),
        cancelledAt: expect.any(String),
        cancelledBy: expect.any(String),
        cancellationReason: expect.any(String),
      })
    );
  });
});
