/**
 * Maintenance-mode service — read and write the platform-wide maintenance flag.
 * ---------------------------------------------------------------------------
 * Reads and writes go through the backend so the gate and admin settings use
 * the same persisted state across refreshes and instances. The server is the
 * only source of truth; the client never retains a browser-local store.
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
 *
 * The client validates message length and a future ETA and disables caching on
 * the public read. Actor identity is derived from the authenticated session.
 */

import axiosInstance from "@/lib/config/axios.config";

const ENDPOINT = "/api/admin/maintenance";
const MAX_MESSAGE_LENGTH = 500;

function validatePayload(payload = {}) {
  const enabled = Boolean(payload.enabled);
  const message = payload.message == null ? null : String(payload.message).trim();
  if (message && message.length > MAX_MESSAGE_LENGTH) throw new Error(`Maintenance message must be ${MAX_MESSAGE_LENGTH} characters or fewer`);
  const etaAt = payload.etaAt || null;
  if (etaAt && Number.isNaN(Date.parse(etaAt))) throw new Error("Maintenance ETA must be a valid date");
  if (etaAt && Date.parse(etaAt) <= Date.now()) throw new Error("Maintenance ETA must be in the future");
  return { enabled, message, etaAt };
}

/** Public, cache-safe read. The server is the only source of truth. */
export async function getMaintenanceState() {
  const { data } = await axiosInstance.get(ENDPOINT, { headers: { "Cache-Control": "no-cache" } });
  if (!data?.maintenance || typeof data.maintenance.enabled !== "boolean") throw new Error("Maintenance service returned an invalid state");
  return data;
}

/** Super-admin mutation. Actor identity is derived from the authenticated session server-side. */
export async function setMaintenanceState(payload = {}) {
  const { data } = await axiosInstance.put(ENDPOINT, validatePayload(payload));
  if (!data?.maintenance || typeof data.maintenance.enabled !== "boolean") throw new Error("Maintenance service returned an invalid state");
  return data;
}
