/**
 * Content-moderation flags service — list and resolve flagged content (#335).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every function resolves with mocked data so the flag-resolution
 * moderation queue can be built and reviewed before the backend endpoints
 * exist. Swap the mock bodies for `axiosInstance` calls (see
 * `lib/config/axios.config.js`) when the backend lands.
 *
 * NOTE: This is *content moderation* — user reports on reels/comments/posts —
 * NOT runtime **feature** flags (those live in `lib/actions/admin-flags.js`).
 *
 * Flagged-content shape owned by the backend:
 *
 *   {
 *     id: string,                       // moderation-flag id
 *     contentType: "reel" | "comment" | "post" | "profile",
 *     contentId: string,                // id of the flagged entity
 *     reason: string,                   // reporter-supplied category
 *     excerpt: string,                  // short preview of the flagged content
 *     reportedBy: { id: string, name: string },
 *     reportedAt: string,               // ISO 8601 timestamp
 *     status: "open" | "resolved",
 *   }
 */

const MOCK_DELAY_MS = 400;

/** In-memory store so stubbed resolve mutations round-trip in dev. */
let mockFlagged = null;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function seedFlagged() {
  const now = Date.now();
  return [
    {
      id: "modflag-001",
      contentType: "reel",
      contentId: "reel-8842",
      reason: "spam",
      excerpt: "Buy cheap followers now at …",
      reportedBy: { id: "user-231", name: "Hassan Ali" },
      reportedAt: new Date(now - 40 * 60 * 1000).toISOString(),
      status: "open",
    },
    {
      id: "modflag-002",
      contentType: "comment",
      contentId: "comment-5521",
      reason: "harassment",
      excerpt: "You should be ashamed of …",
      reportedBy: { id: "user-104", name: "Fatima Noor" },
      reportedAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      status: "open",
    },
    {
      id: "modflag-003",
      contentType: "post",
      contentId: "post-3390",
      reason: "misinformation",
      excerpt: "This remedy cures everything, doctors …",
      reportedBy: { id: "user-778", name: "Omar Farouk" },
      reportedAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
      status: "open",
    },
  ];
}

function getMockFlagged() {
  if (!mockFlagged) mockFlagged = seedFlagged();
  return mockFlagged;
}

/**
 * List open flagged-content reports awaiting moderation.
 *
 * TODO(backend): GET /api/admin/moderation/flags?status=open
 *   - Auth: requires a moderator/admin session token (server-side tier check).
 *   - 200 → { flags: FlaggedContent[] } using the shape above.
 *   - 403 for non-moderators.
 *
 * @returns {Promise<{flags: Array<{id: string, contentType: string, contentId: string, reason: string, excerpt: string, reportedBy: {id: string, name: string}, reportedAt: string, status: string}>}>}
 */
export async function listFlaggedContent() {
  // TODO(backend):
  //   return axiosInstance
  //     .get("/api/admin/moderation/flags", { params: { status: "open" } })
  //     .then((res) => res.data);
  return withMockDelay({
    flags: getMockFlagged()
      .filter((flag) => flag.status === "open")
      .map((flag) => ({ ...flag })),
  });
}

/**
 * Resolve a flagged-content report. `resolution` records the moderator's
 * decision for the audit trail.
 *
 * TODO(backend): PATCH /api/admin/moderation/flags/:id/resolve
 *   - Auth: moderator/admin only; the acting moderator is audit-trailed.
 *   - Payload: { resolution: "dismiss" | "remove_content" | "warn_author" }
 *   - 200 → { flag: FlaggedContent } with `status: "resolved"`.
 *   - 404 if the flag does not exist; 409 if already resolved.
 *
 * @param {string} id moderation-flag id
 * @param {("dismiss"|"remove_content"|"warn_author")} resolution
 * @returns {Promise<{flag: {id: string, status: "resolved", resolution: string, resolvedAt: string}}>}
 */
export async function resolveFlag(id, resolution) {
  // TODO(backend):
  //   return axiosInstance
  //     .patch(`/api/admin/moderation/flags/${id}/resolve`, { resolution })
  //     .then((res) => res.data);
  const flags = getMockFlagged();
  const index = flags.findIndex((flag) => flag.id === id);
  if (index === -1) {
    await withMockDelay(null);
    throw new Error(`Unknown moderation flag: ${id}`);
  }
  flags[index] = { ...flags[index], status: "resolved" };
  return withMockDelay({
    flag: {
      id,
      status: "resolved",
      resolution: resolution || "dismiss",
      resolvedAt: new Date().toISOString(),
    },
  });
}
