/**
 * Emergency-broadcast service — one-click incident alerts (#307).
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every function here resolves with mocked data backed by a
 * module-level store so the admin quick-action page and the learner-side
 * `EmergencyBroadcastBanner` can be built, wired together, and reviewed before
 * the backend endpoints exist. Sending from the admin page mutates the same
 * in-memory store the banner reads, so the two stay in sync within a browser
 * session (until a full reload re-seeds the module).
 *
 * Unlike the ordinary broadcast (`admin-broadcast.js`), an emergency broadcast
 * is an IMMEDIATE send — it bypasses any scheduling: `sendEmergencyBroadcast`
 * stamps `sentAt = now`, becomes the single CURRENTLY ACTIVE emergency
 * broadcast, and fires a non-blocking audit event (mirrors the fire-and-forget
 * pattern in `admin-broadcast.js`).
 *
 * Active emergency-broadcast state shape owned by the backend:
 *
 *   {
 *     id: string,                       // server-assigned id
 *     template: "outage" | "security",  // which incident preset was used
 *     title: string,                    // learner-facing headline
 *     body: string,                     // learner-facing detail copy
 *     etaAt: string | null,             // optional ISO 8601 "resolved by" target
 *     affectedAreas: string[],          // which platform areas are impacted
 *     sentAt: string,                   // ISO 8601 send timestamp (immediate)
 *   }
 *
 * TODO(backend):
 *   - POST /api/admin/broadcasts/emergency  (admin-only, server-side tier check)
 *       IMMEDIATE send — no scheduling window is accepted or honoured.
 *       Payload: { template, title, body?, etaAt?: string|null, affectedAreas: string[] }
 *       201 → { broadcast: ActiveEmergencyBroadcast } with server-stamped id/sentAt.
 *       403 for non-admins.
 *   - GET /api/admin/broadcasts/emergency/active  is **public / unauthenticated**
 *       so the learner banner can read the active alert for any visitor.
 *       200 → { broadcast: ActiveEmergencyBroadcast | null }
 *   - DELETE /api/admin/broadcasts/emergency/active  (admin-only) resolves/clears
 *       the active alert.
 *       200 → { broadcast: null }
 */

import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";

const MOCK_DELAY_MS = 300;

/**
 * Fixed incident templates. Frozen so a call site can't mutate the presets.
 * Each preset seeds the quick-action form with sensible default copy and the
 * areas most commonly affected by that class of incident — the admin can still
 * edit the title, ETA, and toggle areas before sending.
 *
 * @readonly
 */
export const INCIDENT_TEMPLATES = Object.freeze({
  outage: Object.freeze({
    id: "outage",
    label: "Platform outage",
    title: "Platform outage",
    body: "We're aware of a platform outage and our team is actively working to restore service. Thank you for your patience.",
    defaultAffectedAreas: Object.freeze(["courses", "payments", "ai"]),
  }),
  security: Object.freeze({
    id: "security",
    label: "Security notice",
    title: "Security notice",
    body: "We're investigating a security event. As a precaution some features may be temporarily limited. Please do not share your password with anyone.",
    defaultAffectedAreas: Object.freeze(["payments", "community"]),
  }),
});

/**
 * The fixed set of platform areas an emergency can be scoped to. Rendered as
 * the "Affected areas" checkboxes on the admin page and as chips on the learner
 * banner. Frozen to keep the vocabulary consistent across both surfaces.
 *
 * @readonly
 */
export const AFFECTED_AREAS = Object.freeze([
  Object.freeze({ id: "courses", label: "Courses" }),
  Object.freeze({ id: "payments", label: "Payments / Wallet" }),
  Object.freeze({ id: "community", label: "Community" }),
  Object.freeze({ id: "ai", label: "AI Assistant" }),
  Object.freeze({ id: "library", label: "Library" }),
]);

/** O(1) lookup from area id → human label, for the banner. */
const AREA_LABELS = Object.freeze(
  AFFECTED_AREAS.reduce((acc, area) => {
    acc[area.id] = area.label;
    return acc;
  }, {})
);

/**
 * Resolve an array of area ids to their human labels, dropping unknown ids.
 *
 * @param {string[]} [ids]
 * @returns {string[]}
 */
export function labelForAreas(ids = []) {
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => AREA_LABELS[id] || id);
}

/**
 * In-memory store holding the single CURRENTLY ACTIVE emergency broadcast, so
 * the stubbed send/read round-trips within a session. Seeded to `null` (no
 * active alert — the normal, fail-open state).
 *
 * @type {{id: string, template: string, title: string, body: string, etaAt: string|null, affectedAreas: string[], sentAt: string}|null}
 */
let activeBroadcast = null;

function withMockDelay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/**
 * Read the currently active emergency broadcast (or `null` when none).
 *
 * Mirrors the **public** GET contract: no auth required, so the banner can call
 * it for any visitor. Returns a defensive copy so callers can't mutate the
 * store directly.
 *
 * TODO(backend): return axiosInstance.get("/api/admin/broadcasts/emergency/active").then((res) => res.data);
 *
 * @returns {Promise<{broadcast: {id: string, template: string, title: string, body: string, etaAt: string|null, affectedAreas: string[], sentAt: string}|null}>}
 */
export async function getActiveEmergencyBroadcast() {
  // TODO(backend): return axiosInstance.get("/api/admin/broadcasts/emergency/active").then((res) => res.data);
  return withMockDelay({
    broadcast: activeBroadcast ? { ...activeBroadcast } : null,
  });
}

/**
 * Immediately send an emergency broadcast. Validates the required fields,
 * stamps `sentAt`, stores the result as the single active alert, and fires a
 * non-blocking audit event. There is no scheduling — the alert is live the
 * moment this resolves.
 *
 * TODO(backend):
 *   const { data } = await axiosInstance.post(
 *     "/api/admin/broadcasts/emergency",
 *     { template, title, body, etaAt, affectedAreas },
 *   );
 *   return data;
 *
 * @param {{template: string, title: string, body?: string, etaAt?: string|null, affectedAreas?: string[]}} payload
 * @returns {Promise<{broadcast: {id: string, template: string, title: string, body: string, etaAt: string|null, affectedAreas: string[], sentAt: string}}>}
 */
export async function sendEmergencyBroadcast(payload = {}) {
  const template = payload.template;
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const affectedAreas = Array.isArray(payload.affectedAreas)
    ? payload.affectedAreas.filter((id) => typeof id === "string")
    : [];

  if (!template || !INCIDENT_TEMPLATES[template]) {
    throw new Error("An incident template (outage or security) is required.");
  }
  if (!title) {
    throw new Error("A title is required to send an emergency broadcast.");
  }
  if (affectedAreas.length === 0) {
    throw new Error("Select at least one affected area.");
  }

  // TODO(backend):
  //   const { data } = await axiosInstance.post(
  //     "/api/admin/broadcasts/emergency",
  //     { template, title, body, etaAt, affectedAreas },
  //   );
  const next = {
    id: `eb_${Math.random().toString(36).slice(2, 10)}`,
    template,
    title,
    body: body || INCIDENT_TEMPLATES[template].body,
    etaAt: payload.etaAt || null,
    affectedAreas,
    sentAt: new Date().toISOString(),
  };

  const result = await withMockDelay({ broadcast: { ...next } });
  activeBroadcast = next;

  // Fire-and-forget audit trail — never awaited, never blocks the caller.
  logAuditEvent({
    action: AUDIT_ACTIONS.EMERGENCY_BROADCAST,
    target: { label: title || "Emergency broadcast", href: null },
    metadata: {
      template,
      affectedAreas,
      hasEta: Boolean(next.etaAt),
      immediate: true,
    },
  });

  return result;
}

/**
 * Resolve / dismiss the active emergency broadcast, clearing it for everyone.
 * Mirrors the **admin-only** DELETE contract.
 *
 * TODO(backend): return axiosInstance.delete("/api/admin/broadcasts/emergency/active").then((res) => res.data);
 *
 * @returns {Promise<{broadcast: null}>}
 */
export async function clearEmergencyBroadcast() {
  // TODO(backend): return axiosInstance.delete("/api/admin/broadcasts/emergency/active").then((res) => res.data);
  const result = await withMockDelay({ broadcast: null });
  activeBroadcast = null;
  return result;
}
