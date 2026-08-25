/**
 * Centralized admin toast wrapper (#333).
 * ------------------------------------------------------------------
 * All admin mutations surface feedback through this single sonner seam so
 * copy, timing, and undo/retry affordances stay uniform. These tests pin the
 * wrapper contract: uniform durations and action wiring.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { toast } from "sonner";
import {
  adminToastSuccess,
  adminToastError,
  adminToastInfo,
  ADMIN_TOAST_DURATIONS,
} from "@/lib/utils/admin-toast";

beforeEach(() => vi.clearAllMocks());

describe("adminToastSuccess", () => {
  it("shows a success toast with the uniform success duration", () => {
    adminToastSuccess({ title: "Highlight shown" });
    expect(toast.success).toHaveBeenCalledWith("Highlight shown", {
      duration: ADMIN_TOAST_DURATIONS.success,
    });
  });

  it("passes an optional undo action through to sonner", () => {
    const onUndo = vi.fn();
    adminToastSuccess({
      title: "Flag disabled",
      action: { label: "Undo", onClick: onUndo },
    });
    const options = toast.success.mock.calls[0][1];
    expect(options.action.label).toBe("Undo");
    options.action.onClick();
    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});

describe("adminToastError", () => {
  it("shows an error toast with the longer error duration", () => {
    adminToastError({ title: "Couldn't save settings" });
    expect(toast.error).toHaveBeenCalledWith("Couldn't save settings", {
      duration: ADMIN_TOAST_DURATIONS.error,
    });
  });

  it("passes an optional retry action through to sonner", () => {
    const onRetry = vi.fn();
    adminToastError({
      title: "Couldn't update flag",
      action: { label: "Retry", onClick: onRetry },
    });
    const options = toast.error.mock.calls[0][1];
    expect(options.action.label).toBe("Retry");
    options.action.onClick();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("adminToastInfo", () => {
  it("shows an info toast with the info duration", () => {
    adminToastInfo({ title: "Processing" });
    expect(toast.info).toHaveBeenCalledWith("Processing", {
      duration: ADMIN_TOAST_DURATIONS.info,
    });
  });
});
