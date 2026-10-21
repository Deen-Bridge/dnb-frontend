import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import { fetchSearchAnalytics } from "@/lib/actions/admin-search-analytics";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn() },
}));

describe("fetchSearchAnalytics", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads and normalizes the live search analytics endpoints", async () => {
    axiosInstance.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            totalSearches: 42,
            uniqueQueries: 18,
            zeroResultSearches: 7,
            zeroResultRate: 16.67,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ query: "green shoes", count: 12, lastSearched: "2026-10-20" }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ query: "blue boots", count: 3, lastSearched: "2026-10-19" }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ _id: "2026-10-19", total: 10, zeroResults: 2 }],
        },
      });

    const from = "2026-10-01T00:00:00.000Z";
    const to = "2026-10-21T00:00:00.000Z";
    const result = await fetchSearchAnalytics({ from, to });

    expect(axiosInstance.get).toHaveBeenNthCalledWith(1, "/api/analytics/search/summary", {
      params: { startDate: from, endDate: to },
    });
    expect(axiosInstance.get).toHaveBeenNthCalledWith(2, "/api/analytics/search/top", {
      params: { startDate: from, endDate: to, limit: 100, page: 1 },
    });
    expect(axiosInstance.get).toHaveBeenNthCalledWith(
      3,
      "/api/analytics/search/zero-results",
      { params: { startDate: from, endDate: to, limit: 100, page: 1 } },
    );
    expect(axiosInstance.get).toHaveBeenNthCalledWith(4, "/api/analytics/search/trends", {
      params: { startDate: from, endDate: to },
    });

    expect(result.dateRange).toEqual({ from, to });
    expect(result.totals.totalQueries).toMatchObject({ value: 42, tracked: true });
    expect(result.totals.uniqueQueries).toMatchObject({ value: 18, tracked: true });
    expect(result.totals.zeroResultQueries).toMatchObject({ value: 7, tracked: true });
    expect(result.totals.avgClickThroughRate).toMatchObject({ value: null, tracked: false });
    expect(result.topQueries[0]).toMatchObject({
      query: "green shoes",
      count: 12,
      clickThroughRate: null,
      trend: null,
    });
    expect(result.zeroResultQueries[0]).toMatchObject({ query: "blue boots", count: 3 });
    expect(result.weeklyTrends).toHaveLength(1);
    expect(result.weeklyTrends[0]).toMatchObject({ queries: 10, zeroResults: 2 });
  });

  it("rejects API errors so the page can render its existing error state", async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error("Analytics unavailable"));

    await expect(fetchSearchAnalytics()).rejects.toThrow("Analytics unavailable");
  });
});
