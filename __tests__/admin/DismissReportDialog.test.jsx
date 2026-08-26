/**
 * Dismissal workflow tests — #293
 * ------------------------------------------------------------------
 * Covers:
 *   1. admin-moderation service:  DISMISSAL_REASONS, getReporterReportCount,
 *      isFirstTimeReporter, sendDismissalNotification, dismissReport
 *   2. DismissReportDialog component: reason picker, notify checkbox smart
 *      defaults, submit flow, cancel, error state
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// ── Font mock (needed by DismissReportDialog) ──────────────────────────────
vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

// ── Audit mock — fire-and-forget, not observable in unit tests ─────────────
vi.mock("@/lib/admin/audit", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: {
    TAKEDOWN: "content.takedown",
    RESTORE: "content.restore",
    REPORT_DISMISS: "report.dismiss",
  },
}));

import {
  DISMISSAL_REASONS,
  getReporterReportCount,
  isFirstTimeReporter,
  sendDismissalNotification,
  dismissReport,
} from "@/lib/actions/admin-moderation";

import DismissReportDialog from "@/components/admin/DismissReportDialog";

// jsdom layout/pointer API stubs required by Radix UI primitives
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
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

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.clearAllMocks());

// ============================================================================
// 1. Service — DISMISSAL_REASONS
// ============================================================================
describe("DISMISSAL_REASONS", () => {
  it("exposes exactly the four required options", () => {
    const values = DISMISSAL_REASONS.map((r) => r.value);
    expect(values).toContain("no_violation");
    expect(values).toContain("already_handled");
    expect(values).toContain("insufficient_evidence");
    expect(values).toContain("duplicate");
    expect(DISMISSAL_REASONS).toHaveLength(4);
  });

  it("each option has a non-empty label string", () => {
    for (const reason of DISMISSAL_REASONS) {
      expect(typeof reason.label).toBe("string");
      expect(reason.label.length).toBeGreaterThan(0);
    }
  });

  it("is frozen (immutable)", () => {
    expect(Object.isFrozen(DISMISSAL_REASONS)).toBe(true);
  });
});

// ============================================================================
// 2. Service — first-time vs. repeat reporter detection
// ============================================================================
describe("getReporterReportCount", () => {
  it("returns 0 for the known first-time reporter (rp_1)", async () => {
    expect(await getReporterReportCount("rp_1")).toBe(0);
  });

  it("returns a positive count for a known repeat reporter (rp_2)", async () => {
    expect(await getReporterReportCount("rp_2")).toBeGreaterThan(0);
  });

  it("returns 0 for an unknown reporter id", async () => {
    expect(await getReporterReportCount("rp_unknown_xyz")).toBe(0);
  });
});

describe("isFirstTimeReporter", () => {
  it("returns true for the first-time reporter (rp_1)", async () => {
    expect(await isFirstTimeReporter("rp_1")).toBe(true);
  });

  it("returns false for a repeat reporter (rp_3)", async () => {
    expect(await isFirstTimeReporter("rp_3")).toBe(false);
  });
});

// ============================================================================
// 3. Service — sendDismissalNotification stub
// ============================================================================
describe("sendDismissalNotification", () => {
  it("resolves with queued:true and a notification id", async () => {
    const result = await sendDismissalNotification({
      reporterId: "rp_1",
      reportId: "rpt_0001",
      dismissalReason: "no_violation",
    });
    expect(result.queued).toBe(true);
    expect(typeof result.notificationId).toBe("string");
    expect(result.notificationId.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 4. Service — dismissReport
// ============================================================================
describe("dismissReport", () => {
  it("rejects when reportId is missing", async () => {
    await expect(
      dismissReport({ reporterId: "rp_1", reason: "no_violation" })
    ).rejects.toThrow(/reportId is required/i);
  });

  it("rejects when reporterId is missing", async () => {
    await expect(
      dismissReport({ reportId: "rpt_0001", reason: "no_violation" })
    ).rejects.toThrow(/reporterId is required/i);
  });

  it("rejects an unknown reason", async () => {
    await expect(
      dismissReport({ reportId: "rpt_0001", reporterId: "rp_1", reason: "bad_reason" })
    ).rejects.toThrow(/invalid dismissal reason/i);
  });

  it("resolves with dismissed status and the chosen reason", async () => {
    const { report } = await dismissReport({
      reportId: "rpt_0001",
      reporterId: "rp_1",
      reason: "no_violation",
    });
    expect(report.status).toBe("dismissed");
    expect(report.dismissalReason).toBe("no_violation");
  });

  it("uses smart default — notifies first-time reporter", async () => {
    // rp_1 starts with count=0 in REPORTER_HISTORY — a fresh first-time reporter.
    // Use a unique id to avoid cross-test contamination from the previous test
    // that incremented rp_1's count.
    const { report } = await dismissReport({
      reportId: "rpt_ft_test",
      reporterId: "rp_1_fresh", // unknown → count defaults to 0 → first-time
      reason: "duplicate",
    });
    expect(report.reporterNotified).toBe(true);
  });

  it("uses smart default — does NOT notify repeat reporter", async () => {
    const { report } = await dismissReport({
      reportId: "rpt_0002",
      reporterId: "rp_2",
      reason: "already_handled",
    });
    expect(report.reporterNotified).toBe(false);
  });

  it("respects an explicit notify:true override for a repeat reporter", async () => {
    const { report } = await dismissReport({
      reportId: "rpt_0003",
      reporterId: "rp_3",
      reason: "duplicate",
      notify: true,
    });
    expect(report.reporterNotified).toBe(true);
  });

  it("respects an explicit notify:false override for a first-time reporter", async () => {
    const { report } = await dismissReport({
      reportId: "rpt_0004",
      reporterId: "rp_1_override",
      reason: "insufficient_evidence",
      notify: false,
    });
    expect(report.reporterNotified).toBe(false);
  });

  it("returns a notificationId when notify is true", async () => {
    const result = await dismissReport({
      reportId: "rpt_0005",
      reporterId: "rp_1_nid",
      reason: "no_violation",
      notify: true,
    });
    expect(typeof result.notificationId).toBe("string");
    expect(result.notificationId.length).toBeGreaterThan(0);
  });

  it("returns null notificationId when notify is false", async () => {
    const result = await dismissReport({
      reportId: "rpt_0006",
      reporterId: "rp_2",
      reason: "already_handled",
      notify: false,
    });
    expect(result.notificationId).toBeNull();
  });
});

// ============================================================================
// 5. DismissReportDialog — component tests
// ============================================================================

const FIRST_TIME_REPORT = {
  id: "rpt_dialog_1",
  reporter: { id: "rp_1_dialog", name: "Sarah A." },
};

const REPEAT_REPORT = {
  id: "rpt_dialog_2",
  reporter: { id: "rp_2", name: "Mohammed B." },
};

function renderDialog(report = REPEAT_REPORT, overrides = {}) {
  const onOpenChange = overrides.onOpenChange ?? vi.fn();
  const onDismissed = overrides.onDismissed ?? vi.fn();
  render(
    <DismissReportDialog
      open
      onOpenChange={onOpenChange}
      report={report}
      onDismissed={onDismissed}
    />
  );
  return { onOpenChange, onDismissed };
}

describe("DismissReportDialog", () => {
  it("renders the title and reason picker", async () => {
    renderDialog();
    expect(screen.getByRole("heading", { name: /dismiss report/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("Dismiss Report button is disabled until a reason is selected", async () => {
    renderDialog();
    await waitFor(() =>
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
    );
    const submitBtn = screen.getByRole("button", { name: /confirm dismissal/i });
    expect(submitBtn).toBeDisabled();
  });

  it("cancel button calls onOpenChange(false)", async () => {
    const { onOpenChange } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows notify checkbox with OFF default for repeat reporter", async () => {
    renderDialog(REPEAT_REPORT);
    // Wait for the smart-default useEffect to resolve
    await waitFor(() => {
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });

  it("shows notify checkbox with ON default for first-time reporter", async () => {
    renderDialog(FIRST_TIME_REPORT);
    await waitFor(() => {
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  it("lists all four dismissal reasons in the picker", async () => {
    renderDialog();
    // Open the select
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => {
      expect(screen.getByText("Doesn't violate policy")).toBeInTheDocument();
      expect(screen.getByText("Already handled")).toBeInTheDocument();
      expect(screen.getByText("Insufficient evidence")).toBeInTheDocument();
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
    });
  });

  it("enables the submit button once a reason is selected", async () => {
    renderDialog();
    await waitFor(() =>
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
    );

    // Open select and pick a reason
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() =>
      screen.getByText("Doesn't violate policy")
    );
    fireEvent.click(screen.getByText("Doesn't violate policy"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /confirm dismissal.*violate/i })).toBeEnabled()
    );
  });

  it("calls onDismissed and closes dialog after successful submission", async () => {
    const { onDismissed, onOpenChange } = renderDialog();
    await waitFor(() =>
      expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => screen.getByText("Already handled"));
    fireEvent.click(screen.getByText("Already handled"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /confirm dismissal.*already/i })).toBeEnabled()
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /confirm dismissal.*already/i }));
    });

    await waitFor(() => expect(onDismissed).toHaveBeenCalledWith(REPEAT_REPORT.id));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("allows toggling the notify checkbox", async () => {
    renderDialog(REPEAT_REPORT);
    await waitFor(() => {
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() =>
      expect(screen.getByRole("checkbox")).toBeChecked()
    );
  });
});
