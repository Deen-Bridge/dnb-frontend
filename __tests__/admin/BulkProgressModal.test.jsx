import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BulkProgressModal from "@/components/admin/verifications/BulkProgressModal";
import * as verificationsService from "@/lib/actions/admin-verifications";

vi.mock("@/lib/admin/audit", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: {
    VERIFICATION_APPROVE: "verification.approve",
    VERIFICATION_REJECT: "verification.reject",
    VERIFICATION_BULK_APPROVE: "verification.bulk_approve",
    VERIFICATION_BULK_REJECT: "verification.bulk_reject",
  },
}));

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: { application: { status: "approved" } } }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

describe("BulkProgressModal", () => {
  const mockItems = [
    { id: "app_1", name: "Sheikh Tariq", email: "tariq@example.org" },
    { id: "app_2", name: "Ustadha Fatima", email: "fatima@example.com" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders progress modal and completes sequential execution", async () => {
    const onComplete = vi.fn();

    render(
      <BulkProgressModal
        open={true}
        action="approve"
        items={mockItems}
        onComplete={onComplete}
      />
    );

    expect(screen.getByTestId("bulk-progress-modal")).toBeInTheDocument();
    expect(screen.getByTestId("bulk-progress-bar")).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/Bulk Approval Complete/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("bulk-progress-text").textContent).toContain("Completed 100%");

    const doneBtn = screen.getByTestId("close-progress-modal-btn");
    expect(doneBtn).not.toBeDisabled();
    fireEvent.click(doneBtn);

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        succeeded: expect.any(Array),
        failed: [],
      })
    );
  });

  it("handles failed items and renders retry button", async () => {
    // Spy on executeSequentialBulkDecisions to simulate one failure
    vi.spyOn(verificationsService, "executeSequentialBulkDecisions").mockResolvedValueOnce({
      succeeded: [{ item: mockItems[0], success: true }],
      failed: [{ item: mockItems[1], success: false, error: "Network timeout" }],
      total: 2,
    });

    render(
      <BulkProgressModal
        open={true}
        action="reject"
        items={mockItems}
        reasonCategory="invalid_documents"
        onComplete={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Completed with Errors/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("retry-failed-btn")).toBeInTheDocument();
    expect(screen.getByText(/Retry Failed \(1\)/i)).toBeInTheDocument();
  });
});
