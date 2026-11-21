import { describe, expect, it, vi, beforeEach } from "vitest";
import axiosInstance from "@/lib/config/axios.config";
import { listPrivacyRequests, processPrivacyRequest } from "@/lib/actions/admin-privacy";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("admin privacy service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the authoritative export queue with pagination and filtering", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: {
        requests: [{ id: "exp-1", status: "pending" }],
        pagination: { page: 2, limit: 10, total: 11, hasNextPage: false },
      },
    });

    const result = await listPrivacyRequests("export", {
      page: 2,
      limit: 10,
      status: "pending",
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/admin/privacy/exports", {
      params: { page: 2, limit: 10, status: "pending" },
    });
    expect(result.requests[0].id).toBe("exp-1");
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it("surfaces authorization failures instead of showing a false empty queue", async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { status: 403, data: { message: "Admin authorization required" } },
    });

    await expect(listPrivacyRequests("deletion")).rejects.toThrow(
      "Admin authorization required"
    );
  });

  it("processes a request with an explicit idempotency key and retry policy", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { request: { id: "del-1", status: "completed", auditEventId: "audit-1" } },
    });

    const result = await processPrivacyRequest("deletion", "del-1");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/admin/privacy/deletions/del-1/process",
      {},
      {
        headers: { "Idempotency-Key": "deletion:del-1" },
        retryOnServerError: true,
      }
    );
    expect(result.status).toBe("completed");
  });

  it("does not hide a concurrent-processing conflict", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { status: 409, data: { message: "Request is already processing" } },
    });

    await expect(processPrivacyRequest("export", "exp-1")).rejects.toThrow(
      "Request is already processing"
    );
  });
});
