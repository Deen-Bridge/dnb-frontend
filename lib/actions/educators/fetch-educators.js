import axiosInstance from "@/lib/config/axios.config";

/**
 * GET /api/educators — the directory, aggregated server-side.
 *
 * The endpoint also accepts ?type=all|courses|books|spaces and ?search=, but
 * we fetch the unfiltered roster once and narrow it in the browser: the
 * response is cached for 10 minutes keyed by type/search, so filtering
 * server-side would fragment that cache and add a round trip per keystroke.
 *
 * Throws on failure rather than returning [] so the page can tell a network
 * error apart from a genuinely empty roster.
 */
export async function fetchEducators() {
  const res = await axiosInstance.get("/api/educators");
  const { data, meta } = res.data ?? {};

  return {
    educators: Array.isArray(data) ? data : [],
    meta: meta ?? { educators: 0, courses: 0, books: 0, spaces: 0 },
  };
}
