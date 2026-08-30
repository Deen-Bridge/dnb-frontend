/**
 * lib/actions/reels-action - updateReelPoster (#265) stub contract.
 * -------------------------------------------------------------------------
 * Mirrors the coverage style of the existing setReelVisibility stub (#335):
 * asserts the resolved shape callers depend on, the validation guard, and
 * that concurrent calls for different reels don't clobber each other's
 * in-memory state.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateReelPoster } from "@/lib/actions/reels-action";

describe("updateReelPoster()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("resolves with the reel id, poster url, and an updatedAt timestamp", async () => {
    const promise = updateReelPoster("reel-1", {
      posterUrl: "https://res.cloudinary.com/demo/image/upload/reel-1.jpg",
    });
    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result.reel.id).toBe("reel-1");
    expect(result.reel.poster).toBe(
      "https://res.cloudinary.com/demo/image/upload/reel-1.jpg"
    );
    expect(typeof result.reel.updatedAt).toBe("string");
  });

  it("rejects when posterUrl is missing", async () => {
    await expect(updateReelPoster("reel-1", {})).rejects.toThrow(
      /poster url is required/i
    );
  });

  it("rejects when posterUrl is not a string", async () => {
    await expect(
      updateReelPoster("reel-1", { posterUrl: 12345 })
    ).rejects.toThrow(/poster url is required/i);
  });

  it("keeps separate reels' posters independent", async () => {
    const p1 = updateReelPoster("reel-1", { posterUrl: "https://cdn/one.jpg" });
    const p2 = updateReelPoster("reel-2", { posterUrl: "https://cdn/two.jpg" });
    await vi.advanceTimersByTimeAsync(500);
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.reel.poster).toBe("https://cdn/one.jpg");
    expect(r2.reel.poster).toBe("https://cdn/two.jpg");
  });
});
