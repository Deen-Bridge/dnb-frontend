import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import { searchQuery } from "@/hooks/useSearch";

vi.mock("@/lib/config/axios.config", () => ({ default: { get: vi.fn() } }));

describe("searchQuery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes the backend results envelope", async () => {
    const rows = [{ id: "course-1", type: "course" }];
    axiosInstance.get.mockResolvedValue({ data: { results: rows } });

    await expect(searchQuery("fiqh")).resolves.toEqual(rows);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/search?q=fiqh");
  });

  it("does not fabricate local results when the API fails", async () => {
    axiosInstance.get.mockRejectedValue(new Error("offline"));

    await expect(searchQuery("fiqh")).rejects.toThrow("offline");
  });
});
