import { beforeEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/lib/config/axios.config", () => ({ default: { get } }));

import {
  DEFAULT_ANALYTICS_RANGE_DAYS,
  MAX_ANALYTICS_RANGE_DAYS,
  fetchEngagementAnalytics,
  normalizeAnalyticsRange,
} from "@/lib/actions/admin-learning-analytics";

const response = {
  data: {
    generatedAt: "2026-11-20T00:00:00.000Z",
    freshness: "2026-11-20T00:00:00.000Z",
    totals: {
      students: { label: "Students", value: 3, tracked: true },
      coursesEnrolled: { label: "Enrollments", value: 2, tracked: true },
      lessonsCompleted: { label: "Completed", value: 1, tracked: true },
      avgSessionLength: { label: "Session", value: null, tracked: false },
    },
    funnel: [{ stage: "enrolled", label: "Enrolled", value: 2, tracked: true }],
    sessionLength: { tracked: false, avgMinutes: null },
    lessonsCompleted: { tracked: true, buckets: [{ range: "1–5", value: 1 }] },
    readingDepth: { tracked: false, buckets: [] },
    geographic: {
      tracked: true,
      coverage: { label: "Coverage", value: 100, tracked: true },
      countries: [{ code: "NG", name: "Nigeria", learners: 3, revenue: 10, tracked: true }],
    },
  },
};

describe("fetchEngagementAnalytics", () => {
  beforeEach(() => {
    get.mockReset();
    get.mockResolvedValue(response);
  });

  it("uses the authenticated authoritative endpoint and sends a bounded UTC range", async () => {
    const data = await fetchEngagementAnalytics({
      from: "2026-11-01T00:00:00.000Z",
      to: "2026-11-20T23:59:59.999Z",
    });
    expect(get).toHaveBeenCalledWith("/api/admin/analytics/engagement", {
      params: { from: "2026-11-01T00:00:00.000Z", to: "2026-11-20T23:59:59.999Z", timezone: "UTC" },
    });
    expect(data.totals.students.value).toBe(3);
    expect(data.totals.avgSessionLength.tracked).toBe(false);
    expect(data.freshness).toBe(response.data.freshness);
  });

  it("defaults to a bounded range when no dates are supplied", () => {
    const range = normalizeAnalyticsRange();
    expect((Date.parse(range.to) - Date.parse(range.from)) / 86400000).toBe(DEFAULT_ANALYTICS_RANGE_DAYS);
  });

  it("rejects malformed, reversed, and over-broad ranges before making a request", () => {
    expect(() => normalizeAnalyticsRange({ from: "not-a-date" })).toThrow("from must be a valid ISO-8601 date");
    expect(() => normalizeAnalyticsRange({ from: "2026-11-21", to: "2026-11-20" })).toThrow("from must be earlier");
    expect(() => normalizeAnalyticsRange({ from: "2025-01-01", to: "2026-01-02" })).toThrow(`cannot exceed ${MAX_ANALYTICS_RANGE_DAYS} days`);
    expect(get).not.toHaveBeenCalled();
  });

  it("does not turn an empty or partially instrumented response into zeroes", async () => {
    get.mockResolvedValueOnce({ data: { totals: {}, geographic: { tracked: false } } });
    const data = await fetchEngagementAnalytics({ from: "2026-11-01", to: "2026-11-02" });
    expect(data.totals.students.value).toBeNull();
    expect(data.totals.students.tracked).toBe(false);
    expect(data.geographic.tracked).toBe(false);
    expect(data.geographic.countries).toEqual([]);
  });

  it("preserves unauthorized endpoint failures for the admin route to handle", async () => {
    const error = Object.assign(new Error("Forbidden"), { response: { status: 403 } });
    get.mockRejectedValueOnce(error);
    await expect(fetchEngagementAnalytics({ from: "2026-11-01", to: "2026-11-02" })).rejects.toBe(error);
  });
});
