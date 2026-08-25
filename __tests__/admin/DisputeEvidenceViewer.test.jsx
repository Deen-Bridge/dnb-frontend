import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DisputeEvidenceViewer from "@/components/admin/DisputeEvidenceViewer";
import DisputeEvidenceUpload from "@/components/admin/DisputeEvidenceUpload";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const serviceMocks = vi.hoisted(() => ({
  fetchDisputeEvidenceSignedUrl: vi.fn(),
  uploadAdminDisputeEvidence: vi.fn(),
}));

vi.mock("@/lib/actions/admin-disputes", () => ({
  fetchDisputeEvidenceSignedUrl: serviceMocks.fetchDisputeEvidenceSignedUrl,
  uploadAdminDisputeEvidence: serviceMocks.uploadAdminDisputeEvidence,
}));

const SAMPLE_IMAGE_EVIDENCE = {
  id: "ev_img_1",
  fileName: "screenshot_receipt.png",
  fileType: "image/png",
  uploadedAt: "2026-08-25T12:00:00.000Z",
  senderRole: "buyer",
  note: "Receipt of double charge",
  signedUrl: "https://example.com/signed/screenshot_receipt.png",
  expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
};

const SAMPLE_PDF_EVIDENCE = {
  id: "ev_pdf_1",
  fileName: "agreement.pdf",
  fileType: "application/pdf",
  uploadedAt: "2026-08-25T14:00:00.000Z",
  senderRole: "educator",
  note: "Signed terms of service",
  signedUrl: "https://example.com/signed/agreement.pdf",
  expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  serviceMocks.fetchDisputeEvidenceSignedUrl.mockResolvedValue({
    success: true,
    signedUrl: "https://example.com/signed/fetched.png",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
});

describe("DisputeEvidenceViewer Component", () => {
  it("renders image lightbox mode for image evidence", async () => {
    render(
      <DisputeEvidenceViewer
        disputeId="dsp_001"
        evidence={SAMPLE_IMAGE_EVIDENCE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(await screen.findByText("screenshot_receipt.png")).toBeInTheDocument();
    expect(screen.getByText("Expiring URL")).toBeInTheDocument();
    expect(screen.getByText("Receipt of double charge")).toBeInTheDocument();

    const image = screen.getByAltText("screenshot_receipt.png");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", SAMPLE_IMAGE_EVIDENCE.signedUrl);

    // Test Lightbox controls: Zoom In / Zoom Out / Rotate
    const zoomInBtn = screen.getByTitle("Zoom In");
    fireEvent.click(zoomInBtn);

    const zoomOutBtn = screen.getByTitle("Zoom Out");
    fireEvent.click(zoomOutBtn);

    const rotateBtn = screen.getByTitle("Rotate 90 degrees");
    fireEvent.click(rotateBtn);
  });

  it("renders PDF inline viewer for PDF evidence", async () => {
    render(
      <DisputeEvidenceViewer
        disputeId="dsp_001"
        evidence={SAMPLE_PDF_EVIDENCE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(await screen.findByText("agreement.pdf")).toBeInTheDocument();
    expect(screen.getByTitle("agreement.pdf")).toHaveAttribute("src", SAMPLE_PDF_EVIDENCE.signedUrl);
  });

  it("refreshes expiring signed URL on clicking refresh button", async () => {
    render(
      <DisputeEvidenceViewer
        disputeId="dsp_001"
        evidence={SAMPLE_IMAGE_EVIDENCE}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await screen.findByText("screenshot_receipt.png");

    const refreshBtn = screen.getByTitle("Refresh expiring URL");
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(serviceMocks.fetchDisputeEvidenceSignedUrl).toHaveBeenCalledWith("dsp_001", "ev_img_1");
    });
  });
});

describe("DisputeEvidenceUpload Component", () => {
  it("renders admin upload component and handles submission", async () => {
    serviceMocks.uploadAdminDisputeEvidence.mockResolvedValueOnce({
      success: true,
      evidence: {
        id: "ev_new",
        fileName: "admin_notes.txt",
        uploadedAt: new Date().toISOString(),
        senderRole: "admin",
        note: "Reviewed transaction logs",
      },
    });

    const handleSuccess = vi.fn();
    render(<DisputeEvidenceUpload disputeId="dsp_001" onUploadSuccess={handleSuccess} />);

    expect(screen.getByText("Attach Admin Evidence & Notes")).toBeInTheDocument();

    const noteInput = screen.getByPlaceholderText(/Provide context or findings/i);
    fireEvent.change(noteInput, { target: { value: "Reviewed transaction logs" } });

    const submitBtn = screen.getByRole("button", { name: /Attach Evidence/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(serviceMocks.uploadAdminDisputeEvidence).toHaveBeenCalledWith(
        "dsp_001",
        expect.objectContaining({
          note: "Reviewed transaction logs",
          senderRole: "admin",
        })
      );
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
