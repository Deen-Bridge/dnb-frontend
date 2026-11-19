/**
 * Maintenance-mode service — read and write the platform-wide maintenance flag.
 * ---------------------------------------------------------------------------
 * **STUBBED.** Every function here resolves with mocked data backed by a
 * module-level store so the admin settings page (#303) and the layout-level
 * `MaintenanceGate` can be built, wired together, and reviewed before the
 * backend endpoints exist. Toggling maintenance from the admin page mutates the
 * same in-memory store the gate reads, so the two stay in sync within a browser
 * session (until a full reload re-seeds the module).
 *
 * Maintenance state shape owned by the backend:
 *
 *   {
 *     enabled: boolean,                 // master on/off switch
 *     message: string | null,           // optional custom learner-facing copy
 *     etaAt: string | null,             // optional ISO 8601 "back online" target
 *     updatedBy: { id: string, name: string } | null, // who last toggled it
 *     updatedAt: string,                // ISO 8601 timestamp of last change
 *   }
 *
 * TODO(backend): GET/PUT /api/admin/maintenance
 *   - GET is **public / unauthenticated** so the layout gate can read the flag
 *     for logged-out and non-admin visitors on every navigation.
 *       200 → { maintenance: MaintenanceState }
 *   - PUT is **super-admin only** (server-side tier check, like the flags API).
 *       Payload: { enabled: boolean, message?: string | null, etaAt?: string | null }
 *       200 → { maintenance: MaintenanceState } with server-stamped
 *             `updatedBy` / `updatedAt`.
 *       403 for non-super-admins.
 */

import axiosInstance from "@/lib/config/axios.config";

/**
 * In-memory store so the stubbed read/write round-trips within a session. Seeded
 * lazily on first access. Defaults to maintenance OFF (fail-open, normal app).
 *
 * @type {{enabled: boolean, message: string|null, etaAt: string|null, updatedBy: {id: string, name: string}|null, updatedAt: string}|null}
 */

/**
 * Read the current maintenance state.
 *
 * Mirrors the **public** GET contract: no auth required, so the gate can call
 * it for any visitor. Returns a defensive copy so callers can't mutate the
 * store directly.
 *
 * TODO(backend): return axiosInstance.get("/api/admin/maintenance").then((res) => res.data);
 *
 * @returns {Promise<{maintenance: {enabled: boolean, message: string|null, etaAt: string|null, updatedBy: {id: string, name: string}|null, updatedAt: string}}>}
 */
export async function getMaintenanceState() {
  const { data } = await axiosInstance.get("/api/admin/maintenance");
  return data;
}

/**
 * Enable or disable maintenance mode, optionally attaching a custom learner
 * message and an ETA. Mirrors the **super-admin-only** PUT contract.
 *
 * In the stub, `updatedBy` is stamped from the optional `actor` argument the
 * hook passes (the acting admin from `useAuth`); the real backend derives it
 * from the session token instead. Omitting a field leaves prior copy in place
 * only when the caller doesn't send it — passing `null` clears it.
 *
 * TODO(backend):
 *   return axiosInstance
 *     .put("/api/admin/maintenance", { enabled, message, etaAt })
 *     .then((res) => res.data);
 *
 * @param {{enabled: boolean, message?: string|null, etaAt?: string|null, actor?: {id: string, name: string}|null}} payload
 * @returns {Promise<{maintenance: {enabled: boolean, message: string|null, etaAt: string|null, updatedBy: {id: string, name: string}|null, updatedAt: string}}>}
 */
export async function setMaintenanceState(payload = {}) {
  // TODO(backend):
  //   return axiosInstance
  //     .put("/api/admin/maintenance", { enabled, message, etaAt })
  //     .then((res) => res.data);
  const { actor: _actor, ...body } = payload;
  const { data } = await axiosInstance.put("/api/admin/maintenance", body);
  return data;
}
