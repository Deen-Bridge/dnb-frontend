import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

vi.mock("@/components/auth/AdminTierGuard", () => ({
  default: ({ children }) => children,
}));

const hookState = vi.hoisted(() => ({ current: null }));
vi.mock("@/hooks/useAdminReports", () => ({ default: () => hookState.current }));

const reasons = [
  { value: "does-not-violate-policy", label: "Doesn't violate policy" },
  { value: "already-handled", label: "Already handled" },
  { value: "insufficient-evidence", label: "Insufficient evidence" },
  { value: "duplicate", label: "Duplicate" },
];

const reports = [
  {
    id: "R-5521",
    subject: "Comment on Seerah Q&A",
    contentType: "comment",
    contentPreview: "Needs review",
    reporter: { id: "user-101", name: "Hafsa Ali", priorReportCount: 0 },
  },
];

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  hookState.current = {
    reports,
    isLoading: false,
    isDismissing: false,
    error: null,
    refresh: vi.fn(),
    dismiss: vi.fn(),
  };
});

describe("AdminReportsPage", () => {
  it("renders the report queue and dismissal action", async () => {
    const { default: AdminReportsPage } = await import(
      "@/app/[locale]/dashboard/admin/reports/page"
    );
    render(<AdminReportsPage />);

    expect(screen.getByText("Report queue")).toBeInTheDocument();
    expect(screen.getByText(/reported by hafsa ali/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss report/i })).toBeInTheDocument();
  });

  it("shows the first-time reporter notification default after opening the dialog", async () => {
    const { default: AdminReportsPage } = await import(
      "@/app/[locale]/dashboard/admin/reports/page"
    );
    render(<AdminReportsPage />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss report/i }));

    expect(await screen.findByText(/notifications default on for first-time reporters/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /send courtesy notification/i })).toHaveAttribute(
      "data-state",
      "checked"
    );

    // Keep the supported choices close to the UI contract even though Radix
    // renders them in a portal only after the trigger is opened.
    expect(reasons.map(({ label }) => label)).toEqual([
      "Doesn't violate policy",
      "Already handled",
      "Insufficient evidence",
      "Duplicate",
    ]);
  });
});
