/**
 * Admin search-analytics service — contract tests (#326).
 * ------------------------------------------------------------------
 * The service in `lib/actions/admin-search-analytics.js` is the seam the
 * admin search-analytics page calls for the snapshot. These tests pin the
 * resolved shape the UI depends on and, crucially, that metrics without
 * backend instrumentation resolve with `tracked: false` so the page renders
 * a "not tracked yet" placeholder instead of a silent zero.
 */
import { describe, it, expect } from "vitest";
import { fetchSearchAnalytics } from "@/lib/actions/admin-search-analytics";

describe("fetchSearchAnalytics", () => {
  it("resolves a snapshot with the documented shape", async () => {
    const data = await fetchSearchAnalytics();
    expect(typeof data.generatedAt).toBe("string");
    expect(typeof data.dateRange).toBe("object");
    expect(typeof data.dateRange.from).toBe("string");
    expect(typeof data.dateRange.to).toBe("string");
  });

  it("exposes all four total metrics with the correct shape", async () => {
    const data = await fetchSearchAnalytics();
    for (const key of [
      "totalQueries",
      "uniqueQueries",
      "zeroResultQueries",
      "avgClickThroughRate",
    ]) {
      expect(data.totals[key]).toBeDefined();
      expect(typeof data.totals[key].label).toBe("string");
      expect(typeof data.totals[key].tracked).toBe("boolean");
    }
    expect(typeof data.totals.totalQueries.value).toBe("number");
    expect(typeof data.totals.uniqueQueries.value).toBe("number");
    expect(typeof data.totals.zeroResultQueries.value).toBe("number");
    // avgClickThroughRate may be null when not tracked
    expect(
      data.totals.avgClickThroughRate.value === null ||
        typeof data.totals.avgClickThroughRate.value === "number"
    ).toBe(true);
  });

  it("marks all metrics as not tracked when backend is stubbed", async () => {
    const data = await fetchSearchAnalytics();
    expect(data.totals.totalQueries.tracked).toBe(false);
    expect(data.totals.uniqueQueries.tracked).toBe(false);
    expect(data.totals.zeroResultQueries.tracked).toBe(false);
    expect(data.totals.avgClickThroughRate.tracked).toBe(false);
  });

  it("provides an empty top queries list", async () => {
    const data = await fetchSearchAnalytics();
    expect(Array.isArray(data.topQueries)).toBe(true);
    expect(data.topQueries.length).toBe(0);
  });

  it("provides an empty zero-result queries list", async () => {
    const data = await fetchSearchAnalytics();
    expect(Array.isArray(data.zeroResultQueries)).toBe(true);
    expect(data.zeroResultQueries.length).toBe(0);
  });

  it("provides weekly trends with the correct shape", async () => {
    const data = await fetchSearchAnalytics();
    expect(Array.isArray(data.weeklyTrends)).toBe(true);
    expect(data.weeklyTrends.length).toBeGreaterThan(0);
    for (const week of data.weeklyTrends) {
      expect(typeof week.week).toBe("string");
      expect(typeof week.queries).toBe("number");
      expect(typeof week.zeroResults).toBe("number");
      expect(
        week.clickThroughRate === null ||
          typeof week.clickThroughRate === "number"
      ).toBe(true);
    }
  });

  it("accepts custom date range parameters", async () => {
    const from = "2026-01-01T00:00:00.000Z";
    const to = "2026-01-31T23:59:59.999Z";
    const data = await fetchSearchAnalytics({ from, to });
    expect(data.dateRange.from).toBe(from);
    expect(data.dateRange.to).toBe(to);
  });

  it("falls back to default date range when parameters are omitted", async () => {
    const data = await fetchSearchAnalytics();
    // The from date should be approximately 30 days ago
    const fromDate = new Date(data.dateRange.from);
    const toDate = new Date(data.dateRange.to);
    const diffDays = Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it("includes an avgClickThroughRate metric with unit %", async () => {
    const data = await fetchSearchAnalytics();
    expect(data.totals.avgClickThroughRate.unit).toBe("%");
  });
});
