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

const unwrapData = (response) => response.data?.data ?? response.data;

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
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = from || thirtyDaysAgo.toISOString();
  const endDate = to || now.toISOString();
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
  const topQueries = unwrapData(topResponse);
  const zeroResultQueries = unwrapData(zeroResponse);
  const trends = unwrapData(trendsResponse);

  return {
    generatedAt: now.toISOString(),
    dateRange: { from: startDate, to: endDate },
    totals: {
      totalQueries: { ...TOTAL_QUERIES, value: Number(summary.totalSearches ?? 0) },
      uniqueQueries: { ...UNIQUE_QUERIES, value: Number(summary.uniqueQueries ?? 0) },
      zeroResultQueries: {
        ...ZERO_RESULT_QUERIES,
        value: Number(summary.zeroResultSearches ?? 0),
      },
      avgClickThroughRate: CLICK_THROUGH_RATE,
    },
    topQueries: (Array.isArray(topQueries) ? topQueries : []).map((query) => ({
      query: query.query,
      count: Number(query.count ?? 0),
      clickThroughRate: null,
      trend: null,
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
