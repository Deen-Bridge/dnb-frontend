import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/admin/audit", () => ({
  AUDIT_ACTIONS: { REPORT_DISMISSED: "moderation.report_dismissed" },
  logAuditEvent: vi.fn(),
}));

import {
  DISMISSAL_REASONS,
  dismissReport,
  getDefaultNotificationPreference,
  isFirstTimeReporter,
  listReports,
} from "@/lib/actions/admin-reports";

describe("admin reports service", () => {
  it("exposes all supported dismissal reasons", () => {
    expect(DISMISSAL_REASONS.map(({ value }) => value)).toEqual([
      "does-not-violate-policy",
      "already-handled",
      "insufficient-evidence",
      "duplicate",
    ]);
  });

  it("identifies first-time reporters and applies smart defaults", () => {
    expect(isFirstTimeReporter({ priorReportCount: 0 })).toBe(true);
    expect(isFirstTimeReporter({ priorReportCount: 3 })).toBe(false);
    expect(getDefaultNotificationPreference({ priorReportCount: 0 })).toBe(true);
    expect(getDefaultNotificationPreference({ priorReportCount: 1 })).toBe(false);
  });

  it("decorates listed reports with their notification default", async () => {
    const { reports } = await listReports();
    expect(reports.find((report) => report.id === "R-5521").notifyReporterByDefault).toBe(true);
    expect(reports.find((report) => report.id === "R-5490").notifyReporterByDefault).toBe(false);
  });

  it("dismisses a report without queuing a notification when disabled", async () => {
    const { report, notification } = await dismissReport({
      reportId: "R-5521",
      reason: "insufficient-evidence",
      notifyReporter: false,
    });

    expect(report.status).toBe("dismissed");
    expect(report.dismissalReason).toBe("insufficient-evidence");
    expect(report.notifyReporter).toBe(false);
    expect(notification).toBeNull();
  });

  it("returns the courtesy notification stub when enabled", async () => {
    const { report, notification } = await dismissReport({
      reportId: "R-5490",
      reason: "duplicate",
      notifyReporter: true,
    });

    expect(report.notifyReporter).toBe(true);
    expect(notification).toMatchObject({
      status: "stubbed",
      queued: false,
      reportId: "R-5490",
      template: "report-reviewed",
    });
  });

  it("rejects missing or unsupported dismissal reasons", async () => {
    await expect(dismissReport({ reportId: "R-5521" })).rejects.toThrow(
      "Choose a valid dismissal reason"
    );
    await expect(
      dismissReport({ reportId: "R-5521", reason: "not-a-reason" })
    ).rejects.toThrow("Choose a valid dismissal reason");
  });
});
