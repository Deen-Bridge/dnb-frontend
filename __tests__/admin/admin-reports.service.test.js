/**
 * Admin report-builder service — contract tests (#329, #714).
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import {
  REPORT_DATASETS,
  defaultFiltersFor,
  fetchReportRows,
  listSavedQueries,
  saveQuery,
  deleteSavedQuery,
} from "@/lib/actions/admin-reports";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const DATASET_IDS = ["users", "transactions", "reports"];
const FRESHNESS = {
  interval: { from: "2025-01-01", to: "2025-05-31" },
  lastUpdatedAt: "2025-06-01T00:00:00.000Z",
  completeness: "complete",
  timezone: "UTC",
  stale: false,
};

let savedQueries;
let queryCounter;

beforeEach(() => {
  vi.clearAllMocks();
  savedQueries = new Map();
  queryCounter = 0;

  axiosInstance.get.mockImplementation(async (url, config) => {
    if (url === "/api/admin/saved-queries") {
      return { data: { queries: savedQueries.get(config?.params?.userId) || [] } };
    }
    return {
      data: {
        rows: [
          { status: "active", joinedAt: "2025-05-01" },
          { status: "active", joinedAt: "2025-05-09" },
        ],
        freshness: FRESHNESS,
      },
    };
  });

  axiosInstance.post.mockImplementation(async (url, payload) => {
    if (url === "/api/admin/saved-queries") {
      const query = {
        id: `q_${++queryCounter}`,
        name: payload.name,
        datasetId: payload.datasetId,
        filters: { ...payload.filters },
        columns: [...payload.columns],
        createdAt: "2025-06-01T00:00:00.000Z",
      };
      const queries = savedQueries.get(payload.userId) || [];
      queries.unshift(query);
      savedQueries.set(payload.userId, queries);
      return { data: { query } };
    }
    return { data: { report: { id: "rep_1" }, freshness: FRESHNESS } };
  });

  axiosInstance.delete.mockImplementation(async (url, config) => {
    const queryId = decodeURIComponent(url.split("/").pop());
    const userId = config?.params?.userId;
    savedQueries.set(userId, (savedQueries.get(userId) || []).filter((query) => query.id !== queryId));
    return { data: { deleted: true, queryId } };
  });
});

describe("REPORT_DATASETS", () => {
  it("exposes the three scoped datasets with filters and columns", () => {
    expect(REPORT_DATASETS.map((d) => d.id)).toEqual(DATASET_IDS);
    for (const dataset of REPORT_DATASETS) {
      expect(typeof dataset.label).toBe("string");
      expect(dataset.filters.length).toBeGreaterThan(0);
      expect(dataset.columns.length).toBeGreaterThan(0);
      for (const filter of dataset.filters) {
        expect(["select", "date"]).toContain(filter.type);
        expect(typeof filter.key).toBe("string");
        expect(typeof filter.label).toBe("string");
      }
      for (const column of dataset.columns) {
        expect(typeof column.key).toBe("string");
        expect(typeof column.label).toBe("string");
      }
    }
  });

  it("defines only existing module filter sets (no custom SQL / joins)", () => {
    for (const dataset of REPORT_DATASETS) {
      const keys = dataset.filters.map((f) => f.key);
      expect(keys.filter((k) => k === "from").length).toBeLessThanOrEqual(1);
      expect(keys.filter((k) => k === "to").length).toBeLessThanOrEqual(1);
    }
  });
});

describe("defaultFiltersFor", () => {
  it("returns 'all' for selects and '' for date filters", () => {
    const filters = defaultFiltersFor("users");
    expect(filters.status).toBe("all");
    expect(filters.from).toBe("");
    expect(filters.to).toBe("");
  });

  it("returns an empty object for an unknown dataset", () => {
    expect(defaultFiltersFor("nope")).toEqual({});
  });
});

describe("fetchReportRows", () => {
  it("rejects an unknown dataset", async () => {
    await expect(fetchReportRows("nope", {})).rejects.toThrow(/unknown report dataset/i);
  });

  it("requests bounded backend rows with freshness metadata", async () => {
    const { rows, freshness } = await fetchReportRows("users", {});
    expect(rows).toHaveLength(2);
    expect(freshness.completeness).toBe("complete");
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/report-rows?dataset=users&limit=25"
    );
  });

  it("applies a select filter", async () => {
    await fetchReportRows("users", { status: "banned" });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/report-rows?dataset=users&limit=25&status=banned"
    );
  });

  it("applies the date-range filters", async () => {
    await fetchReportRows("users", { from: "2025-04-01", to: "2025-05-31" });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/report-rows?dataset=users&limit=25&from=2025-04-01&to=2025-05-31"
    );
  });

  it("honors the preview limit option", async () => {
    await fetchReportRows("users", {}, { limit: 200 });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/report-rows?dataset=users&limit=100"
    );
  });

  it("rejects a response without freshness metadata instead of treating it as empty", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { rows: [] } });
    await expect(fetchReportRows("users")).rejects.toThrow(/data interval is missing/i);
  });
});

describe("saved queries (per admin, backend-backed)", () => {
  const QUERY = {
    name: "Active users",
    datasetId: "users",
    filters: { status: "active" },
    columns: ["name", "email"],
  };

  it("round-trips a saved query for an admin user", async () => {
    const { query } = await saveQuery("admin-1", QUERY);
    expect(query.id).toMatch(/^q_/);
    expect(query.name).toBe("Active users");
    expect(query.datasetId).toBe("users");
    expect(query.columns).toEqual(["name", "email"]);
    expect(query.filters.status).toBe("active");
    expect(typeof query.createdAt).toBe("string");
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/admin/saved-queries", {
      userId: "admin-1",
      name: "Active users",
      datasetId: "users",
      filters: { status: "active" },
      columns: ["name", "email"],
    });

    const { queries } = await listSavedQueries("admin-1");
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/admin/saved-queries", {
      params: { userId: "admin-1" },
    });
    expect(queries).toHaveLength(1);
    expect(queries[0].id).toBe(query.id);
  });

  it("scopes saved queries per admin user", async () => {
    await saveQuery("admin-1", QUERY);
    const { queries } = await listSavedQueries("admin-2");
    expect(queries).toHaveLength(0);
  });

  it("rejects a save without a name", async () => {
    await expect(saveQuery("admin-1", { ...QUERY, name: "  " })).rejects.toThrow(/name is required/i);
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("rejects a save for an unknown dataset", async () => {
    await expect(saveQuery("admin-1", { ...QUERY, datasetId: "nope" })).rejects.toThrow(/unknown report dataset/i);
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("rejects a save without any columns", async () => {
    await expect(saveQuery("admin-1", { ...QUERY, columns: [] })).rejects.toThrow(/at least one column/i);
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("deletes a saved query", async () => {
    const { query } = await saveQuery("admin-1", QUERY);
    const { deleted, queryId } = await deleteSavedQuery("admin-1", query.id);
    expect(axiosInstance.delete).toHaveBeenCalledWith(`/api/admin/saved-queries/${query.id}`, {
      params: { userId: "admin-1" },
    });
    expect(deleted).toBe(true);
    expect(queryId).toBe(query.id);

    const { queries } = await listSavedQueries("admin-1");
    expect(queries).toHaveLength(0);
  });
});
