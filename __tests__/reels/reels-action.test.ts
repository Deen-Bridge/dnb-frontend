import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.hoisted(() => vi.fn());
const patchMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: getMock, patch: patchMock },
}));

import { fetchReels, updateReelVisibility } from "@/lib/actions/reels-action";

describe("reel visibility moderation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("excludes hidden reels from the default learner-facing feed", async () => {
    getMock.mockResolvedValue({
      data: {
        success: true,
        reels: [{ id: "visible" }, { id: "hidden", isHidden: true }],
      },
    });

    const result = await fetchReels();

    expect(result.reels).toEqual([{ id: "visible" }]);
    expect(getMock).toHaveBeenCalledWith("/api/reels", {
      params: { page: 1, limit: 10 },
    });
  });

  it("allows an admin consumer to request hidden reels", async () => {
    getMock.mockResolvedValue({ data: { success: true, reels: [{ id: "hidden", isHidden: true }] } });

    const result = await fetchReels({ includeHidden: true });

    expect(result.reels).toHaveLength(1);
    expect(getMock).toHaveBeenCalledWith("/api/reels", {
      params: { page: 1, limit: 10, includeHidden: true },
    });
  });

  it("sends the reason category and note when hiding a reel", async () => {
    patchMock.mockResolvedValue({ data: { success: true } });

    await updateReelVisibility("reel-101", {
      hidden: true,
      reasonCategory: "policy_violation",
      reasonNote: "Repeatedly violates the community rules.",
    });

    expect(patchMock).toHaveBeenCalledWith("/api/admin/reels/reel-101/visibility", {
      hidden: true,
      reasonCategory: "policy_violation",
      reasonNote: "Repeatedly violates the community rules.",
    });
  });

  it("requires a category and note before hiding a reel", async () => {
    await expect(updateReelVisibility("reel-101", { hidden: true })).rejects.toThrow(
      "reason category and moderation note"
    );
    expect(patchMock).not.toHaveBeenCalled();
  });
});
