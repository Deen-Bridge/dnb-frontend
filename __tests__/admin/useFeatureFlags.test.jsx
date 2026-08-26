/**
 * useFeatureFlags — toast consistency tests (#333).
 * ---------------------------------------------------
 * The feature-flag management hook surfaces every mutation through the
 * centralized admin toast wrapper: toggling (a reversible hide/unhide action)
 * shows a success toast with an **Undo** action, and failures show an error
 * toast with a **Retry** action instead of bare text.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { toast } from "sonner";

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ user: { id: "me", role: "admin", tier: "super_admin" }, loading: false }),
  useAuth: () => ({ user: { id: "me", role: "admin", tier: "super_admin" }, loading: false }),
}));

vi.mock("@/lib/auth/admin-tiers", () => ({
  canManageTeam: () => true,
}));

vi.mock("@/lib/admin/audit", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: { FLAG_TOGGLE: "flag:toggle" },
}));

const flagsMock = vi.hoisted(() => ({
  listFlags: vi.fn(),
  updateFlag: vi.fn(),
  createFlag: vi.fn(),
}));

vi.mock("@/lib/actions/admin-flags", () => ({
  listFlags: flagsMock.listFlags,
  updateFlag: flagsMock.updateFlag,
  createFlag: flagsMock.createFlag,
}));

import useFeatureFlags from "@/hooks/useFeatureFlags";

beforeEach(() => {
  vi.clearAllMocks();
  flagsMock.listFlags.mockResolvedValue({
    flags: [{ key: "dark-mode", enabled: false, rolloutPercentage: 0 }],
  });
  flagsMock.updateFlag.mockResolvedValue({ flag: { key: "dark-mode", enabled: true } });
});

describe("useFeatureFlags — toggle toasts", () => {
  it("shows a success toast with an Undo action after toggling on", async () => {
    const { result } = renderHook(() => useFeatureFlags());
    await waitFor(() => expect(result.current.flags).toHaveLength(1));

    result.current.toggleFlag("dark-mode", true);

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Flag enabled",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Undo" }),
        })
      )
    );
  });

  it("shows an error toast with a Retry action when the toggle fails", async () => {
    flagsMock.updateFlag.mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useFeatureFlags());
    await waitFor(() => expect(result.current.flags).toHaveLength(1));

    result.current.toggleFlag("dark-mode", true);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "network down",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Retry" }),
        })
      )
    );
  });

  it("shows a success toast after updating rollout", async () => {
    const { result } = renderHook(() => useFeatureFlags());
    await waitFor(() => expect(result.current.flags).toHaveLength(1));

    result.current.setRollout("dark-mode", 50);

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Rollout updated", expect.any(Object))
    );
  });
});
