/**
 * Admin refunds register service — wired data-path tests (#479).
 * ------------------------------------------------------------------
 * Pins the seam the refunds register page calls: `listRefunds` must hit
 * `GET /api/stellar/payment/refunds` and `retryRefund` must hit
 * `POST /api/stellar/payment/refunds/:refundId/retry`, both through the
 * shared axios instance. Failures must reject with a readable message so
 * `hooks/useRefunds` can render the page's existing error state instead of
 * crashing. No network — axios and the audit sink are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { listRefunds, retryRefund, filterRefunds } from "@/lib/actions/admin-refunds";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/lib/actions/admin-audit", () => ({
  logAdminAction: vi.fn().mockResolvedValue({ log: {} }),
}));

const sampleRefund = {
  id: "rfd-2051",
  initiatedBy: { type: "admin", label: "Ustadh Bilal" },
  buyer: { id: "usr-3001", name: "Amina Yusuf" },
  transaction: { id: "txn-1002", reference: "PUR-2026-1002" },
  amount: 40,
  currency: "USDC",
  status: "failed",
  requestedAt: "2026-08-20T10:12:00.000Z",
  completedAt: null,
  audit: [],
};

describe("admin-refunds service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRefunds", () => {
    it("calls GET /api/stellar/payment/refunds and returns the register", async () => {
      axiosInstance.get.mockResolvedValueOnce({
        data: { success: true, refunds: [sampleRefund] },
      });

      const result = await listRefunds();

      expect(axiosInstance.get).toHaveBeenCalledWith("/api/stellar/payment/refunds");
      expect(result.refunds).toHaveLength(1);
      expect(result.refunds[0].id).toBe("rfd-2051");
      expect(result.refunds[0].status).toBe("failed");
    });

    it("normalizes a bare array body into the { refunds } payload", async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: [sampleRefund] });

      const result = await listRefunds();

      expect(Array.isArray(result.refunds)).toBe(true);
      expect(result.refunds).toHaveLength(1);
    });

    it("resolves an empty register when the body has no refunds array", async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: { success: false } });

      const result = await listRefunds();

      expect(result.refunds).toEqual([]);
    });

    it("rejects with the server-provided message on API failure", async () => {
      axiosInstance.get.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { success: false, message: "Forbidden: admin only" },
        },
      });

      await expect(listRefunds()).rejects.toThrow("Forbidden: admin only");
    });

    it("falls back to a generic message when the error carries none", async () => {
      axiosInstance.get.mockRejectedValueOnce({ code: "ERR_NETWORK" });

      await expect(listRefunds()).rejects.toThrow("Failed to load refunds");
    });
  });

  describe("retryRefund", () => {
    it("POSTs to /api/stellar/payment/refunds/:refundId/retry with the reason", async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { success: true, refund: { id: "rfd-2051", status: "processing" } },
      });

      const result = await retryRefund("rfd-2051", { reason: "settlement wallet funded" });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/stellar/payment/refunds/rfd-2051/retry",
        { reason: "settlement wallet funded" }
      );
      expect(result.refund.status).toBe("processing");
    });

    it("defaults the payload reason to null when no context is given", async () => {
      axiosInstance.post.mockResolvedValueOnce({
        data: { refund: { id: "rfd-2050", status: "processing" } },
      });

      await retryRefund("rfd-2050");

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/api/stellar/payment/refunds/rfd-2050/retry",
        { reason: null }
      );
    });

    it("rejects with the server-provided message when the retry is refused", async () => {
      axiosInstance.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: { success: false, message: "Refund is not in a retryable state" },
        },
      });

      await expect(retryRefund("rfd-2051")).rejects.toThrow("Refund is not in a retryable state");
    });
  });

  describe("filterRefunds", () => {
    it("narrows by status and initiator, ignoring omitted criteria", () => {
      const refunds = [
        sampleRefund,
        {
          ...sampleRefund,
          id: "rfd-2050",
          status: "completed",
          initiatedBy: { type: "system", label: "Auto-refund" },
          requestedAt: "2026-08-18T14:40:00.000Z",
        },
      ];

      expect(filterRefunds(refunds)).toHaveLength(2);
      expect(filterRefunds(refunds, { status: "failed" }).map((r) => r.id)).toEqual(["rfd-2051"]);
      expect(filterRefunds(refunds, { initiator: "system" }).map((r) => r.id)).toEqual([
        "rfd-2050",
      ]);
    });

    it("applies an inclusive requested-date range", () => {
      const refunds = [
        sampleRefund, // 2026-08-20
        {
          ...sampleRefund,
          id: "rfd-2048",
          requestedAt: "2026-08-24T16:30:00.000Z",
        },
      ];

      const result = filterRefunds(refunds, {
        from: "2026-08-20",
        to: "2026-08-21",
      });

      expect(result.map((r) => r.id)).toEqual(["rfd-2051"]);
    });
  });
});
