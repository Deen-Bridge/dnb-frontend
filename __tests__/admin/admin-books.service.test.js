import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAdminBooks,
  restoreBook,
  takeDownBook,
} from "@/lib/actions/admin-books";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("admin-books service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the admin catalog including taken-down books", async () => {
    const books = [
      { _id: "bk_1", title: "Active", status: "active" },
      { _id: "bk_2", title: "Hidden", status: "taken-down" },
    ];
    axiosInstance.get.mockResolvedValueOnce({ data: { success: true, data: books } });

    await expect(fetchAdminBooks()).resolves.toEqual(books);
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/books/admin");
  });

  it("returns an empty catalog when the response has no data array", async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { success: true, data: null } });
    await expect(fetchAdminBooks()).resolves.toEqual([]);
  });

  it("takes a book down with its reason category and note", async () => {
    const updated = {
      _id: "bk_2",
      status: "taken-down",
      takenDownReason: "dmca",
    };
    axiosInstance.patch.mockResolvedValueOnce({ data: { success: true, data: updated } });

    await expect(
      takeDownBook("bk_2", { reason: "dmca", note: "Rights notice" })
    ).resolves.toEqual(updated);

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/books/bk_2/take-down",
      {
        reason: "dmca",
        note: "Rights notice",
        purchaserAccessAllowed: true,
      }
    );
  });

  it("omits an empty note and forwards the purchaser access policy", async () => {
    axiosInstance.patch.mockResolvedValueOnce({ data: { success: true, data: {} } });

    await takeDownBook("bk_3", {
      reason: "content-violation",
      note: "   ",
      purchaserAccessAllowed: false,
    });

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/books/bk_3/take-down",
      {
        reason: "content-violation",
        note: undefined,
        purchaserAccessAllowed: false,
      }
    );
  });

  it("restores a taken-down book", async () => {
    const restored = { _id: "bk_2", status: "active" };
    axiosInstance.patch.mockResolvedValueOnce({ data: { success: true, data: restored } });

    await expect(restoreBook("bk_2")).resolves.toEqual(restored);
    expect(axiosInstance.patch).toHaveBeenCalledWith("/api/books/bk_2/restore");
  });
});
