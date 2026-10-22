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

const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_PAGES = 500;

/**
 * Fetch every page matching the filters (for CSV export). Stops when the
 * server reports no further page, or when a page comes back short/empty.
 * `page`/`limit` and the pagination metadata keys are assumed; confirm
 * against the backend.
 */
export async function fetchAllAdminUsers(filters, { onProgress } = {}) {
  const all = [];
  for (let page = 1; page <= EXPORT_MAX_PAGES; page += 1) {
    const res = await axiosInstance.get("/api/admin/users", {
      params: { ...toApiParams(filters), page, limit: EXPORT_PAGE_SIZE },
    });
    const data = res.data;
    const items = data?.users ?? data?.data ?? (Array.isArray(data) ? data : []);
    const pagination = data?.pagination ?? {};
    const pages = Number(pagination.pages ?? pagination.totalPages ?? data?.totalPages) || null;
    all.push(...items);
    onProgress?.({ page, pages, fetched: all.length });

    const hasMore =
      typeof data?.hasNextPage === "boolean"
        ? data.hasNextPage
        : pages !== null
          ? page < pages
          : items.length === EXPORT_PAGE_SIZE;
    if (!hasMore || items.length === 0) return all;
  }
  throw new Error("Export stopped: too many pages. Narrow the filters and try again.");
}
