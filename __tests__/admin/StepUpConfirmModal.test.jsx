import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StepUpConfirmModal from "@/components/admin/StepUpConfirmModal";
import { resetRateLimit } from "@/lib/utils/rateLimiter";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

describe("StepUpConfirmModal Component (#311)", () => {
  const TEST_RATE_KEY = "test_stepup_rate_key";

  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimit(TEST_RATE_KEY);
  });

  it("derives expected phrase from actionVerb and targetName", () => {
    render(
      <StepUpConfirmModal
        open={true}
        onOpenChange={vi.fn()}
        targetName="user@example.com"
        actionVerb="BAN"
        rateLimitKey={TEST_RATE_KEY}
      />
    );

    expect(screen.getByText("BAN user@example.com")).toBeInTheDocument();
  });

  it("keeps confirm button disabled until phrase matches exact target phrase", () => {
    const handleConfirm = vi.fn();
    render(
      <StepUpConfirmModal
        open={true}
        onOpenChange={vi.fn()}
        targetName="user@example.com"
        actionVerb="BAN"
        onConfirm={handleConfirm}
        rateLimitKey={TEST_RATE_KEY}
      />
    );

    const input = screen.getByPlaceholderText('Type "BAN user@example.com"');
    const confirmBtn = screen.getByRole("button", { name: "Confirm Action" });

    // Initially disabled
    expect(confirmBtn).toBeDisabled();

    // Partial / wrong input
    fireEvent.change(input, { target: { value: "BAN user@" } });
    expect(confirmBtn).toBeDisabled();

    // Exact match
    fireEvent.change(input, { target: { value: "BAN user@example.com" } });
    expect(confirmBtn).not.toBeDisabled();
    expect(screen.getByText("Exact Match")).toBeInTheDocument();
  });

  it("triggers client-side rate limit and displays cooldown notice after rapid attempts", async () => {
    const handleConfirm = vi.fn();
    const { rerender } = render(
      <StepUpConfirmModal
        open={true}
        onOpenChange={vi.fn()}
        targetName="PLT-10042"
        actionVerb="REFUND"
        confirmText="Process Refund"
        onConfirm={handleConfirm}
        rateLimitKey={TEST_RATE_KEY}
      />
    );

    // Simulate 3 rapid confirms
    for (let i = 0; i < 3; i++) {
      const input = screen.getByPlaceholderText('Type "REFUND PLT-10042"');
      fireEvent.change(input, { target: { value: "REFUND PLT-10042" } });
      const submitBtn = screen.getByRole("button", { name: "Process Refund" });
      fireEvent.click(submitBtn);
    }

    // On 4th attempt, cooldown notice should activate
    rerender(
      <StepUpConfirmModal
        open={true}
        onOpenChange={vi.fn()}
        targetName="PLT-10042"
        actionVerb="REFUND"
        confirmText="Process Refund"
        onConfirm={handleConfirm}
        rateLimitKey={TEST_RATE_KEY}
      />
    );

    expect(screen.getByText("Rapid Confirm Cooldown Active")).toBeInTheDocument();
    expect(screen.getByText(/Multiple rapid destructive actions detected/i)).toBeInTheDocument();
  });

  it("supports role grant step-up confirmation with custom phrase", () => {
    const handleConfirm = vi.fn();
    render(
      <StepUpConfirmModal
        open={true}
        onOpenChange={vi.fn()}
        targetName="bilal@deenbridge.org"
        actionVerb="GRANT"
        expectedPhrase="GRANT SUPER_ADMIN bilal@deenbridge.org"
        confirmText="Grant Role"
        onConfirm={handleConfirm}
        rateLimitKey={TEST_RATE_KEY}
      />
    );

    expect(screen.getByText("GRANT SUPER_ADMIN bilal@deenbridge.org")).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Type "GRANT SUPER_ADMIN bilal@deenbridge.org"');
    fireEvent.change(input, { target: { value: "GRANT SUPER_ADMIN bilal@deenbridge.org" } });

    const btn = screen.getByRole("button", { name: "Grant Role" });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    expect(handleConfirm).toHaveBeenCalledWith("GRANT SUPER_ADMIN bilal@deenbridge.org");
  });
});
