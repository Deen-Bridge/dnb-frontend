const SAVED_QUERIES_PREFIX = "dnb_admin_saved_queries_";

export interface ReportFilterOption {
  value: string;
  label: string;
}

export interface ReportFilterDef {
  key: string;
  label: string;
  type: "select" | "date";
  options?: readonly ReportFilterOption[];
}

export interface ReportColumnDef {
  key: string;
  label: string;
}

export interface ReportDatasetDef {
  id: string;
  label: string;
  description: string;
  filters: readonly ReportFilterDef[];
  columns: readonly ReportColumnDef[];
  dateColumn: string;
}

export const REPORT_DATASETS: readonly ReportDatasetDef[] = Object.freeze([
  {
    id: "users",
    label: "Users",
    description: "Platform user accounts",
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "banned", label: "Banned" },
        ],
      },
      { key: "from", label: "Joined from", type: "date" },
      { key: "to", label: "Joined to", type: "date" },
    ],
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status" },
      { key: "joinedAt", label: "Joined" },
    ],
    dateColumn: "joinedAt",
  },
  {
    id: "transactions",
    label: "Transactions",
    description: "Purchase and payment transactions",
    filters: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All statuses" },
          { value: "confirmed", label: "Confirmed" },
          { value: "pending", label: "Pending" },
          { value: "submitted", label: "Submitted" },
          { value: "failed", label: "Failed" },
          { value: "expired", label: "Expired" },
        ],
      },
      {
        key: "itemType",
        label: "Item type",
        type: "select",
        options: [
          { value: "all", label: "All types" },
          { value: "course", label: "Course" },
          { value: "book", label: "Book" },
        ],
      },
      { key: "from", label: "Date from", type: "date" },
      { key: "to", label: "Date to", type: "date" },
    ],
    columns: [
      { key: "id", label: "Reference" },
      { key: "createdAt", label: "Date" },
      { key: "itemType", label: "Item type" },
      { key: "itemTitle", label: "Item" },
      { key: "amount", label: "Amount" },
      { key: "status", label: "Status" },
      { key: "buyer", label: "Buyer" },
    ],
    dateColumn: "createdAt",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Content moderation reports",
    filters: [
      {
        key: "contentType",
        label: "Content type",
        type: "select",
        options: [
          { value: "all", label: "All content" },
          { value: "course", label: "Course" },
          { value: "book", label: "Book" },
          { value: "space", label: "Space" },
        ],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "all", label: "All statuses" },
          { value: "open", label: "Open" },
          { value: "investigating", label: "Investigating" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ],
      },
      { key: "from", label: "Reported from", type: "date" },
      { key: "to", label: "Reported to", type: "date" },
    ],
    columns: [
      { key: "id", label: "ID" },
      { key: "createdAt", label: "Reported" },
      { key: "contentType", label: "Content type" },
      { key: "itemTitle", label: "Item" },
      { key: "reason", label: "Reason" },
      { key: "status", label: "Status" },
      { key: "reportedBy", label: "Reported by" },
    ],
    dateColumn: "createdAt",
  },
]);

const SAMPLE_ROWS: Record<string, any[]> = Object.freeze({ // TODO(types): Sample row structures per dataset
  users: [
    { name: "Amina Yusuf", email: "amina@deenbridge.org", role: "student", status: "active", joinedAt: "2025-01-12" },
    { name: "Bilal Karim", email: "bilal@deenbridge.org", role: "educator", status: "active", joinedAt: "2025-02-03" },
    { name: "Zaynab Idris", email: "zaynab@deenbridge.org", role: "student", status: "banned", joinedAt: "2025-03-17" },
    { name: "Umar Farouk", email: "umar@deenbridge.org", role: "student", status: "active", joinedAt: "2025-04-21" },
    { name: "Khadija Bello", email: "khadija@deenbridge.org", role: "educator", status: "active", joinedAt: "2025-05-09" },
  ],
  transactions: [
    { id: "TX-1001", createdAt: "2025-06-01", itemType: "course", itemTitle: "Tafsir of Surah Al-Fatihah", amount: 24.5, status: "confirmed", buyer: "amina@deenbridge.org" },
    { id: "TX-1002", createdAt: "2025-06-05", itemType: "book", itemTitle: "The Sealed Nectar", amount: 9.99, status: "pending", buyer: "umar@deenbridge.org" },
    { id: "TX-1003", createdAt: "2025-06-08", itemType: "course", itemTitle: "Arabic Grammar Essentials", amount: 35.0, status: "confirmed", buyer: "zaynab@deenbridge.org" },
    { id: "TX-1004", createdAt: "2025-06-12", itemType: "book", itemTitle: "Stories of the Prophets", amount: 7.5, status: "failed", buyer: "khadija@deenbridge.org" },
    { id: "TX-1005", createdAt: "2025-06-15", itemType: "course", itemTitle: "Fiqh of Worship", amount: 42.0, status: "confirmed", buyer: "bilal@deenbridge.org" },
  ],
  reports: [
    { id: "REP-201", createdAt: "2025-06-02", contentType: "course", itemTitle: "Tafsir of Surah Al-Fatihah", reason: "copyright", status: "open", reportedBy: "umar@deenbridge.org" },
    { id: "REP-202", createdAt: "2025-06-06", contentType: "book", itemTitle: "The Sealed Nectar", reason: "spam", status: "investigating", reportedBy: "amina@deenbridge.org" },
    { id: "REP-203", createdAt: "2025-06-09", contentType: "space", itemTitle: "Evening Dhikr Circle", reason: "inappropriate", status: "resolved", reportedBy: "zaynab@deenbridge.org" },
    { id: "REP-204", createdAt: "2025-06-13", contentType: "book", itemTitle: "Stories of the Prophets", reason: "duplicate", status: "dismissed", reportedBy: "bilal@deenbridge.org" },
    { id: "REP-205", createdAt: "2025-06-16", contentType: "course", itemTitle: "Fiqh of Worship", reason: "other", status: "open", reportedBy: "khadija@deenbridge.org" },
  ],
});

function getDataset(datasetId: string): ReportDatasetDef | undefined {
  return REPORT_DATASETS.find((dataset) => dataset.id === datasetId);
}

export function defaultFiltersFor(datasetId: string): Record<string, string> {
  const dataset = getDataset(datasetId);
  if (!dataset) return {};
  const defaults: Record<string, string> = {};
  for (const filter of dataset.filters) {
    defaults[filter.key] = filter.type === "select" ? "all" : "";
  }
  return defaults;
}

function isInDateRange(value: unknown, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const date = String(value ?? "").slice(0, 10);
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export interface FetchReportRowsOptions {
  limit?: number;
}

export async function fetchReportRows(
  datasetId: string,
  filters: Record<string, string> = {},
  options: FetchReportRowsOptions = {}
): Promise<{ rows: Array<Record<string, unknown>> }> {
  const dataset = getDataset(datasetId);
  if (!dataset) {
    throw new Error(`Unknown report dataset: ${datasetId}`);
  }

  let rows = SAMPLE_ROWS[datasetId] || [];

  for (const filter of dataset.filters) {
    const value = filters[filter.key];
    if (!value || value === "all") continue;

    if (filter.type === "date") {
      const { from, to } = filters;
      rows = rows.filter((row) => isInDateRange(row[dataset.dateColumn], from, to));
    } else {
      rows = rows.filter((row) => row[filter.key] === value);
    }
  }

  const limit = options.limit || rows.length;
  return Promise.resolve({ rows: rows.slice(0, limit) });
}

export interface SavedQuery {
  id: string;
  name: string;
  datasetId: string;
  filters: Record<string, any>; // TODO(types): Filter key-value pairs
  columns: string[];
  createdAt: string;
}

function readSavedQueries(userId: string): SavedQuery[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = window.localStorage.getItem(`${SAVED_QUERIES_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedQueries(userId: string, queries: SavedQuery[]): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(
      `${SAVED_QUERIES_PREFIX}${userId}`,
      JSON.stringify(queries)
    );
  } catch {
    // Storage unavailable
  }
}

function generateQueryId(): string {
  return `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function listSavedQueries(userId: string): Promise<{ queries: SavedQuery[] }> {
  return Promise.resolve({ queries: readSavedQueries(userId) });
}

export interface SaveQueryPayload {
  name: string;
  datasetId: string;
  filters?: Record<string, any>; // TODO(types): Filter key-value pairs
  columns: string[];
}

export async function saveQuery(userId: string, payload: SaveQueryPayload): Promise<{ query: SavedQuery }> {
  const name = String(payload?.name || "").trim();
  const datasetId = payload?.datasetId;
  const columns = Array.isArray(payload?.columns) ? payload.columns : [];
  if (!name) {
    throw new Error("A query name is required.");
  }
  if (!getDataset(datasetId)) {
    throw new Error(`Unknown report dataset: ${datasetId}`);
  }
  if (columns.length === 0) {
    throw new Error("Select at least one column.");
  }

  const query: SavedQuery = {
    id: generateQueryId(),
    name,
    datasetId,
    filters: { ...(payload.filters || {}) },
    columns,
    createdAt: new Date().toISOString(),
  };

  const queries = readSavedQueries(userId);
  queries.unshift(query);
  writeSavedQueries(userId, queries);

  return Promise.resolve({ query });
}

export async function deleteSavedQuery(userId: string, queryId: string): Promise<{ deleted: boolean; queryId: string }> {
  const queries = readSavedQueries(userId).filter((query) => query.id !== queryId);
  writeSavedQueries(userId, queries);
  return Promise.resolve({ deleted: true, queryId });
}
