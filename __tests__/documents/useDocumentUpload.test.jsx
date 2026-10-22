/**
 * useDocumentUpload hook — unit tests (issue #528)
 * ------------------------------------------------
 * Drives the hook directly with renderHook. Mocked boundaries:
 *
 *   @/lib/actions/educators/uploadDocument   — every network call (upload target,
 *                                              signed PUT, finalize, status, delete)
 *   @/lib/verification/documents/fileSignature — magic-byte sniffing (File/Blob
 *                                              byte reads are not available in jsdom)
 *   URL.createObjectURL / URL.revokeObjectURL — object URLs (not implemented in jsdom)
 *
 * The real validation policy (type / size / empty checks) runs unmocked.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/lib/actions/educators/uploadDocument", () => ({
  DOCUMENT_STATUS: {
    SCAN_PENDING: "scan_pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
  },
  isTerminalStatus: (status) => status === "accepted" || status === "rejected",
  requestUploadTarget: vi.fn(),
  uploadToSignedTarget: vi.fn(),
  finalizeUpload: vi.fn(),
  fetchDocumentStatus: vi.fn(),
  removeDocument: vi.fn(),
}));

vi.mock("@/lib/verification/documents/fileSignature", () => ({
  inspectFileSignature: vi.fn(),
}));

import {
  requestUploadTarget,
  uploadToSignedTarget,
  finalizeUpload,
  fetchDocumentStatus,
  removeDocument as removeDocumentRequest,
} from "@/lib/actions/educators/uploadDocument";
import { inspectFileSignature } from "@/lib/verification/documents/fileSignature";
import { useDocumentUpload, SLOT_STATE } from "@/hooks/useDocumentUpload";

const DOC_TYPE = "government_id";
const DOCUMENT_ID = "doc-123";
const TARGET = {
  documentId: DOCUMENT_ID,
  uploadUrl: "https://storage.example.test/signed-put",
  method: "PUT",
  headers: { "Content-Type": "application/pdf" },
  expiresAt: null,
};

function makePdf(name = "id.pdf") {
  return new File(["%PDF-1.4 test body"], name, { type: "application/pdf" });
}

function makeFileWithSize(file, size) {
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("useDocumentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inspectFileSignature.mockResolvedValue({
      detectedMime: "application/pdf",
      hostileLabel: null,
    });
    requestUploadTarget.mockResolvedValue(TARGET);
    uploadToSignedTarget.mockResolvedValue(undefined);
    finalizeUpload.mockResolvedValue({
      documentId: DOCUMENT_ID,
      documentType: DOC_TYPE,
      status: "accepted",
      filename: "id.pdf",
      uploadedAt: "2026-10-01T00:00:00Z",
      scanMessage: null,
    });
    fetchDocumentStatus.mockResolvedValue({
      documentId: DOCUMENT_ID,
      status: "accepted",
      scanMessage: null,
    });
    removeDocumentRequest.mockResolvedValue(undefined);

    globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-preview");
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it("starts idle with no slots and an empty slot for any document type", () => {
    const { result } = renderHook(() => useDocumentUpload());

    expect(result.current.slots).toEqual({});

    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.state).toBe(SLOT_STATE.EMPTY);
    expect(slot.progress).toBe(0);
    expect(slot.error).toBeNull();
    expect(slot.filename).toBeNull();
    expect(slot.reference).toBeNull();
  });

  it("uploads a valid file end to end and marks the slot accepted", async () => {
    const { result } = renderHook(() => useDocumentUpload());
    const file = makePdf();

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, file);
    });

    expect(outcome.ok).toBe(true);
    expect(outcome.reference).toEqual(
      expect.objectContaining({ documentId: DOCUMENT_ID, status: "accepted" })
    );

    expect(requestUploadTarget).toHaveBeenCalledWith({
      documentType: DOC_TYPE,
      filename: "id.pdf",
      contentType: "application/pdf",
      size: file.size,
    });
    expect(uploadToSignedTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadUrl: TARGET.uploadUrl,
        method: "PUT",
        file,
      })
    );
    expect(finalizeUpload).toHaveBeenCalledWith({
      documentId: DOCUMENT_ID,
      documentType: DOC_TYPE,
    });

    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.state).toBe(SLOT_STATE.ACCEPTED);
    expect(slot.progress).toBe(100);
    expect(slot.filename).toBe("id.pdf");
    expect(slot.error).toBeNull();
    expect(slot.reference).toEqual(
      expect.objectContaining({ documentId: DOCUMENT_ID, status: "accepted" })
    );
    // Terminal status from finalize means no polling is needed.
    expect(fetchDocumentStatus).not.toHaveBeenCalled();
  });

  it("keeps polling while the scan is pending and resolves when it is accepted", async () => {
    finalizeUpload.mockResolvedValueOnce({
      documentId: DOCUMENT_ID,
      documentType: DOC_TYPE,
      status: "scan_pending",
      filename: "id.pdf",
      uploadedAt: null,
      scanMessage: null,
    });
    fetchDocumentStatus
      .mockResolvedValueOnce({ documentId: DOCUMENT_ID, status: "scan_pending", scanMessage: null })
      .mockResolvedValueOnce({ documentId: DOCUMENT_ID, status: "accepted", scanMessage: "clean" });

    const { result } = renderHook(() =>
      useDocumentUpload({ pollIntervalMs: 5, maxPollAttempts: 5 })
    );

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, makePdf());
    });

    expect(result.current.getSlot(DOC_TYPE).state).toBe(SLOT_STATE.SCANNING);

    await waitFor(() => {
      expect(result.current.getSlot(DOC_TYPE).state).toBe(SLOT_STATE.ACCEPTED);
    });
    expect(fetchDocumentStatus).toHaveBeenCalledWith(DOCUMENT_ID);
  });

  it("marks the slot rejected with the scan message when the scan rejects the file", async () => {
    finalizeUpload.mockResolvedValueOnce({
      documentId: DOCUMENT_ID,
      documentType: DOC_TYPE,
      status: "rejected",
      filename: "id.pdf",
      uploadedAt: null,
      scanMessage: "Malware detected",
    });

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, makePdf());
    });

    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.state).toBe(SLOT_STATE.REJECTED);
    expect(slot.scanMessage).toBe("Malware detected");
  });

  it("reports an upload error with the server message and does not finalize", async () => {
    uploadToSignedTarget.mockRejectedValueOnce(new Error("Network down"));

    const { result } = renderHook(() => useDocumentUpload());

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, makePdf());
    });

    expect(outcome).toEqual({ ok: false, reason: "upload_failed" });
    expect(finalizeUpload).not.toHaveBeenCalled();

    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.state).toBe(SLOT_STATE.ERROR);
    expect(slot.error).toBe("Network down");
    expect(slot.errorReason).toBe("upload_failed");
    expect(slot.reference).toBeNull();
  });

  it("falls back to a generic message when the upload error has no message", async () => {
    requestUploadTarget.mockRejectedValueOnce({});

    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, makePdf());
    });

    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.state).toBe(SLOT_STATE.ERROR);
    expect(slot.error).toBe("Upload failed");
  });

  it("treats a cancelled upload (ERR_CANCELED) as cancelled, not as an error", async () => {
    const cancelled = Object.assign(new Error("canceled"), { code: "ERR_CANCELED" });
    uploadToSignedTarget.mockRejectedValueOnce(cancelled);

    const { result } = renderHook(() => useDocumentUpload());

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, makePdf());
    });

    expect(outcome).toEqual({ ok: false, reason: "cancelled" });
    expect(result.current.getSlot(DOC_TYPE).state).not.toBe(SLOT_STATE.ERROR);
  });

  it("rejects a disallowed file type before any network request", async () => {
    const { result } = renderHook(() => useDocumentUpload());
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, file);
    });

    expect(outcome.ok).toBe(false);
    expect(outcome.reason).toBe("type_not_allowed");
    expect(requestUploadTarget).not.toHaveBeenCalled();

    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.state).toBe(SLOT_STATE.ERROR);
    expect(slot.errorReason).toBe("type_not_allowed");
    expect(slot.error).toMatch(/isn't accepted/);
  });

  it("rejects a file larger than the 10 MB limit before any network request", async () => {
    const { result } = renderHook(() => useDocumentUpload());
    const file = makeFileWithSize(makePdf("huge.pdf"), 11 * 1024 * 1024);

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, file);
    });

    expect(outcome).toEqual({ ok: false, reason: "too_large" });
    expect(requestUploadTarget).not.toHaveBeenCalled();
    expect(result.current.getSlot(DOC_TYPE).error).toMatch(/The limit is 10 MB/);
  });

  it("rejects an empty file before any network request", async () => {
    const { result } = renderHook(() => useDocumentUpload());
    const file = new File([], "empty.pdf", { type: "application/pdf" });

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, file);
    });

    expect(outcome).toEqual({ ok: false, reason: "empty" });
    expect(requestUploadTarget).not.toHaveBeenCalled();
    expect(result.current.getSlot(DOC_TYPE).error).toBe("That file is empty.");
  });

  it("rejects a file whose contents do not match its declared type", async () => {
    inspectFileSignature.mockResolvedValueOnce({
      detectedMime: "image/png",
      hostileLabel: null,
    });

    const { result } = renderHook(() => useDocumentUpload());

    let outcome;
    await act(async () => {
      outcome = await result.current.uploadDocument(DOC_TYPE, makePdf("fake.pdf"));
    });

    expect(outcome).toEqual({ ok: false, reason: "signature_mismatch" });
    expect(requestUploadTarget).not.toHaveBeenCalled();
    expect(result.current.getSlot(DOC_TYPE).errorReason).toBe("signature_mismatch");
  });

  it("removes a previously uploaded document and clears the slot", async () => {
    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, makePdf());
    });
    expect(result.current.slots[DOC_TYPE]).toBeDefined();

    let removal;
    await act(async () => {
      removal = await result.current.removeDocument(DOC_TYPE);
    });

    expect(removal).toEqual({ ok: true });
    expect(removeDocumentRequest).toHaveBeenCalledWith(DOCUMENT_ID);
    expect(result.current.slots[DOC_TYPE]).toBeUndefined();
    expect(result.current.getSlot(DOC_TYPE).state).toBe(SLOT_STATE.EMPTY);
  });

  it("keeps the slot and reports remove_failed when deleting the document fails", async () => {
    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, makePdf());
    });

    removeDocumentRequest.mockRejectedValueOnce(new Error("Server unavailable"));

    let removal;
    await act(async () => {
      removal = await result.current.removeDocument(DOC_TYPE);
    });

    expect(removal).toEqual({ ok: false });
    const slot = result.current.getSlot(DOC_TYPE);
    expect(slot.error).toBe("Server unavailable");
    expect(slot.errorReason).toBe("remove_failed");
    expect(slot.reference?.documentId).toBe(DOCUMENT_ID);
  });

  it("replaces a document by removing the old copy first, then uploading the new file", async () => {
    const { result } = renderHook(() => useDocumentUpload());

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, makePdf("first.pdf"));
    });

    requestUploadTarget.mockClear();
    removeDocumentRequest.mockClear();

    let outcome;
    await act(async () => {
      outcome = await result.current.replaceDocument(DOC_TYPE, makePdf("second.pdf"));
    });

    expect(removeDocumentRequest).toHaveBeenCalledWith(DOCUMENT_ID);
    expect(requestUploadTarget).toHaveBeenCalledWith(
      expect.objectContaining({ filename: "second.pdf" })
    );
    expect(outcome.ok).toBe(true);
    expect(result.current.getSlot(DOC_TYPE).state).toBe(SLOT_STATE.ACCEPTED);
  });

  it("reset clears all slots and revokes the preview object URL of an image upload", async () => {
    inspectFileSignature.mockResolvedValueOnce({
      detectedMime: "image/png",
      hostileLabel: null,
    });
    const { result } = renderHook(() => useDocumentUpload());
    const image = new File(["\x89PNG"], "id.png", { type: "image/png" });

    await act(async () => {
      await result.current.uploadDocument(DOC_TYPE, image);
    });
    expect(result.current.slots[DOC_TYPE]).toBeDefined();
    expect(URL.createObjectURL).toHaveBeenCalledWith(image);

    act(() => {
      result.current.reset();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-preview");
    expect(result.current.slots).toEqual({});
    expect(result.current.getSlot(DOC_TYPE).state).toBe(SLOT_STATE.EMPTY);
  });
});
