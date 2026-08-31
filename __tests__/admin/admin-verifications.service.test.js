import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchVerificationQueue,
  fetchVerificationDetail,
  approveVerification,
  rejectVerification,
  executeSequentialBulkDecisions,
  MAX_BATCH_SIZE,
  REJECTION_REASON_CATEGORIES,
} from "@/lib/actions/admin-verifications";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/admin/audit";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/admin/audit", () => ({
  logAuditEvent: vi.fn(),
  AUDIT_ACTIONS: {
    VERIFICATION_APPROVE: "verification.approve",
    VERIFICATION_REJECT: "verification.reject",
    VERIFICATION_BULK_APPROVE: "verification.bulk_approve",
    VERIFICATION_BULK_REJECT: "verification.bulk_reject",
  },
}));

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("admin-verifications service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchVerificationQueue", () => {
    it("returns verification applications and count breakdown", async () => {
      const result = await fetchVerificationQueue();
      expect(result).toBeDefined();
      expect(Array.isArray(result.applications)).toBe(true);
      expect(result.applications.length).toBeGreaterThan(0);
      expect(result.counts).toHaveProperty("pending");
      expect(result.counts).toHaveProperty("approved");
      expect(result.counts).toHaveProperty("rejected");
    });

    it("filters by status", async () => {
      const result = await fetchVerificationQueue({ status: "pending" });
      expect(result.applications.every((a) => a.status === "pending")).toBe(true);
    });

    it("filters by search query", async () => {
      const result = await fetchVerificationQueue({ search: "Tariq" });
      expect(result.applications.some((a) => a.name.includes("Tariq"))).toBe(true);
    });
  });

  describe("approveVerification", () => {
    it("approves an application and logs an audit event", async () => {
      const result = await approveVerification("app_v01", {
        name: "Sheikh Tariq Mansoor",
        email: "tariq.mansoor@example.org",
      });

      expect(result.application.status).toBe("approved");
      expect(logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTIONS.VERIFICATION_APPROVE,
          target: expect.objectContaining({
            label: "Sheikh Tariq Mansoor",
            id: "app_v01",
          }),
        })
      );
    });
  });

  describe("rejectVerification", () => {
    it("throws an error if reasonCategory is missing", async () => {
      await expect(
        rejectVerification("app_v02", {})
      ).rejects.toThrow("A reason category is required");
    });

    it("rejects an application with reasonCategory and emits audit event", async () => {
      const result = await rejectVerification(
        "app_v02",
        {
          reasonCategory: "invalid_documents",
          notes: "Document was blurry and unreadable.",
        },
        {
          name: "Ustadha Fatima Zahra",
          email: "fatima.zahra@example.com",
        }
      );

      expect(result.application.status).toBe("rejected");
      expect(result.application.reasonCategory).toBe("invalid_documents");
      expect(logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTIONS.VERIFICATION_REJECT,
          target: expect.objectContaining({
            label: "Ustadha Fatima Zahra",
            id: "app_v02",
          }),
          metadata: expect.objectContaining({
            reasonCategory: "invalid_documents",
            notes: "Document was blurry and unreadable.",
          }),
        })
      );
    });
  });

  describe("executeSequentialBulkDecisions", () => {
    it("returns empty result for empty items array", async () => {
      const result = await executeSequentialBulkDecisions({ items: [], action: "approve" });
      expect(result.total).toBe(0);
      expect(result.succeeded).toEqual([]);
      expect(result.failed).toEqual([]);
    });

    it("requires reasonCategory for bulk reject", async () => {
      await expect(
        executeSequentialBulkDecisions({
          items: [{ id: "app_v03", name: "Dr. Bilal" }],
          action: "reject",
        })
      ).rejects.toThrow("Bulk reject requires choosing one shared reason category.");
    });

    it("executes bulk approvals sequentially and reports progress per item", async () => {
      const items = [
        { id: "app_v03", name: "Dr. Bilal", email: "bilal@example.com" },
        { id: "app_v04", name: "Imam Idris", email: "idris@example.com" },
      ];

      const progressSteps = [];
      const onProgress = vi.fn((p) => {
        progressSteps.push({ ...p });
      });

      const result = await executeSequentialBulkDecisions({
        items,
        action: "approve",
        onProgress,
      });

      expect(result.total).toBe(2);
      expect(result.succeeded.length).toBe(2);
      expect(result.failed.length).toBe(0);
      expect(onProgress).toHaveBeenCalled();
      expect(progressSteps[progressSteps.length - 1].percent).toBe(100);

      // Verify bulk audit event was emitted
      expect(logAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTIONS.VERIFICATION_BULK_APPROVE,
          metadata: expect.objectContaining({
            totalRequested: 2,
            succeededCount: 2,
            failedCount: 0,
          }),
        })
      );
    });

    it("caps batch size at MAX_BATCH_SIZE (25)", async () => {
      const largeBatch = Array.from({ length: 30 }, (_, i) => ({
        id: `app_batch_${i}`,
        name: `Educator ${i}`,
        email: `ed${i}@example.com`,
      }));

      const result = await executeSequentialBulkDecisions({
        items: largeBatch,
        action: "approve",
      });

      expect(result.total).toBe(MAX_BATCH_SIZE);
      expect(result.succeeded.length).toBe(MAX_BATCH_SIZE);
    });

    it("isolates errors so a single failed item does not abort the batch", async () => {
      // Mock axios to throw on specific item
      axiosInstance.post.mockImplementation((url) => {
        if (url.includes("fail_item")) {
          const err = new Error("Backend validation failed");
          err.response = { status: 422, data: { message: "Invalid state transition" } };
          return Promise.reject(err);
        }
        return Promise.resolve({ data: { application: { status: "approved" } } });
      });

      const items = [
        { id: "app_good_1", name: "Good One", email: "good1@example.com" },
        { id: "fail_item", name: "Bad One", email: "bad@example.com" },
        { id: "app_good_2", name: "Good Two", email: "good2@example.com" },
      ];

      const result = await executeSequentialBulkDecisions({
        items,
        action: "approve",
      });

      expect(result.total).toBe(3);
      expect(result.succeeded.length).toBe(2);
      expect(result.failed.length).toBe(1);
      expect(result.failed[0].item.id).toBe("fail_item");
    });
  });
});
