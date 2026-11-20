import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import {
  fetchReconciliationStatus,
  reconcile,
} from "@/lib/actions/admin-reconciliation";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn() },
}));

describe("admin reconciliation service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the authoritative status endpoint with deterministic pagination", async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        transactions: [{ id: "txn-1", txHash: "hash-1" }],
        settlementClaims: [{ txHash: "hash-1", providerStatus: "confirmed", ledgerStatus: "settled" }],
        pagination: { page: 1, pageSize: 100, total: 1 },
      },
    } as never);

    const result = await fetchReconciliationStatus({ from: "2026-08-01", to: "2026-08-31" });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/stellar/payment/reconciliation/status",
      { params: { from: "2026-08-01", to: "2026-08-31", page: 1, pageSize: 100 } }
    );
    expect(result.transactions).toHaveLength(1);
    expect(result.claims).toHaveLength(1);
    expect(result.page.hasNext).toBe(false);
  });

  it("keeps an unknown provider outcome pending", () => {
    const [row] = reconcile(
      [{ id: "txn-1", txHash: "hash-1", amount: 10, currency: "USDC" } as never],
      [{ txHash: "hash-1", amount: 10, currency: "USDC", providerStatus: "unknown", ledgerStatus: "settled" }]
    );

    expect(row.status).toBe("pending");
  });

  it("marks matching confirmed and settled records as matched", () => {
    const [row] = reconcile(
      [{ id: "txn-1", txHash: "hash-1", amount: 10, currency: "USDC" } as never],
      [{ txHash: "hash-1", amount: 10, currency: "USDC", providerStatus: "confirmed", ledgerStatus: "settled" }]
    );

    expect(row.status).toBe("matched");
  });
});
