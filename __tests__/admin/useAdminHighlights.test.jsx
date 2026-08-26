/**
 * useAdminHighlights — toast consistency tests (#333).
 * -----------------------------------------------------
 * Highlight visibility toggling is a reversible hide/unhide action: the
 * centralized wrapper shows a success toast with an **Undo** action, and
 * failures show an error toast with a **Retry** action.
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
  AUDIT_ACTIONS: { SETTINGS_CHANGE: "settings:change" },
}));

const highlightsMock = vi.hoisted(() => ({
  listAllHighlights: vi.fn(),
  toggleHighlight: vi.fn(),
  createHighlight: vi.fn(),
  updateHighlight: vi.fn(),
  deleteHighlight: vi.fn(),
  reorderHighlights: vi.fn(),
}));

vi.mock("@/lib/actions/admin-highlights", () => ({
  listAllHighlights: highlightsMock.listAllHighlights,
  toggleHighlight: highlightsMock.toggleHighlight,
  createHighlight: highlightsMock.createHighlight,
  updateHighlight: highlightsMock.updateHighlight,
  deleteHighlight: highlightsMock.deleteHighlight,
  reorderHighlights: highlightsMock.reorderHighlights,
}));

import useAdminHighlights from "@/hooks/useAdminHighlights";

const HIGHLIGHTS = [
  { id: "welcome", selector: "[data-feature='welcome']", title: "Welcome", message: "Hi", priority: 1, enabled: true },
];

beforeEach(() => {
  vi.clearAllMocks();
  highlightsMock.listAllHighlights.mockResolvedValue({ highlights: HIGHLIGHTS });
  highlightsMock.toggleHighlight.mockResolvedValue({ highlight: HIGHLIGHTS[0] });
});

describe("useAdminHighlights — toggle toasts", () => {
  it("shows a success toast with an Undo action when hiding a highlight", async () => {
    const { result } = renderHook(() => useAdminHighlights());
    await waitFor(() => expect(result.current.highlights).toHaveLength(1));

    result.current.toggle("welcome", false);

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Highlight hidden",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Undo" }),
        })
      )
    );
  });

  it("shows an error toast with a Retry action when the toggle fails", async () => {
    highlightsMock.toggleHighlight.mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useAdminHighlights());
    await waitFor(() => expect(result.current.highlights).toHaveLength(1));

    result.current.toggle("welcome", false);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "network down",
        expect.objectContaining({
          action: expect.objectContaining({ label: "Retry" }),
        })
      )
    );
  });
});
