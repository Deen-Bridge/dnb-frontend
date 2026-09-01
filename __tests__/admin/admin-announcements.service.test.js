/**
 * Admin announcement analytics service — reach & engagement snapshot (#305).
 * ---------------------------------------------------------------------------
 * The service computes dismiss rate, carries explicit `tracked` flags so the
 * UI can show honest gaps for events that aren't instrumented yet (CTR), and
 * exposes the minimal event names proposed for backend alignment.
 */
import { describe, it, expect } from "vitest";
import {
  fetchAnnouncementAnalytics,
  ANNOUNCEMENT_EVENT_NAMES,
} from "@/lib/actions/admin-announcements";

describe("fetchAnnouncementAnalytics", () => {
  it("resolves per-announcement stats with tracked flags", async () => {
    const analytics = await fetchAnnouncementAnalytics();

    expect(analytics.announcements.length).toBeGreaterThan(0);
    for (const ann of analytics.announcements) {
      expect(ann).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        sentAt: expect.any(String),
        impressions: { value: expect.any(Number), tracked: true },
        uniqueViewers: { value: expect.any(Number), tracked: true },
      });
    }
  });

  it("calculates dismiss rate from dismissals and impressions", async () => {
    const analytics = await fetchAnnouncementAnalytics();
    const ann = analytics.announcements[0];

    expect(ann.dismissRate.tracked).toBe(true);
    expect(ann.dismissRate.value).toBeGreaterThan(0);
    expect(ann.dismissRate.unit).toBe("percent");
  });

  it("reports untracked metrics honestly (CTR not instrumented yet)", async () => {
    const analytics = await fetchAnnouncementAnalytics();

    expect(analytics.totals.ctr.tracked).toBe(false);
    for (const ann of analytics.announcements) {
      expect(ann.ctr.tracked).toBe(false);
    }
  });

  it("sums totals across announcements", async () => {
    const analytics = await fetchAnnouncementAnalytics();
    const expectedImpressions = analytics.announcements.reduce(
      (total, ann) => total + ann.impressions.value,
      0
    );
    const expectedViewers = analytics.announcements.reduce(
      (total, ann) => total + ann.uniqueViewers.value,
      0
    );

    expect(analytics.totals.impressions.value).toBe(expectedImpressions);
    expect(analytics.totals.uniqueViewers.value).toBe(expectedViewers);
  });

  it("echoes the requested date range", async () => {
    const analytics = await fetchAnnouncementAnalytics({
      from: "2026-08-01",
      to: "2026-08-31",
    });

    expect(analytics.range).toEqual({ from: "2026-08-01", to: "2026-08-31" });
  });

  it("exposes minimal event names for backend alignment", () => {
    expect(ANNOUNCEMENT_EVENT_NAMES).toMatchObject({
      impression: "announcement.impression",
      view: "announcement.view",
      dismiss: "announcement.dismiss",
      linkClick: "announcement.link_click",
    });
  });
});
