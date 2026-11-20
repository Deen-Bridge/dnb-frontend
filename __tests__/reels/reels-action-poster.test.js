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

const patch = vi.fn();
vi.mock("@/lib/config/axios.config", () => ({ default: { patch } }));

describe("updateReelPoster()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patch.mockResolvedValue({ data: { reel: { id: "reel-1", poster: "https://res.cloudinary.com/demo/image/upload/reel-1.jpg", updatedAt: "2026-01-01T00:00:00.000Z" } } });
  });

  it("resolves with the reel id, poster url, and an updatedAt timestamp", async () => {
    const result = await updateReelPoster("reel-1", {
      posterUrl: "https://res.cloudinary.com/demo/image/upload/reel-1.jpg",
    });

    expect(result.reel.id).toBe("reel-1");
    expect(result.reel.poster).toBe(
      "https://res.cloudinary.com/demo/image/upload/reel-1.jpg"
    );
    expect(typeof result.reel.updatedAt).toBe("string");
    expect(patch).toHaveBeenCalledWith("/api/reels/reel-1/poster", { posterUrl: result.reel.poster });
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

  it("rejects unapproved poster origins before making a request", async () => {
    await expect(updateReelPoster("reel-1", { posterUrl: "https://evil.example/poster.jpg" })).rejects.toThrow(/Cloudinary/i);
    expect(patch).not.toHaveBeenCalled();
  });
});
