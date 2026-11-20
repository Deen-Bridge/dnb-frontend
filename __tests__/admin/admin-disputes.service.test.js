import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchDisputeEvidenceSignedUrl,
  listAdminDisputes,
  resolveAdminDispute,
  uploadAdminDisputeEvidence,
} from "@/lib/actions/admin-disputes";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("admin-disputes service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetchDisputeEvidenceSignedUrl fetches signed URL from endpoint", async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        success: true,
        signedUrl: "https://example.com/signed/evidence_001.png?exp=123",
        expiresAt: "2026-08-25T23:00:00.000Z",
      },
    });

    const result = await fetchDisputeEvidenceSignedUrl("dsp_001", "ev_001");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/admin/payments/disputes/dsp_001/evidence/ev_001/signed-url"
    );
    expect(result.success).toBe(true);
    expect(result.signedUrl).toContain("https://example.com/signed/");
  });

  it("reports signed URL endpoint failures instead of fabricating evidence URLs", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await fetchDisputeEvidenceSignedUrl("dsp_001", "ev_001");

    expect(result).toEqual({
      success: false,
      signedUrl: "",
      expiresAt: "",
      error: "Failed to fetch signed URL",
    });
  });

  it("loads disputes with server-side pagination and status", async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: { success: true, disputes: [{ _id: "dsp_1" }], pagination: { page: 2, limit: 10, total: 11, pages: 2 } },
    });

    const result = await listAdminDisputes({ page: 2, limit: 10, status: "open" });

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/admin/payments/disputes", {
      params: { page: 2, limit: 10, status: "open" },
    });
    expect(result.disputes).toHaveLength(1);
    expect(result.pagination.pages).toBe(2);
  });

  it("resolves a dispute with an idempotency key", async () => {
    axiosInstance.patch.mockResolvedValueOnce({ data: { success: true, dispute: { id: "dsp_1" } } });

    await resolveAdminDispute("dsp_1", "approved", "Refund approved");

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      "/api/admin/payments/disputes/dsp_1/resolution",
      { decision: "approved", notes: "Refund approved" },
      { headers: { "Idempotency-Key": "admin-dispute-resolution:dsp_1:approved" } }
    );
  });

  it("uploadAdminDisputeEvidence validates file policy before posting", async () => {
    const invalidFile = new File(["fake exe binary content"], "virus.exe", {
      type: "application/x-msdownload",
    });

    const result = await uploadAdminDisputeEvidence("dsp_001", {
      file: invalidFile,
      note: "Test note",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("isn't accepted");
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("uploadAdminDisputeEvidence posts valid evidence file", async () => {
    // Magic bytes for PDF (%PDF)
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
    const validPdfFile = new File([pdfBytes], "document.pdf", {
      type: "application/pdf",
    });

    axiosInstance.post.mockResolvedValueOnce({
      data: {
        success: true,
        evidence: {
          id: "ev_admin_123",
          fileName: "document.pdf",
          fileType: "application/pdf",
          uploadedAt: "2026-08-25T22:00:00.000Z",
          note: "Official proof document",
          senderRole: "admin",
          signedUrl: "https://example.com/signed/document.pdf",
        },
      },
    });

    const result = await uploadAdminDisputeEvidence("dsp_001", {
      file: validPdfFile,
      note: "Official proof document",
    });

    expect(result.success).toBe(true);
    expect(result.evidence.fileName).toBe("document.pdf");
  });

  it("does not report a successful upload when the endpoint is unavailable", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await uploadAdminDisputeEvidence("dsp_001", {
      note: "Admin review note",
    });

    expect(result).toEqual({
      success: false,
      error: "Failed to upload evidence",
    });
  });
});
