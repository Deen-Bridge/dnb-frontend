import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminEducatorsVerificationPage from "@/app/[locale]/admin/educators/page";
import * as verificationsService from "@/lib/actions/admin-verifications";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/lib/admin/audit", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: {
    VERIFICATION_APPROVE: "verification.approve",
    VERIFICATION_REJECT: "verification.reject",
    VERIFICATION_BULK_APPROVE: "verification.bulk_approve",
    VERIFICATION_BULK_REJECT: "verification.bulk_reject",
  },
}));

describe("AdminEducatorsVerificationPage", () => {
  const mockQueueData = {
    applications: [
      {
        id: "app_v01",
        name: "Sheikh Tariq Mansoor",
        email: "tariq.mansoor@example.org",
        country: "Egypt",
        submittedAt: "2026-08-28T14:30:00Z",
        status: "pending",
        bio: "Graduate of Al-Azhar University.",
        subjects: ["Fiqh", "Hadith"],
        documents: [{ id: "doc_1", type: "national_id" }],
        livenessScore: 98,
        livenessPassed: true,
      },
      {
        id: "app_v02",
        name: "Ustadha Fatima Zahra",
        email: "fatima.zahra@example.com",
        country: "Morocco",
        submittedAt: "2026-08-28T11:20:00Z",
        status: "pending",
        bio: "Ijazah holder in Hafs 'an Asim.",
        subjects: ["Tajweed"],
        documents: [{ id: "doc_2", type: "qualification" }],
        livenessScore: 96,
        livenessPassed: true,
      },
    ],
    total: 2,
    counts: {
      all: 10,
      pending: 2,
      under_review: 1,
      approved: 5,
      rejected: 2,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(verificationsService, "fetchVerificationQueue").mockResolvedValue(mockQueueData);
  });

  it("renders page header, metrics cards, and queue table", async () => {
    render(<AdminEducatorsVerificationPage />);

    expect(screen.getByText("Educator Verifications")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Sheikh Tariq Mansoor")).toBeInTheDocument();
      expect(screen.getByText("Ustadha Fatima Zahra")).toBeInTheDocument();
    });

    // Metric cards
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
    expect(screen.getByText("Approved Total")).toBeInTheDocument();
  });

  it("handles multi-selection and displays BulkActionBar", async () => {
    render(<AdminEducatorsVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText("Sheikh Tariq Mansoor")).toBeInTheDocument();
    });

    // BulkActionBar should not be visible when 0 selected
    expect(screen.queryByTestId("bulk-action-bar")).not.toBeInTheDocument();

    // Select first row
    const firstCheckbox = screen.getByTestId("row-checkbox-app_v01");
    fireEvent.click(firstCheckbox);

    // BulkActionBar should now appear
    expect(screen.getByTestId("bulk-action-bar")).toBeInTheDocument();
    expect(screen.getByText(/1 educator selected/i)).toBeInTheDocument();

    // Select second row
    const secondCheckbox = screen.getByTestId("row-checkbox-app_v02");
    fireEvent.click(secondCheckbox);

    expect(screen.getByText(/2 educators selected/i)).toBeInTheDocument();
  });

  it("selects all visible items up to batch cap (25) when select-all is clicked", async () => {
    render(<AdminEducatorsVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText("Sheikh Tariq Mansoor")).toBeInTheDocument();
    });

    const selectAllCheckbox = screen.getByTestId("select-all-checkbox");
    fireEvent.click(selectAllCheckbox);

    expect(screen.getByText(/2 educators selected/i)).toBeInTheDocument();
  });

  it("opens bulk approve pre-flight summary dialog when clicking Approve Selected", async () => {
    render(<AdminEducatorsVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText("Sheikh Tariq Mansoor")).toBeInTheDocument();
    });

    // Select both
    fireEvent.click(screen.getByTestId("select-all-checkbox"));

    const approveSelectedBtn = screen.getByRole("button", {
      name: /Approve Selected \(2\)/i,
    });
    fireEvent.click(approveSelectedBtn);

    // Pre-flight dialog opens with summary title
    expect(screen.getByTestId("bulk-decision-dialog")).toBeInTheDocument();
    const title = screen.getByTestId("preflight-summary-title");
    expect(title.textContent).toBe("You are about to approve 2 educators");
  });

  it("opens bulk reject pre-flight dialog when clicking Reject Selected", async () => {
    render(<AdminEducatorsVerificationPage />);

    await waitFor(() => {
      expect(screen.getByText("Sheikh Tariq Mansoor")).toBeInTheDocument();
    });

    // Select first row
    fireEvent.click(screen.getByTestId("row-checkbox-app_v01"));

    const rejectSelectedBtn = screen.getByRole("button", {
      name: /Reject Selected \(1\)/i,
    });
    fireEvent.click(rejectSelectedBtn);

    expect(screen.getByTestId("bulk-decision-dialog")).toBeInTheDocument();
    const title = screen.getByTestId("preflight-summary-title");
    expect(title.textContent).toBe("You are about to reject 1 educator");
  });
});
