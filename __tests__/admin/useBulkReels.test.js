/**
 * useBulkReels — tests for bulk reel moderation hook (#269).
 * -----------------------------------------------------------
 * Validates:
 *  - Selection toggling (single + all)
 *  - Clear selection
 *  - needsConfirmation threshold (20+)
 *  - bulkHide / bulkUnhide fan-out with progress
 *  - Keyboard-driven navigation (highlightedIndex)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ── Mock sonner toast ──────────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => "toast-id"),
  },
}));

import { toast } from "sonner";

import useBulkReels from "@/hooks/useBulkReels";

// ── Helpers ────────────────────────────────────────────────────────────

function makeReels(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: `rl_${String(i).padStart(4, "0")}`,
    title: `Reel ${i}`,
    description: `Description ${i}`,
    category: "General",
    author: { id: "usr_000", name: "Author" },
    status: "active",
    hidden: false,
    views: 100,
    likes: 10,
    comments: 5,
    createdAt: new Date().toISOString(),
  }));
}

function makeApiAction() {
  return vi.fn().mockResolvedValue({ ok: true });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────

describe("useBulkReels", () => {
  it("starts with empty selection", () => {
    const { result } = renderHook(() =>
      useBulkReels({
        reels: makeReels(),
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.processing).toBe(false);
  });

  it("toggleSelect adds and removes items", () => {
    const { result } = renderHook(() =>
      useBulkReels({
        reels: makeReels(),
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    act(() => result.current.toggleSelect("rl_0000"));
    expect(result.current.isSelected("rl_0000")).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggleSelect("rl_0000"));
    expect(result.current.isSelected("rl_0000")).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it("toggleSelectAll selects and deselects all", () => {
    const reels = makeReels(3);
    const { result } = renderHook(() =>
      useBulkReels({
        reels,
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    act(() => result.current.toggleSelectAll());
    expect(result.current.selectedCount).toBe(3);

    act(() => result.current.toggleSelectAll());
    expect(result.current.selectedCount).toBe(0);
  });

  it("clearSelection resets selection", () => {
    const { result } = renderHook(() =>
      useBulkReels({
        reels: makeReels(),
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    act(() => {
      result.current.toggleSelect("rl_0000");
      result.current.toggleSelect("rl_0001");
    });
    expect(result.current.selectedCount).toBe(2);

    act(() => result.current.clearSelection());
    expect(result.current.selectedCount).toBe(0);
  });

  it("needsConfirmation is false below threshold", () => {
    const { result } = renderHook(() =>
      useBulkReels({
        reels: makeReels(15),
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    // Select 5 items — below threshold
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.toggleSelect(`rl_${String(i).padStart(4, "0")}`);
      }
    });

    expect(result.current.needsConfirmation).toBe(false);
  });

  it("needsConfirmation is true at threshold (20+)", () => {
    const reels = makeReels(25);
    const { result } = renderHook(() =>
      useBulkReels({
        reels,
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.toggleSelect(`rl_${String(i).padStart(4, "0")}`);
      }
    });

    expect(result.current.needsConfirmation).toBe(true);
  });

  it("bulkHide calls apiAction for each selected item", async () => {
    const reels = makeReels(3);
    const apiAction = makeApiAction();
    const setReels = vi.fn();
    const mutateReel = vi.fn((r, changes) => ({ ...r, ...changes }));

    const { result } = renderHook(() =>
      useBulkReels({ reels, setReels, mutateReel, apiAction }),
    );

    act(() => {
      result.current.toggleSelect("rl_0000");
      result.current.toggleSelect("rl_0001");
    });

    await act(async () => {
      await result.current.bulkHide("Inappropriate content");
    });

    expect(apiAction).toHaveBeenCalledTimes(2);
    expect(apiAction).toHaveBeenCalledWith("rl_0000", "hide", "Inappropriate content");
    expect(apiAction).toHaveBeenCalledWith("rl_0001", "hide", "Inappropriate content");
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.processing).toBe(false);
  });

  it("bulkUnhide calls apiAction with unhide", async () => {
    const reels = makeReels(2);
    const apiAction = makeApiAction();
    const setReels = vi.fn();
    const mutateReel = vi.fn((r, changes) => ({ ...r, ...changes }));

    const { result } = renderHook(() =>
      useBulkReels({ reels, setReels, mutateReel, apiAction }),
    );

    act(() => {
      result.current.toggleSelect("rl_0000");
    });

    await act(async () => {
      await result.current.bulkUnhide("");
    });

    expect(apiAction).toHaveBeenCalledWith("rl_0000", "unhide", "");
    expect(result.current.selectedCount).toBe(0);
  });

  it("moveHighlight adjusts index within bounds", () => {
    const reels = makeReels(3);
    const { result } = renderHook(() =>
      useBulkReels({
        reels,
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    expect(result.current.highlightedIndex).toBe(0);

    act(() => result.current.moveHighlight(1));
    expect(result.current.highlightedIndex).toBe(1);

    act(() => result.current.moveHighlight(1));
    expect(result.current.highlightedIndex).toBe(2);

    // Should clamp at max
    act(() => result.current.moveHighlight(1));
    expect(result.current.highlightedIndex).toBe(2);

    // Should clamp at min
    act(() => result.current.moveHighlight(-5));
    expect(result.current.highlightedIndex).toBe(0);
  });

  it("setConfirmed controls confirmation state", () => {
    const { result } = renderHook(() =>
      useBulkReels({
        reels: makeReels(),
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    expect(result.current.confirmed).toBe(false);

    act(() => result.current.setConfirmed(true));
    expect(result.current.confirmed).toBe(true);
  });

  it("selection resets confirmation state", () => {
    const { result } = renderHook(() =>
      useBulkReels({
        reels: makeReels(),
        setReels: vi.fn(),
        mutateReel: vi.fn(),
        apiAction: makeApiAction(),
      }),
    );

    act(() => result.current.setConfirmed(true));
    expect(result.current.confirmed).toBe(true);

    act(() => result.current.toggleSelect("rl_0000"));
    expect(result.current.confirmed).toBe(false);
  });
});
