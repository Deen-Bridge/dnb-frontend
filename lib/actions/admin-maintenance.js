/**
 * Maintenance-mode service — read and write the platform-wide maintenance flag.
 * ---------------------------------------------------------------------------
 * Reads and writes go through the backend so the gate and admin settings use
 * the same persisted state across refreshes and instances.
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
 * Backend contract: GET/PUT /api/admin/maintenance
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
 * Read the current maintenance state.
 *
 * Mirrors the **public** GET contract: no auth required, so the gate can call
 * it for any visitor. The backend response is returned unchanged.
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
 * The backend derives `updatedBy` and `updatedAt` from the authenticated
 * session; the client never supplies actor identity.
 *
 * @param {{enabled: boolean, message?: string|null, etaAt?: string|null}} payload
 * @returns {Promise<{maintenance: {enabled: boolean, message: string|null, etaAt: string|null, updatedBy: {id: string, name: string}|null, updatedAt: string}}>}
 */
export async function setMaintenanceState(payload = {}) {
  const { actor: _actor, ...requestedState } = payload;
  const { data } = await axiosInstance.put("/api/admin/maintenance", {
    enabled: Boolean(requestedState.enabled),
    ...(Object.hasOwn(requestedState, "message")
      ? { message: requestedState.message ?? null }
      : {}),
    ...(Object.hasOwn(requestedState, "etaAt")
      ? { etaAt: requestedState.etaAt ?? null }
      : {}),
  });
  return data;
}
