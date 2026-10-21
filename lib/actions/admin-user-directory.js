import axiosInstance from "@/lib/config/axios.config";
import { toApiParams } from "@/lib/admin/user-filters";

/**
 * Fetch the admin user directory. Pass an AbortSignal to cancel in-flight requests.
 * NOTE: endpoint path and query param names (search, role, status, createdFrom,
 * createdTo) are assumed and should be confirmed against the backend.
 */
export async function fetchAdminUsers(filters, { signal } = {}) {
  const res = await axiosInstance.get("/api/admin/users", {
    params: toApiParams(filters),
    signal,
  });
  const data = res.data;
  return data?.users ?? data?.data ?? (Array.isArray(data) ? data : []);
}
