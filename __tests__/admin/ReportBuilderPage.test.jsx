/**
 * Report builder page — dataset / filters / columns / preview / saved-query
 * and export state tests (#329).
 * ---------------------------------------------------------------------------
 * The builder composes existing datasets into named saved queries. These tests
 * mock the admin-reports service and the CSV download trigger, then assert the
 * presentational flow: dataset selection, filter + column controls, preview
 * rendering, the saved-queries sidebar, and export.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ user: { id: "me", _id: "me" } }),
  useAuth: () => ({ user: { id: "me", _id: "me" } }),
}));

// Bypass the super-admin page guard — its behaviour is out of scope here.
vi.mock("@/components/auth/AdminTierGuard", () => ({
  default: ({ children }) => children,
}));

const csvMock = vi.hoisted(() => ({ downloadCsv: vi.fn() }));
vi.mock("@/lib/utils/csv", () => ({ downloadCsv: csvMock.downloadCsv }));

const serviceMocks = vi.hoisted(() => ({
  fetchReportRows: vi.fn(),
  listSavedQueries: vi.fn(),
  saveQuery: vi.fn(),
  deleteSavedQuery: vi.fn(),
}));
vi.mock("@/lib/actions/admin-reports", async () => {
  const actual = await vi.importActual("@/lib/actions/admin-reports");
  return {
    ...actual,
    fetchReportRows: serviceMocks.fetchReportRows,
    listSavedQueries: serviceMocks.listSavedQueries,
    saveQuery: serviceMocks.saveQuery,
    deleteSavedQuery: serviceMocks.deleteSavedQuery,
  };
});

const USER_ROWS = [
  { id: "u1", name: "Amina Yusuf", email: "amina@deenbridge.org", role: "student", status: "active", joinedAt: "2025-01-12" },
  { id: "u2", name: "Bilal Karim", email: "bilal@deenbridge.org", role: "educator", status: "active", joinedAt: "2025-02-03" },
];

const SAVED_QUERIES = [
  {
    id: "q_1",
    name: "Active users",
    datasetId: "users",
    filters: { status: "active", from: "", to: "" },
    columns: ["name", "email"],
    createdAt: "2026-08-01T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  serviceMocks.fetchReportRows.mockResolvedValue({ rows: USER_ROWS });
  serviceMocks.listSavedQueries.mockResolvedValue({ queries: SAVED_QUERIES });
  serviceMocks.saveQuery.mockResolvedValue({
    query: { ...SAVED_QUERIES[0], id: "q_new" },
  });
  serviceMocks.deleteSavedQuery.mockResolvedValue({ deleted: true, queryId: "q_1" });

  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

let ReportBuilderPage;
beforeEach(async () => {
  if (!ReportBuilderPage) {
    const mod = await import("@/app/[locale]/dashboard/admin/report-builder/page");
    ReportBuilderPage = mod.default;
  }
});

describe("ReportBuilderPage", () => {
  it("renders the dataset selector with all three datasets", async () => {
    render(<ReportBuilderPage />);
    expect(await screen.findByText("Report builder")).toBeInTheDocument();
    expect(screen.getByText("Dataset")).toBeInTheDocument();
    // Open the dataset dropdown and confirm the three options exist (labels
    // also appear in the saved-queries sidebar, so match any occurrence).
    fireEvent.click(screen.getByLabelText("Select report dataset"));
    expect((await screen.findAllByText("Users")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Transactions").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reports").length).toBeGreaterThanOrEqual(1);
  });

  it("renders filter controls and column checkboxes for the default dataset", async () => {
    render(<ReportBuilderPage />);
    expect(await screen.findByText("Filters")).toBeInTheDocument();
    expect(screen.getByLabelText("Status filter")).toBeInTheDocument();
    expect(screen.getByLabelText("Joined from filter")).toBeInTheDocument();
    expect(screen.getByText("Output columns")).toBeInTheDocument();
    // Column names repeat in the preview table header, so match any occurrence.
    expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Email").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the preview table with fetched rows", async () => {
    render(<ReportBuilderPage />);
    expect(await screen.findByText("Amina Yusuf")).toBeInTheDocument();
    expect(screen.getByText("Bilal Karim")).toBeInTheDocument();
  });

  it("renders saved queries in the sidebar and loads one on click", async () => {
    render(<ReportBuilderPage />);
    expect(await screen.findByText("Active users")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /run query active users/i }));
    await waitFor(() => {
      expect(serviceMocks.fetchReportRows).toHaveBeenCalledWith(
        "users",
        expect.objectContaining({ status: "active" }),
        expect.objectContaining({ limit: 50 })
      );
    });
  });

  it("saves the current query from the dialog", async () => {
    render(<ReportBuilderPage />);
    await screen.findByText("Report builder");

    fireEvent.click(screen.getByRole("button", { name: /save query/i }));
    const nameInput = await screen.findByLabelText("Query name");
    fireEvent.change(nameInput, { target: { value: "Active users" } });
    fireEvent.click(screen.getByRole("button", { name: /save query/i }));

    await waitFor(() => {
      expect(serviceMocks.saveQuery).toHaveBeenCalledWith(
        "me",
        expect.objectContaining({
          name: "Active users",
          datasetId: "users",
          columns: expect.arrayContaining(["name", "email"]),
        })
      );
    });
  });

  it("deletes a saved query from the sidebar", async () => {
    render(<ReportBuilderPage />);
    await screen.findByText("Active users");

    fireEvent.click(screen.getByRole("button", { name: /delete query active users/i }));
    await waitFor(() => {
      expect(serviceMocks.deleteSavedQuery).toHaveBeenCalledWith("me", "q_1");
    });
  });

  it("exports the preview as CSV via the standard path", async () => {
    render(<ReportBuilderPage />);
    await screen.findByText("Amina Yusuf");

    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));
    expect(csvMock.downloadCsv).toHaveBeenCalledTimes(1);
    const args = csvMock.downloadCsv.mock.calls[0][0];
    expect(args.filename).toContain("users-report");
    expect(args.headers).toContain("Name");
    expect(args.rows.length).toBe(2);
  });
});
