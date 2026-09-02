/**
 * Admin search-analytics — top queries, zero-result queries, WoW trends.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves a representative search-analytics snapshot so the admin
 * search-analytics page (#326) can be built and reviewed before the backend
 * analytics endpoints ship. Every metric carries an explicit `tracked` flag:
 * metrics the platform does not instrument yet resolve with `tracked: false`
 * so the UI renders an explicit "not tracked yet" placeholder instead of a
 * silent zero (see the issue's acceptance criteria).
 *
 * TODO(backend): GET /api/admin/analytics/search?from=&to=
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - 200 → the search-analytics shape documented below.
 *
 * Search analytics shape:
 *   {
 *     generatedAt: string,
 *     dateRange: { from: string, to: string },
 *     totals: {
 *       totalQueries:    { label: string, value: number, tracked: boolean },
 *       uniqueQueries:   { label: string, value: number, tracked: boolean },
 *       zeroResultQueries: { label: string, value: number, tracked: boolean },
 *       avgClickThroughRate: { label: string, value: number | null, tracked: boolean, unit: string },
 *     },
 *     topQueries: [
 *       { query: string, count: number, clickThroughRate: number, trend: number | null },
 *     ],
 *     zeroResultQueries: [
 *       { query: string, count: number, lastSearched: string },
 *     ],
 *     weeklyTrends: [
 *       { week: string, queries: number, zeroResults: number, clickThroughRate: number | null },
 *     ],
 *   }
 */

function withResolved(value) {
  return Promise.resolve(value);
}

/**
 * Fetch the platform-wide search analytics snapshot.
 *
 * TODO(backend):
 *   return axiosInstance
 *     .get("/api/admin/analytics/search", { params: { from, to } })
 *     .then((res) => res.data);
 *
 * @param {object} [options]
 * @param {string} [options.from] - ISO date string for the start of the range
 * @param {string} [options.to]   - ISO date string for the end of the range
 * @returns {Promise<object>} the search-analytics snapshot documented above.
 */
export async function fetchSearchAnalytics({ from, to } = {}) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return withResolved({
    generatedAt: now.toISOString(),
    dateRange: {
      from: from || thirtyDaysAgo.toISOString(),
      to: to || now.toISOString(),
    },
    totals: {
      totalQueries: {
        label: "Total Queries",
        value: 0,
        tracked: false,
      },
      uniqueQueries: {
        label: "Unique Queries",
        value: 0,
        tracked: false,
      },
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
  });
}
