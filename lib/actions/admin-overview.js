/**
 * Admin overview service — platform snapshot for the overview home page (#339).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Resolves a representative snapshot so the admin overview /
 * empty-database bootstrap experience can be built and reviewed before the
 * backend endpoints ship.
 *
 * The stub deliberately models a **fresh deployment** — every tracked count is
 * zero and no settings are configured — so the guided first-run experience is
 * visible in dev. The page is fully data-driven: an overview widget switches to
 * a guided hint the moment its count is `0`, and the setup checklist derives
 * completion from these counts plus the settings flags, so real data flowing in
 * from the backend makes hints and checklist items disappear naturally.
 *
 * TODO(backend): GET /api/admin/overview
 *   - Auth: requires an admin session token (server-side tier check).
 *   - 200 → the overview shape documented below.
 *
 * Overview shape:
 *   {
 *     generatedAt: string,        // ISO 8601 snapshot timestamp
 *     empty: boolean,             // true when every tracked count is zero
 *     counts: {
 *       mentors:      { label: string, value: number },
 *       categories:   { label: string, value: number },
 *       courses:      { label: string, value: number },
 *       books:        { label: string, value: number },
 *       students:     { label: string, value: number },
 *       transactions: { label: string, value: number },
 *     },
 *     settings: {
 *       platformName:    { label: string, configured: boolean },
 *       paymentSettings: { label: string, configured: boolean },
 *     },
 *   }
 */

function withResolved(value) {
  return Promise.resolve(value);
}

/**
 * Fetch the platform-wide overview snapshot.
 *
 * TODO(backend):
 *   return axiosInstance
 *     .get("/api/admin/overview")
 *     .then((res) => res.data);
 *
 * @returns {Promise<object>} the overview snapshot documented above.
 */
export async function fetchAdminOverview() {
  return withResolved({
    generatedAt: new Date().toISOString(),
    empty: true,
    counts: {
      mentors: { label: "Mentors", value: 0 },
      categories: { label: "Categories", value: 0 },
      courses: { label: "Courses", value: 0 },
      books: { label: "Books", value: 0 },
      students: { label: "Students", value: 0 },
      transactions: { label: "Transactions", value: 0 },
    },
    settings: {
      platformName: { label: "Platform name", configured: false },
      paymentSettings: { label: "Payment settings", configured: false },
    },
  });
}
