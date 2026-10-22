import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DecisionPanel } from "@/app/[locale]/admin/verification/[id]/page";

vi.mock("@/lib/admin/audit", () => ({ logAuditEvent: vi.fn(), AUDIT_ACTIONS: {} }));
vi.mock("@/lib/config/axios.config", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe("DecisionPanel", () => {
  it("requires a reason before reject is enabled", () => {
    const onReject = vi.fn();
    render(
      <DecisionPanel application={{ status: "pending" }} onApprove={vi.fn()} onReject={onReject} />
    );
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(reject).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Other reason"));
    fireEvent.click(reject);
    expect(onReject).toHaveBeenCalledWith({ reasonCategory: "other", notes: "" });
  });

  it("shows final state for decided applications", () => {
    render(<DecisionPanel application={{ status: "approved" }} />);
    expect(screen.getByTestId("decision-final")).toBeInTheDocument();
  });
});
