import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BulkDecisionDialog from "@/components/admin/verifications/BulkDecisionDialog";

describe("BulkDecisionDialog", () => {
  const mockItems = Array.from({ length: 12 }, (_, i) => ({
    id: `app_${i + 1}`,
    name: `Educator ${i + 1}`,
    email: `educator${i + 1}@example.com`,
    country: "Egypt",
  }));

  it("renders pre-flight summary title 'You are about to approve 12 educators'", () => {
    render(
      <BulkDecisionDialog
        open={true}
        onOpenChange={vi.fn()}
        action="approve"
        selectedItems={mockItems}
        onConfirm={vi.fn()}
      />
    );

    const title = screen.getByTestId("preflight-summary-title");
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe("You are about to approve 12 educators");
  });

  it("renders pre-flight summary title 'You are about to reject 12 educators'", () => {
    render(
      <BulkDecisionDialog
        open={true}
        onOpenChange={vi.fn()}
        action="reject"
        selectedItems={mockItems}
        onConfirm={vi.fn()}
      />
    );

    const title = screen.getByTestId("preflight-summary-title");
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe("You are about to reject 12 educators");
  });

  it("skips notes input entirely for bulk approve and enables confirmation immediately", () => {
    const onConfirm = vi.fn();

    render(
      <BulkDecisionDialog
        open={true}
        onOpenChange={vi.fn()}
        action="approve"
        selectedItems={mockItems}
        onConfirm={onConfirm}
      />
    );

    // Notes textarea should NOT be rendered for approve
    expect(screen.queryByTestId("rejection-notes-textarea")).not.toBeInTheDocument();
    expect(screen.queryByTestId("rejection-category-select")).not.toBeInTheDocument();

    const confirmBtn = screen.getByTestId("confirm-bulk-decision-btn");
    expect(confirmBtn).not.toBeDisabled();
    expect(confirmBtn.textContent).toContain("Confirm & Approve 12 Educators");

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "approve",
        reasonCategory: null,
        notes: "",
        items: expect.any(Array),
      })
    );
  });

  it("requires choosing a shared reason category for bulk reject before confirm is enabled", () => {
    const onConfirm = vi.fn();

    render(
      <BulkDecisionDialog
        open={true}
        onOpenChange={vi.fn()}
        action="reject"
        selectedItems={mockItems}
        onConfirm={onConfirm}
      />
    );

    // Rejection reason select & notes should be present
    expect(screen.getByTestId("rejection-category-select")).toBeInTheDocument();
    expect(screen.getByTestId("rejection-notes-textarea")).toBeInTheDocument();

    // Confirm button is initially disabled without a reason category
    const confirmBtn = screen.getByTestId("confirm-bulk-decision-btn");
    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn.textContent).toContain("Confirm & Reject 12 Educators");
  });

  it("caps batch preview at 25 items if more items are selected", () => {
    const largeBatch = Array.from({ length: 30 }, (_, i) => ({
      id: `app_large_${i + 1}`,
      name: `Educator Large ${i + 1}`,
      email: `large${i + 1}@example.com`,
    }));

    render(
      <BulkDecisionDialog
        open={true}
        onOpenChange={vi.fn()}
        action="approve"
        selectedItems={largeBatch}
        onConfirm={vi.fn()}
      />
    );

    const title = screen.getByTestId("preflight-summary-title");
    expect(title.textContent).toBe("You are about to approve 25 educators");
    expect(screen.getByText(/Batch capped at 25 of 30/i)).toBeInTheDocument();
  });
});
