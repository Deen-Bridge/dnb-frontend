/**
 * Search analytics page — loading / data / error state tests (#326).
 * -------------------------------------------------------------------
 * The page renders query volume charts, CTR trend, top queries table,
 * and zero-result queries list. Metrics the platform does not instrument
 * yet must render an explicit "Not tracked yet" placeholder instead of
 * a silent zero. These tests mock the analytics service and assert the
 * presentational branching only.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

const serviceState = vi.hoisted(() => ({ current: null }));
vi.mock("@/lib/actions/admin-search-analytics", () => ({
  fetchSearchAnalytics: (...args) => serviceState.current(...args),
}));

function makeAnalytics(overrides = {}) {
  return {
    generatedAt: "2026-08-25T00:00:00.000Z",
    dateRange: {
      from: "2026-07-26T00:00:00.000Z",
      to: "2026-08-25T00:00:00.000Z",
    },
    totals: {
      totalQueries: { label: "Total Queries", value: 0, tracked: false },
      uniqueQueries: { label: "Unique Queries", value: 0, tracked: false },
      zeroResultQueries: {
        label: "Zero-Result Queries",
        value: 0,
        tracked: false,
      },
      avgClickThroughRate: {
        label: "Avg. Click-Through Rate",
        value: null,
        tracked: false,
        unit: "%",
      },
    },
    topQueries: [],
    zeroResultQueries: [],
    weeklyTrends: [
      { week: "Week 1", queries: 0, zeroResults: 0, clickThroughRate: null },
      { week: "Week 2", queries: 0, zeroResults: 0, clickThroughRate: null },
      { week: "Week 3", queries: 0, zeroResults: 0, clickThroughRate: null },
      { week: "Week 4", queries: 0, zeroResults: 0, clickThroughRate: null },
    ],
    ...overrides,
  };
}

let SearchAnalyticsPage;
beforeEach(async () => {
  if (!SearchAnalyticsPage) {
    const mod = await import(
      "@/app/[locale]/admin/analytics/search/page"
    );
    SearchAnalyticsPage = mod.default;
  }
});

describe("SearchAnalyticsPage — states", () => {
  it("renders skeleton placeholders while loading", () => {
    serviceState.current = () => new Promise(() => {});
    const { container } = render(<SearchAnalyticsPage />);
    expect(screen.getByText("Search Analytics")).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="skeleton"]')
    ).not.toBeNull();
  });

  it("renders summary stat cards when data loads", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<SearchAnalyticsPage />);

    expect(
      await screen.findByText("Search Analytics")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Queries")).toBeInTheDocument();
    expect(screen.getByText("Unique Queries")).toBeInTheDocument();
    expect(
      screen.getAllByText("Zero-Result Queries").length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Avg. Click-Through Rate")
    ).toBeInTheDocument();
  });

  it("shows 'Not tracked yet' placeholders for untracked metrics", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<SearchAnalyticsPage />);

    await screen.findByText("Search Analytics");

    const placeholders = screen.getAllByText(/not tracked yet/i);
    // At least the 4 summary stat cards + charts + tables
    expect(placeholders.length).toBeGreaterThanOrEqual(4);
  });

  it("renders the top queries and zero-result sections", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<SearchAnalyticsPage />);

    await screen.findByText("Search Analytics");
    expect(screen.getAllByText("Top Queries").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Zero-Result Queries").length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders top queries data when available", async () => {
    const data = makeAnalytics({
      topQueries: [
        {
          query: "quran tafsir",
          count: 142,
          clickThroughRate: 67.5,
          trend: 12.3,
        },
        {
          query: "arabic grammar",
          count: 98,
          clickThroughRate: 45.2,
          trend: -5.1,
        },
      ],
      totals: {
        totalQueries: { label: "Total Queries", value: 240, tracked: true },
        uniqueQueries: { label: "Unique Queries", value: 87, tracked: true },
        zeroResultQueries: {
          label: "Zero-Result Queries",
          value: 12,
          tracked: true,
        },
        avgClickThroughRate: {
          label: "Avg. Click-Through Rate",
          value: 56.3,
          tracked: true,
          unit: "%",
        },
      },
    });
    serviceState.current = () => Promise.resolve(data);
    render(<SearchAnalyticsPage />);

    await screen.findByText("quran tafsir");
    expect(screen.getByText("arabic grammar")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("67.5%")).toBeInTheDocument();
    expect(screen.getByText("45.2%")).toBeInTheDocument();
    expect(screen.getByText("240")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("56.3%")).toBeInTheDocument();
  });

  it("renders zero-result queries data when available", async () => {
    const data = makeAnalytics({
      zeroResultQueries: [
        {
          query: "advanced nahw exercises",
          count: 8,
          lastSearched: "2026-08-20T10:00:00.000Z",
        },
      ],
      totals: {
        totalQueries: { label: "Total Queries", value: 240, tracked: true },
        uniqueQueries: { label: "Unique Queries", value: 87, tracked: true },
        zeroResultQueries: {
          label: "Zero-Result Queries",
          value: 12,
          tracked: true,
        },
        avgClickThroughRate: {
          label: "Avg. Click-Through Rate",
          value: 56.3,
          tracked: true,
          unit: "%",
        },
      },
    });
    serviceState.current = () => Promise.resolve(data);
    render(<SearchAnalyticsPage />);

    await screen.findByText(/advanced nahw exercises/);
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(
      screen.getByText("advanced nahw exercises").closest("tr")
    ).toBeTruthy();
  });

  it("renders an error state when the analytics service fails", async () => {
    serviceState.current = () =>
      Promise.reject(new Error("Service unavailable"));
    render(<SearchAnalyticsPage />);

    expect(
      await screen.findByText(/failed to load search analytics/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Service unavailable")).toBeInTheDocument();
  });

  it("renders weekly trends chart sections", async () => {
    serviceState.current = () => Promise.resolve(makeAnalytics());
    render(<SearchAnalyticsPage />);

    await screen.findByText("Search Analytics");
    expect(
      screen.getByText("Weekly Query Volume")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Click-Through Rate Trend")
    ).toBeInTheDocument();
  });
});
