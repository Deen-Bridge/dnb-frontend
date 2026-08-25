/**
 * Admin learning-engagement analytics — funnel, sessions, lessons, reading depth.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves a representative engagement snapshot so the admin
 * learning-analytics page (#322) can be built and reviewed before the backend
 * analytics endpoints ship. Every metric carries an explicit `tracked` flag:
 * metrics the platform does not instrument yet resolve with `tracked: false`
 * so the UI renders an explicit "not tracked yet" placeholder instead of a
 * silent zero (see the issue's acceptance criteria).
 *
 * TODO(backend): GET /api/admin/analytics/engagement?from=&to=
 *   - Auth: requires a super-admin session token (server-side tier check).
 *   - 200 → the engagement shape documented below.
 *
 * Engagement shape:
 *   {
 *     generatedAt: string,
 *     totals: {
 *       students:          { label: string, value: number, tracked: boolean },
 *       coursesEnrolled:   { label: string, value: number, tracked: boolean },
 *       lessonsCompleted:  { label: string, value: number, tracked: boolean },
 *       avgSessionLength:  { label: string, value: number, tracked: boolean },
 *     },
 *     funnel: [
 *       { stage: "enrolled",  label: "Enrolled",      value: number, tracked: boolean },
 *       { stage: "started",   label: "Started",       value: number, tracked: boolean },
 *       { stage: "quarter",   label: "25% Complete",  value: number, tracked: boolean },
 *       { stage: "completed", label: "Completed",     value: number, tracked: boolean },
 *     ],
 *     sessionLength:    { tracked: boolean, avgMinutes: number | null },
 *     lessonsCompleted: { tracked: boolean, buckets: Array<{ range: string, value: number }> },
 *     readingDepth:     { tracked: boolean, buckets: Array<{ range: string, value: number }> },
 *   }
 */

function withResolved(value) {
  return Promise.resolve(value);
}

/**
 * Fetch the platform-wide learning engagement snapshot.
 *
 * TODO(backend):
 *   return axiosInstance
 *     .get("/api/admin/analytics/engagement", { params: { from, to } })
 *     .then((res) => res.data);
 *
 * @returns {Promise<object>} the engagement snapshot documented above.
 */
export async function fetchEngagementAnalytics() {
  return withResolved({
    generatedAt: new Date().toISOString(),
    totals: {
      students: { label: "Total Students", value: 842, tracked: true },
      coursesEnrolled: { label: "Courses Enrolled", value: 1284, tracked: true },
      lessonsCompleted: { label: "Lessons Completed", value: 0, tracked: false },
      avgSessionLength: { label: "Avg. Session Length", value: 0, tracked: false },
    },
    funnel: [
      { stage: "enrolled", label: "Enrolled", value: 1284, tracked: true },
      { stage: "started", label: "Started", value: 0, tracked: false },
      { stage: "quarter", label: "25% Complete", value: 0, tracked: false },
      { stage: "completed", label: "Completed", value: 0, tracked: false },
    ],
    sessionLength: { tracked: false, avgMinutes: null },
    lessonsCompleted: {
      tracked: false,
      buckets: [
        { range: "1–5", value: 0 },
        { range: "6–10", value: 0 },
        { range: "11–20", value: 0 },
        { range: "21–40", value: 0 },
        { range: "41+", value: 0 },
      ],
    },
    readingDepth: {
      tracked: false,
      buckets: [
        { range: "0–25%", value: 0 },
        { range: "26–50%", value: 0 },
        { range: "51–75%", value: 0 },
        { range: "76–100%", value: 0 },
      ],
    },
  });
}
