import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGlobalTransactions } from "@/lib/actions/admin-transactions";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("admin-transactions service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls /api/admin/transactions with formatted query parameters", async () => {
    const mockApiResponse = {
      success: true,
      transactions: [
        {
          _id: "tx_1",
          txHash: "0x1234567890abcdef",
          amount: 50,
          status: "confirmed",
          itemType: "course",
          itemTitle: "Sample Course",
          createdAt: "2026-02-01T00:00:00.000Z",
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    };

    axiosInstance.get.mockResolvedValueOnce({ data: mockApiResponse });

    const params = {
      page: 1,
      limit: 10,
      status: "confirmed",
      itemType: "course",
      minAmount: 10,
      maxAmount: 100,
      buyerWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
    };

    const result = await fetchGlobalTransactions(params);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/admin/transactions",
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          limit: 10,
          status: "confirmed",
          itemType: "course",
          minAmount: 10,
          maxAmount: 100,
          buyerWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
        }),
      })
    );

    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0]._id).toBe("tx_1");
  });

  it("falls back gracefully to filtered mock dataset on network or 404 error", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      code: "ERR_NETWORK",
      message: "Network Error",
    });

    const result = await fetchGlobalTransactions({
      page: 1,
      limit: 10,
      status: "confirmed",
      itemType: "course",
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.transactions)).toBe(true);
    expect(result.pagination).toBeDefined();
    result.transactions.forEach((tx) => {
      expect(tx.status).toBe("confirmed");
      expect(tx.itemType).toBe("course");
    });
  });

  it("filters mock data by date range when offline/fallback", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await fetchGlobalTransactions({
      dateFrom: "2026-02-17",
      dateTo: "2026-02-23",
    });

    expect(result.success).toBe(true);
    result.transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      expect(date >= new Date("2026-02-17")).toBe(true);
      expect(date <= new Date("2026-02-23T23:59:59.999Z")).toBe(true);
    });
  });

  it("filters mock data by minAmount and maxAmount", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await fetchGlobalTransactions({
      minAmount: 15,
      maxAmount: 50,
    });

    expect(result.success).toBe(true);
    result.transactions.forEach((tx) => {
      expect(tx.amount).toBeGreaterThanOrEqual(15);
      expect(tx.amount).toBeLessThanOrEqual(50);
    });
  });
});
