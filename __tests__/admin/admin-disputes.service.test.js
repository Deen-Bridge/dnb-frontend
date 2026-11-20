import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchDisputeEvidenceSignedUrl,
  uploadAdminDisputeEvidence,
} from "@/lib/actions/admin-disputes";
import axiosInstance from "@/lib/config/axios.config";

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    post: vi.fn(),
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

  it("fetchDisputeEvidenceSignedUrl falls back to temporary signed URL when endpoint 404s", async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await fetchDisputeEvidenceSignedUrl("dsp_001", "ev_001");

    expect(result.success).toBe(true);
    expect(result.signedUrl).toContain("/api/admin/payments/disputes/dsp_001/evidence/ev_001/file");
    expect(result.expiresAt).toBeDefined();
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
});
