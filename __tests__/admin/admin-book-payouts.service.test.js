import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBookPayouts } from "@/lib/actions/admin-book-payouts";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("admin-book-payouts service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries book transactions with date params and aggregates matched book", async () => {
    const confirmed = {
      _id: "tx_a",
      txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
      itemType: "book",
      itemId: "bk_002",
      itemTitle: "Understanding Hadith Sciences",
      amount: 12.99,
      status: "confirmed",
      buyer: { name: "Amina Yusuf" },
      creator: { name: "Dr. Fatima" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-08-05T10:00:00.000Z",
    };
    const pending = {
      _id: "tx_b",
      txHash: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c",
      itemType: "book",
      itemId: "bk_002",
      itemTitle: "Understanding Hadith Sciences",
      amount: 12.99,
      status: "pending",
      buyer: { name: "Umar Farouk" },
      creator: { name: "Dr. Fatima" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-08-01T12:00:00.000Z",
    };
    const otherItem = {
      _id: "tx_c",
      txHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
      itemType: "course",
      itemTitle: "Arabic Grammar Essentials",
      amount: 35,
      status: "confirmed",
      creator: { name: "Dr. Bilal Karim" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-08-04T12:00:00.000Z",
    };

    axiosInstance.get.mockResolvedValueOnce({
      data: { success: true, transactions: [confirmed, pending, otherItem] },
    });

    const result = await fetchBookPayouts({
      bookId: "bk_002",
      bookTitle: "Understanding Hadith Sciences",
      creatorName: "Dr. Fatima",
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/transactions",
      expect.objectContaining({
        params: expect.objectContaining({
          itemType: "book",
          limit: 200,
          dateFrom: "2026-08-01",
          dateTo: "2026-08-31",
        }),
      })
    );

    expect(result.success).toBe(true);
    expect(result.summary.unitsSold).toBe(1);
    expect(result.summary.grossUsdc).toBe(12.99);
    expect(result.summary.settlements.length).toBe(2);
    expect(result.summary.creatorWallet).toBe(
      "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567"
    );
    expect(result.summary.creatorName).toBe("Dr. Fatima");
  });

  it("prefers the immutable book identifier over title matching", async () => {
    const matchingId = {
      _id: "tx_a",
      txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
      itemType: "book",
      itemId: "bk_002",
      itemTitle: "Some Other Title",
      amount: 12.99,
      status: "confirmed",
      buyer: { name: "Amina Yusuf" },
      creator: { name: "Dr. Fatima" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-08-05T10:00:00.000Z",
    };
    const wrongId = {
      _id: "tx_b",
      txHash: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c",
      itemType: "book",
      itemId: "bk_999",
      itemTitle: "Understanding Hadith Sciences",
      amount: 12.99,
      status: "confirmed",
      buyer: { name: "Umar Farouk" },
      creator: { name: "Dr. Fatima" },
      creatorWallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
      createdAt: "2026-08-04T12:00:00.000Z",
    };

    axiosInstance.get.mockResolvedValueOnce({
      data: { success: true, transactions: [matchingId, wrongId] },
    });

    const result = await fetchBookPayouts({
      bookId: "bk_002",
      bookTitle: "Understanding Hadith Sciences",
    });

    expect(result.summary.creatorWallet).toBe(
      "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567"
    );
    expect(result.summary.settlements.length).toBe(1);
    expect(result.summary.unitsSold).toBe(1);
  });

  it("returns an empty verified summary when the API has no transactions for the book", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: { success: true, transactions: [] },
    });

    const result = await fetchBookPayouts({
      bookId: "bk_001",
      bookTitle: "Introduction to Fiqh",
      creatorName: "Sheikh Ahmad",
    });

    expect(result.success).toBe(true);
    expect(result.summary.bookId).toBe("bk_001");
    expect(result.summary.title).toBe("Introduction to Fiqh");
    expect(result.summary.unitsSold).toBe(0);
    expect(result.summary.grossUsdc).toBe(0);
    expect(result.summary.settlements).toEqual([]);
    expect(result.summary.creatorWallet).toBe("");
  });

  it("returns an empty verified summary when no transaction matches the book id", async () => {
    const orphan = {
      _id: "tx_c",
      txHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
      itemType: "book",
      amount: 9.99,
      status: "confirmed",
      buyer: { name: "Fatima Ali" },
      creator: { name: "Unknown" },
      creatorWallet: "GC3BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q111",
      createdAt: "2026-08-05T10:00:00.000Z",
    };

    axiosInstance.get.mockResolvedValueOnce({
      data: { success: true, transactions: [orphan] },
    });

    const result = await fetchBookPayouts({
      bookId: "bk_002",
      bookTitle: "Understanding Hadith Sciences",
    });

    expect(result.success).toBe(true);
    expect(result.summary.bookId).toBe("bk_002");
    expect(result.summary.settlements).toEqual([]);
    expect(result.summary.unitsSold).toBe(0);
    expect(result.summary.creatorWallet).toBe("");
  });

  it("filters settlements to the requested date range", async () => {
    const inRange = {
      _id: "tx_a",
      txHash: "1a1b1c1d1e1f1a1b1c1d1e1f1a1b1c1d1e1f1a1b1c1d1e1f1a1b1c1d1e1f1a",
      itemType: "book",
      itemId: "bk_002",
      amount: 12.99,
      status: "confirmed",
      buyer: { name: "Umar Farouk" },
      creator: { name: "Dr. Fatima" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-07-19T14:30:00.000Z",
    };
    const outOfRange = {
      _id: "tx_b",
      txHash: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c",
      itemType: "book",
      itemId: "bk_002",
      amount: 12.99,
      status: "confirmed",
      buyer: { name: "Amina Yusuf" },
      creator: { name: "Dr. Fatima" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-08-05T10:00:00.000Z",
    };

    axiosInstance.get.mockResolvedValueOnce({
      data: { success: true, transactions: [inRange, outOfRange] },
    });

    const result = await fetchBookPayouts({
      bookId: "bk_002",
      bookTitle: "Understanding Hadith Sciences",
      dateFrom: "2026-07-15",
      dateTo: "2026-07-31",
    });

    expect(result.success).toBe(true);
    expect(result.summary.settlements.length).toBe(1);
    expect(result.summary.settlements[0].createdAt).toBe("2026-07-19T14:30:00.000Z");
    expect(result.summary.unitsSold).toBe(1);
    expect(result.summary.grossUsdc).toBe(12.99);
  });

  it("propagates the server error message when the API is unavailable", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Server exploded" } },
    });

    const result = await fetchBookPayouts({ bookId: "bk_002" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Server exploded");
  });

  it("propagates a fallback error message when the API errors without a message", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      code: "ERR_NETWORK",
      message: "Network Error",
    });

    const result = await fetchBookPayouts({ bookId: "bk_002" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network Error");
  });
});
