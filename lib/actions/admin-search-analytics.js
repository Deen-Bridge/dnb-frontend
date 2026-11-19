import axiosInstance from "@/lib/config/axios.config";

const TOTAL_QUERIES = { label: "Total Queries", tracked: true };
const UNIQUE_QUERIES = { label: "Unique Queries", tracked: true };
const ZERO_RESULT_QUERIES = { label: "Zero-Result Queries", tracked: true };
const CLICK_THROUGH_RATE = {
  label: "Avg. Click-Through Rate",
  value: null,
  tracked: false,
  unit: "%",
};
const MAX_RANGE_DAYS = 366;

const unwrapData = (response) => response.data?.data ?? response.data;

function resolveDateRange({ from, to } = {}) {
  const now = new Date();
  const fallbackFrom = new Date(now);
  fallbackFrom.setUTCDate(fallbackFrom.getUTCDate() - 30);
  const startDate = from || fallbackFrom.toISOString();
  const endDate = to || now.toISOString();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new Error("Invalid search analytics date range");
  }
  if (end.getTime() - start.getTime() > MAX_RANGE_DAYS * 24 * 60 * 60 * 1000) {
    throw new Error(`Search analytics date range cannot exceed ${MAX_RANGE_DAYS} days`);
  }
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function asRows(value) {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.items) ? value.items : [];
}

function getWeekStart(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function toWeeklyTrends(dailyTrends) {
  const weeks = new Map();

  for (const trend of dailyTrends) {
    const date = trend._id ?? trend.date;
    if (!date) continue;

    const week = getWeekStart(date);
    const bucket = weeks.get(week) ?? {
      week: `Week of ${new Date(`${week}T12:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })}`,
      queries: 0,
      zeroResults: 0,
      clickThroughRate: null,
    };

    bucket.queries += Number(trend.total ?? trend.queries ?? 0);
    bucket.zeroResults += Number(trend.zeroResults ?? 0);
    weeks.set(week, bucket);
  }

  return [...weeks.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, bucket]) => bucket);
}

/** Fetch and normalize search analytics for the admin dashboard. */
export async function fetchSearchAnalytics({ from, to } = {}) {
  const now = new Date();
  const { startDate, endDate } = resolveDateRange({ from, to });
  const params = { startDate, endDate };

  const [summaryResponse, topResponse, zeroResponse, trendsResponse] = await Promise.all([
    axiosInstance.get("/api/analytics/search/summary", { params }),
    axiosInstance.get("/api/analytics/search/top", {
      params: { ...params, limit: 100, page: 1 },
    }),
    axiosInstance.get("/api/analytics/search/zero-results", {
      params: { ...params, limit: 100, page: 1 },
    }),
    axiosInstance.get("/api/analytics/search/trends", { params }),
  ]);

  const summary = unwrapData(summaryResponse) ?? {};
  const topQueries = asRows(unwrapData(topResponse));
  const zeroResultQueries = asRows(unwrapData(zeroResponse));
  const trends = asRows(unwrapData(trendsResponse));
  const tracked = summary.tracked !== false;
  const clickThroughRate = summary.avgClickThroughRate ?? summary.clickThroughRate ?? null;

  return {
    generatedAt: now.toISOString(),
    dateRange: { from: startDate, to: endDate },
    totals: {
      totalQueries: { ...TOTAL_QUERIES, tracked, value: Number(summary.totalSearches ?? 0) },
      uniqueQueries: { ...UNIQUE_QUERIES, tracked, value: Number(summary.uniqueQueries ?? 0) },
      zeroResultQueries: {
        ...ZERO_RESULT_QUERIES,
        tracked,
        value: Number(summary.zeroResultSearches ?? 0),
      },
      avgClickThroughRate: {
        ...CLICK_THROUGH_RATE,
        tracked: tracked && clickThroughRate !== null,
        value: clickThroughRate === null ? null : Number(clickThroughRate),
      },
    },
    topQueries: (Array.isArray(topQueries) ? topQueries : []).map((query) => ({
      query: query.query,
      count: Number(query.count ?? 0),
      clickThroughRate: query.clickThroughRate == null ? null : Number(query.clickThroughRate),
      trend: query.trend == null ? null : Number(query.trend),
    })),
    zeroResultQueries: (Array.isArray(zeroResultQueries) ? zeroResultQueries : []).map(
      (query) => ({
        query: query.query,
        count: Number(query.count ?? 0),
        lastSearched: query.lastSearched,
      }),
    ),
    weeklyTrends: toWeeklyTrends(Array.isArray(trends) ? trends : []),
  };
}
