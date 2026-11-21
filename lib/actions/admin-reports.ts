// @ts-nocheck
/** Admin report contracts. No fallback rows or client-side mutation store. */
import axiosInstance from "@/lib/config/axios.config";

export const REPORT_DATASETS = Object.freeze([
  { id: "users", label: "Users", description: "Platform user accounts", filters: [
    { key: "status", label: "Status", type: "select", options: [{ value: "all", label: "All statuses" }, { value: "active", label: "Active" }, { value: "banned", label: "Banned" }] },
    { key: "from", label: "Joined from", type: "date" }, { key: "to", label: "Joined to", type: "date" },
  ], columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "joinedAt", label: "Joined" },
  ], dateColumn: "joinedAt" },
  { id: "transactions", label: "Transactions", description: "Purchase and payment transactions", filters: [
    { key: "status", label: "Status", type: "select", options: [{ value: "all", label: "All statuses" }, { value: "confirmed", label: "Confirmed" }, { value: "pending", label: "Pending" }, { value: "submitted", label: "Submitted" }, { value: "failed", label: "Failed" }, { value: "expired", label: "Expired" }] },
    { key: "itemType", label: "Item type", type: "select", options: [{ value: "all", label: "All types" }, { value: "course", label: "Course" }, { value: "book", label: "Book" }] },
    { key: "from", label: "Date from", type: "date" }, { key: "to", label: "Date to", type: "date" },
  ], columns: [
    { key: "id", label: "Reference" },
    { key: "createdAt", label: "Date" },
    { key: "itemType", label: "Item type" },
    { key: "itemTitle", label: "Item" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "buyer", label: "Buyer" },
  ], dateColumn: "createdAt" },
  { id: "reports", label: "Reports", description: "Content moderation reports", filters: [
    { key: "contentType", label: "Content type", type: "select", options: [{ value: "all", label: "All content" }, { value: "course", label: "Course" }, { value: "book", label: "Book" }, { value: "space", label: "Space" }] },
    { key: "status", label: "Status", type: "select", options: [{ value: "all", label: "All statuses" }, { value: "open", label: "Open" }, { value: "investigating", label: "Investigating" }, { value: "resolved", label: "Resolved" }, { value: "dismissed", label: "Dismissed" }] },
    { key: "from", label: "Reported from", type: "date" }, { key: "to", label: "Reported to", type: "date" },
  ], columns: [
    { key: "id", label: "ID" },
    { key: "createdAt", label: "Reported" },
    { key: "contentType", label: "Content type" },
    { key: "itemTitle", label: "Item" },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status" },
    { key: "reportedBy", label: "Reported by" },
  ], dateColumn: "createdAt" },
]);

export const REPORT_FRESHNESS_CONTRACT = Object.freeze({
  required: ["interval.from", "interval.to", "lastUpdatedAt", "completeness", "timezone", "stale"],
  maxLimit: 100,
});

export class ReportContractError extends Error {
  constructor(message, code = "REPORT_CONTRACT_INVALID", status) {
    super(message); this.name = "ReportContractError"; this.code = code; this.status = status;
  }
}

const getDataset = (id) => REPORT_DATASETS.find((dataset) => dataset.id === id);

export function defaultFiltersFor(datasetId) {
  const dataset = getDataset(datasetId);
  if (!dataset) return {};
  return Object.fromEntries(dataset.filters.map((filter) => [filter.key, filter.type === "select" ? "all" : ""]));
}

function validateFreshness(freshness) {
  if (!freshness?.interval?.from || !freshness?.interval?.to) throw new ReportContractError("Report data interval is missing.");
  if (!freshness.lastUpdatedAt || Number.isNaN(Date.parse(freshness.lastUpdatedAt))) throw new ReportContractError("Report last-updated time is missing or invalid.");
  if (!["complete", "partial"].includes(freshness.completeness)) throw new ReportContractError("Report completeness must be complete or partial.");
  if (!freshness.timezone) throw new ReportContractError("Report timezone is missing.");
  if (typeof freshness.stale !== "boolean") throw new ReportContractError("Report stale status is missing.");
  return freshness;
}

function toReportError(error, fallbackMessage) {
  const status = error?.response?.status ?? error?.status;
  const code = status === 401 || status === 403 ? "REPORT_FORBIDDEN" : "REPORT_REQUEST_FAILED";
  return new ReportContractError(error?.response?.data?.message || error?.message || fallbackMessage, code, status);
}

async function request(path) {
  try {
    const { data } = await axiosInstance.get(path);
    return data;
  } catch (error) {
    throw toReportError(error, "Report request failed.");
  }
}

async function post(path, payload = {}) {
  try {
    const { data } = await axiosInstance.post(path, payload);
    return data;
  } catch (error) {
    throw toReportError(error, "Report update failed.");
  }
}

export async function fetchReportRows(datasetId, filters = {}, options = {}) {
  if (!getDataset(datasetId)) throw new ReportContractError(`Unknown report dataset: ${datasetId}`, "UNKNOWN_DATASET");
  const limit = Math.min(Math.max(Number(options.limit) || 25, 1), REPORT_FRESHNESS_CONTRACT.maxLimit);
  const params = new URLSearchParams({ dataset: datasetId, limit: String(limit) });
  for (const [key, value] of Object.entries(filters)) if (value && value !== "all") params.set(key, String(value));
  const body = await request(`/api/admin/report-rows?${params.toString()}`);
  validateFreshness(body.freshness);
  if (!Array.isArray(body.rows)) throw new ReportContractError("Report rows are missing.");
  return { rows: body.rows, freshness: body.freshness };
}

export async function listSavedQueries(userId) {
  const { data } = await axiosInstance.get("/api/admin/saved-queries", { params: { userId } });
  return data;
}

export async function saveQuery(userId, payload) {
  const name = String(payload?.name || "").trim();
  if (!name) throw new Error("A query name is required.");
  if (!getDataset(payload?.datasetId)) throw new Error(`Unknown report dataset: ${payload?.datasetId}`);
  if (!Array.isArray(payload?.columns) || payload.columns.length === 0) throw new Error("Select at least one column.");
  const { data } = await axiosInstance.post("/api/admin/saved-queries", {
    userId,
    name,
    datasetId: payload.datasetId,
    filters: { ...payload.filters },
    columns: payload.columns,
  });
  return data;
}

export async function deleteSavedQuery(userId, queryId) {
  const { data } = await axiosInstance.delete(`/api/admin/saved-queries/${encodeURIComponent(queryId)}`, { params: { userId } });
  return data;
}

function validateReportPayload(body) {
  validateFreshness(body.freshness);
  if (!Array.isArray(body.reports)) throw new ReportContractError("Report rows are missing.");
  return { reports: body.reports, freshness: body.freshness };
}

export async function listReports({ status = "queue" } = {}) {
  const params = new URLSearchParams({ status, limit: String(REPORT_FRESHNESS_CONTRACT.maxLimit) });
  return validateReportPayload(await request(`/api/admin/reports?${params.toString()}`));
}

export async function getReport(id) {
  const body = await request(`/api/admin/reports/${encodeURIComponent(id)}`);
  validateFreshness(body.freshness);
  if (!body.report || typeof body.report !== "object") throw new ReportContractError("Report details are missing.");
  return { report: body.report, freshness: body.freshness };
}

async function mutateReport(id, action, payload = {}) {
  const body = await post(`/api/admin/reports/${encodeURIComponent(id)}/${action}`, payload);
  if (!body.report || typeof body.report !== "object") throw new ReportContractError("Updated report is missing.");
  return { report: body.report, freshness: validateFreshness(body.freshness) };
}

export function escalateReport(id) { return mutateReport(id, "escalate"); }
export function dismissReport(id, { reason } = {}) { return mutateReport(id, "dismiss", { reason }); }
export function applyActionToTarget(id, { action = "takedown", reason } = {}) { return mutateReport(id, "action", { action, reason }); }
