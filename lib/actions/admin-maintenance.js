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
