/**
 * useReelPoster - optimistic poster update hook tests (#265).
 * -------------------------------------------------------------------------
 * Mirrors the existing useReelModeration coverage style: asserts the
 * optimistic value shows immediately, the committed server value lands, and
 * a rejected mutation rolls back to the baseline with a toast.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mocks = vi.hoisted(() => ({
  updateReelPoster: vi.fn(),
}));

vi.mock("@/lib/actions/reels-action", () => ({
  updateReelPoster: mocks.updateReelPoster,
}));

import { toast } from "sonner";
import useReelPoster from "@/hooks/useReelPoster";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useReelPoster()", () => {
  it("starts with the initial poster", () => {
    const { result } = renderHook(() => useReelPoster("reel-1", "https://cdn/old.jpg"));
    expect(result.current.poster).toBe("https://cdn/old.jpg");
  });

  it("applies the new poster optimistically, then commits the server value", async () => {
    let resolveUpdate;
    mocks.updateReelPoster.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      })
    );
    const { result } = renderHook(() => useReelPoster("reel-1", null));

    let mutation;
    act(() => {
      mutation = result.current.setPoster("https://cdn/new.jpg");
    });

    // Optimistic value shows before the (still-pending) mutation resolves.
    await waitFor(() => expect(result.current.poster).toBe("https://cdn/new.jpg"));

    act(() => {
      resolveUpdate({
        reel: { id: "reel-1", poster: "https://cdn/server-echoed.jpg" },
      });
    });

    await waitFor(() =>
      expect(result.current.poster).toBe("https://cdn/server-echoed.jpg")
    );
    await mutation;

    expect(mocks.updateReelPoster).toHaveBeenCalledWith("reel-1", {
      posterUrl: "https://cdn/new.jpg",
    });
  });

  it("rolls back to the baseline and toasts on failure", async () => {
    mocks.updateReelPoster.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() =>
      useReelPoster("reel-1", "https://cdn/old.jpg")
    );

    await act(async () => {
      await result.current.setPoster("https://cdn/new.jpg").catch(() => {});
    });

    expect(result.current.poster).toBe("https://cdn/old.jpg");
    expect(toast.error).toHaveBeenCalledWith(
      "Couldn't update this reel's poster"
    );
  });
});
