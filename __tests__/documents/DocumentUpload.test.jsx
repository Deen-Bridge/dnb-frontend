/**
 * DocumentUpload — real-path integration tests (issue #172)
 * ---------------------------------------------------------
 * These drive the actual component → useDocumentUpload → uploadDocument
 * action chain. Only the two HTTP clients are mocked:
 *
 *   @/lib/config/axios.config — our API (signed-target, complete, status, delete)
 *   axios                      — the raw client used for the signed PUT
 *
 * Everything between the drop event and those calls is the real code path.
 *
 * Covers the acceptance criteria:
 *   • invalid type/size/magic-byte rejected before upload, with a visible reason
 *   • no public asset URL is produced or stored
 *   • replace and remove update the referenced object
 *   • drag/drop and camera capture both produce a valid upload
 *   • progress renders; "scan pending" resolves to accepted / rejected
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// ── HTTP mocks ─────────────────────────────────────────────────────────────

vi.mock("@/lib/config/axios.config", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    request: vi.fn(),
    isCancel: () => false,
  },
}));

import axiosInstance from "@/lib/config/axios.config";
import axios from "axios";
import DocumentUpload from "@/components/organisms/educator-onboarding/DocumentUpload";
import { DOCUMENT_TYPES } from "@/lib/verification/documents/policy";

// ── Fixtures ───────────────────────────────────────────────────────────────

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d];
const JPEG_MAGIC = [0xff, 0xd8, 0xff, 0xe0];
const EXE_MAGIC = [0x4d, 0x5a, 0x90, 0x00];

function makeFile(magic, { name, type, size = 1024 }) {
  const bytes = new Uint8Array(size);
  bytes.set(magic, 0);
  return new File([bytes], name, { type });
}

const ID = DOCUMENT_TYPES.GOVERNMENT_ID;

const SIGNED_TARGET = {
  documentId: "doc_abc123",
  uploadUrl:
    "https://private-storage.example.com/kyc/doc_abc123?X-Amz-Signature=deadbeef&X-Amz-Expires=300",
  method: "PUT",
  headers: { "Content-Type": "application/pdf" },
  expiresAt: "2026-08-20T18:00:00.000Z",
};

/** Wire the happy-path API responses. `finalStatus` drives the scan result. */
function mockHappyPath({ finalStatus = "scan_pending", pollStatus } = {}) {
  axiosInstance.post.mockImplementation((url) => {
    if (url.endsWith("/upload-url")) {
      return Promise.resolve({ data: SIGNED_TARGET });
    }
    if (url.endsWith("/complete")) {
      return Promise.resolve({
        data: {
          documentId: SIGNED_TARGET.documentId,
          documentType: ID,
          status: finalStatus,
          filename: "passport.pdf",
          uploadedAt: "2026-08-20T17:00:00.000Z",
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  axiosInstance.get.mockResolvedValue({
    data: {
      documentId: SIGNED_TARGET.documentId,
      status: pollStatus ?? "accepted",
      scanMessage: null,
    },
  });

  axiosInstance.delete.mockResolvedValue({ data: { success: true } });

  axios.request.mockImplementation(async (config) => {
    // Emit progress the way a real upload would.
    config.onUploadProgress?.({ loaded: 512, total: 1024 });
    config.onUploadProgress?.({ loaded: 1024, total: 1024 });
    return { data: {}, status: 200 };
  });
}

/** Only the government-ID slot, to keep assertions unambiguous. */
const SINGLE_SLOT = [
  {
    type: DOCUMENT_TYPES.GOVERNMENT_ID,
    label: "Government ID",
    description: "Passport or national ID.",
    required: true,
    allowCamera: true,
  },
];

function renderUpload(props = {}) {
  return render(
    <DocumentUpload
      slots={SINGLE_SLOT}
      uploadOptions={{ pollIntervalMs: 5, maxPollAttempts: 5 }}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom has no object-URL implementation.
  global.URL.createObjectURL = vi.fn(() => "blob:mock-preview");
  global.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------

describe("rejection before any network call", () => {
  it("rejects a renamed .exe declaring itself a PDF, and uploads nothing", async () => {
    mockHappyPath();
    renderUpload();

    const disguised = makeFile(EXE_MAGIC, {
      name: "passport.pdf",
      type: "application/pdf",
    });

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: { files: [disguised] },
    });

    // Visible, specific reason.
    const error = await screen.findByTestId(`error-${ID}`);
    expect(error).toHaveTextContent(/Windows executable/i);

    // Nothing left the browser: no signed target requested, no bytes sent.
    expect(axiosInstance.post).not.toHaveBeenCalled();
    expect(axios.request).not.toHaveBeenCalled();
  });

  it("rejects an oversized PDF without requesting an upload target", async () => {
    mockHappyPath();
    renderUpload();

    const huge = makeFile(PDF_MAGIC, {
      name: "scan.pdf",
      type: "application/pdf",
      size: 11 * 1024 * 1024,
    });

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: { files: [huge] },
    });

    expect(await screen.findByTestId(`error-${ID}`)).toHaveTextContent(
      /limit is 10 MB/i
    );
    expect(axiosInstance.post).not.toHaveBeenCalled();
    expect(axios.request).not.toHaveBeenCalled();
  });

  it("rejects a disallowed type without requesting an upload target", async () => {
    mockHappyPath();
    renderUpload();

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [makeFile(PDF_MAGIC, { name: "notes.txt", type: "text/plain" })],
      },
    });

    expect(await screen.findByTestId(`error-${ID}`)).toBeInTheDocument();
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------

describe("drag/drop upload", () => {
  it("uploads a valid PDF through the signed URL and reaches scan pending", async () => {
    mockHappyPath({ finalStatus: "scan_pending", pollStatus: "scan_pending" });
    renderUpload();

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "passport.pdf", type: "application/pdf" }),
        ],
      },
    });

    await screen.findByTestId(`scan-pending-${ID}`);

    // 1. Signed target requested with the VERIFIED content type.
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/educators/applications/documents/upload-url",
      expect.objectContaining({
        documentType: ID,
        filename: "passport.pdf",
        contentType: "application/pdf",
      })
    );

    // 2. Bytes went to the signed URL, not to our API.
    const uploadCall = axios.request.mock.calls[0][0];
    expect(uploadCall.url).toBe(SIGNED_TARGET.uploadUrl);
    expect(uploadCall.method).toBe("PUT");
    expect(uploadCall.withCredentials).toBe(false);
    expect(uploadCall.headers.Authorization).toBeUndefined();

    // 3. Finalised, which starts server-side scanning.
    expect(axiosInstance.post).toHaveBeenCalledWith(
      `/api/educators/applications/documents/${SIGNED_TARGET.documentId}/complete`,
      expect.objectContaining({ documentType: ID })
    );
  });

  it("renders upload progress while the bytes are in flight", async () => {
    let releaseUpload;
    mockHappyPath();
    axios.request.mockImplementation(
      (config) =>
        new Promise((resolve) => {
          config.onUploadProgress?.({ loaded: 300, total: 1000 });
          releaseUpload = () => resolve({ data: {}, status: 200 });
        })
    );

    renderUpload();

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "passport.pdf", type: "application/pdf" }),
        ],
      },
    });

    const bar = await screen.findByTestId(`progress-${ID}`);
    await waitFor(() => expect(bar).toHaveAttribute("aria-valuenow", "30"));

    await act(async () => {
      releaseUpload();
    });
  });
});

describe("camera capture", () => {
  it("exposes a capture-enabled input and uploads the photo it produces", async () => {
    mockHappyPath({ finalStatus: "accepted" });
    renderUpload();

    const cameraInput = screen.getByTestId(`camera-input-${ID}`);
    expect(cameraInput).toHaveAttribute("capture", "environment");
    expect(cameraInput).toHaveAttribute("accept", "image/*");

    const photo = makeFile(JPEG_MAGIC, {
      name: "id-photo.jpg",
      type: "image/jpeg",
    });

    fireEvent.change(cameraInput, { target: { files: [photo] } });

    await waitFor(() =>
      expect(screen.getByTestId("slot-status")).toHaveAttribute(
        "data-state",
        "accepted"
      )
    );

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/educators/applications/documents/upload-url",
      expect.objectContaining({ contentType: "image/jpeg" })
    );
    expect(axios.request).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------

describe("scan pending resolves", () => {
  it("moves from scan pending to accepted when the scan clears", async () => {
    mockHappyPath({ finalStatus: "scan_pending", pollStatus: "accepted" });
    renderUpload();

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "passport.pdf", type: "application/pdf" }),
        ],
      },
    });

    await screen.findByTestId(`scan-pending-${ID}`);

    await waitFor(
      () =>
        expect(screen.getByTestId("slot-status")).toHaveAttribute(
          "data-state",
          "accepted"
        ),
      { timeout: 3000 }
    );

    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/api/educators/applications/documents/${SIGNED_TARGET.documentId}`
    );
  });

  it("moves from scan pending to rejected when the scan finds something", async () => {
    mockHappyPath({ finalStatus: "scan_pending" });
    axiosInstance.get.mockResolvedValue({
      data: {
        documentId: SIGNED_TARGET.documentId,
        status: "infected",
        scanMessage: "Malware detected in this file.",
      },
    });

    renderUpload();

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "passport.pdf", type: "application/pdf" }),
        ],
      },
    });

    await waitFor(
      () =>
        expect(screen.getByTestId("slot-status")).toHaveAttribute(
          "data-state",
          "rejected"
        ),
      { timeout: 3000 }
    );

    expect(await screen.findByTestId(`error-${ID}`)).toHaveTextContent(
      "Malware detected in this file."
    );
  });
});

// ---------------------------------------------------------------------------

describe("replace and remove", () => {
  it("replace deletes the old document and reports the new reference", async () => {
    mockHappyPath({ finalStatus: "accepted" });
    const onChange = vi.fn();
    renderUpload({ onChange });

    // First upload
    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "first.pdf", type: "application/pdf" }),
        ],
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("slot-status")).toHaveAttribute(
        "data-state",
        "accepted"
      )
    );

    // Replace with a second file, via the slot's file input
    axiosInstance.post.mockImplementation((url) => {
      if (url.endsWith("/upload-url")) {
        return Promise.resolve({
          data: { ...SIGNED_TARGET, documentId: "doc_second" },
        });
      }
      if (url.endsWith("/complete")) {
        return Promise.resolve({
          data: {
            documentId: "doc_second",
            documentType: ID,
            status: "accepted",
            filename: "second.pdf",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    fireEvent.change(screen.getByTestId(`input-${ID}`), {
      target: {
        files: [
          makeFile(PDF_MAGIC, { name: "second.pdf", type: "application/pdf" }),
        ],
      },
    });

    await waitFor(() => expect(screen.getByText("second.pdf")).toBeInTheDocument());

    // The superseded document was deleted.
    expect(axiosInstance.delete).toHaveBeenCalledWith(
      `/api/educators/applications/documents/${SIGNED_TARGET.documentId}`
    );

    // The referenced object now points at the new document. Waited for rather
    // than read once: the filename renders as soon as validation starts, which
    // is before the replacement upload has finalised.
    await waitFor(() =>
      expect(onChange.mock.calls.at(-1)[0][ID].documentId).toBe("doc_second")
    );
  });

  it("remove deletes the document and clears the slot", async () => {
    mockHappyPath({ finalStatus: "accepted" });
    const onChange = vi.fn();
    renderUpload({ onChange });

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "passport.pdf", type: "application/pdf" }),
        ],
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("slot-status")).toHaveAttribute(
        "data-state",
        "accepted"
      )
    );

    fireEvent.click(screen.getByTestId(`remove-${ID}`));

    await waitFor(() =>
      expect(screen.getByTestId(`dropzone-${ID}`)).toBeInTheDocument()
    );

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      `/api/educators/applications/documents/${SIGNED_TARGET.documentId}`
    );
    expect(onChange.mock.calls.at(-1)[0]).toEqual({});
  });
});

// ---------------------------------------------------------------------------

describe("onChange reports the full reference map", () => {
  const CERT = DOCUMENT_TYPES.TEACHING_CERTIFICATE;

  const TWO_SLOTS = [
    { ...SINGLE_SLOT[0] },
    {
      type: CERT,
      label: "Teaching certificate",
      description: "Ijazah or teaching licence.",
      required: true,
      allowCamera: false,
    },
  ];

  /** Give each slot its own documentId so the map can be told apart. */
  function mockPerSlot() {
    axiosInstance.post.mockImplementation((url, body) => {
      if (url.endsWith("/upload-url")) {
        return Promise.resolve({
          data: { ...SIGNED_TARGET, documentId: `doc_${body.documentType}` },
        });
      }
      if (url.endsWith("/complete")) {
        const documentId = url.split("/documents/")[1].split("/complete")[0];
        return Promise.resolve({
          data: {
            documentId,
            documentType: body.documentType,
            status: "accepted",
          },
        });
      }
      return Promise.resolve({ data: {} });
    });
    axios.request.mockResolvedValue({ data: {}, status: 200 });
  }

  function dropInto(type, name) {
    fireEvent.drop(screen.getByTestId(`dropzone-${type}`), {
      dataTransfer: {
        files: [makeFile(PDF_MAGIC, { name, type: "application/pdf" })],
      },
    });
  }

  it("keeps earlier slots when a later slot finishes", async () => {
    mockPerSlot();
    const onChange = vi.fn();

    render(
      <DocumentUpload
        slots={TWO_SLOTS}
        uploadOptions={{ pollIntervalMs: 5, maxPollAttempts: 5 }}
        onChange={onChange}
      />
    );

    dropInto(ID, "passport.pdf");
    await waitFor(() =>
      expect(screen.getByTestId(`document-slot-${ID}`)).toHaveAttribute(
        "data-state",
        "accepted"
      )
    );

    dropInto(CERT, "ijazah.pdf");
    await waitFor(() =>
      expect(screen.getByTestId(`document-slot-${CERT}`)).toHaveAttribute(
        "data-state",
        "accepted"
      )
    );

    // The second slot completing must not drop the first slot's reference.
    const latest = onChange.mock.calls.at(-1)[0];
    expect(Object.keys(latest).sort()).toEqual([CERT, ID].sort());
    expect(latest[ID].documentId).toBe(`doc_${ID}`);
    expect(latest[CERT].documentId).toBe(`doc_${CERT}`);
  });

  it("reports the status change when a pending scan resolves", async () => {
    mockHappyPath({ finalStatus: "scan_pending", pollStatus: "accepted" });
    const onChange = vi.fn();
    renderUpload({ onChange });

    dropInto(ID, "passport.pdf");

    await waitFor(
      () =>
        expect(screen.getByTestId("slot-status")).toHaveAttribute(
          "data-state",
          "accepted"
        ),
      { timeout: 3000 }
    );

    // The parent must see the resolved status, not the stale scan_pending one.
    expect(onChange.mock.calls.at(-1)[0][ID].status).toBe("accepted");
  });
});

// ---------------------------------------------------------------------------

describe("no public asset URL is ever produced or stored", () => {
  it("never surfaces a cloudinary or other public URL, and stores only an id", async () => {
    mockHappyPath({ finalStatus: "accepted" });
    const onChange = vi.fn();
    renderUpload({ onChange });

    fireEvent.drop(screen.getByTestId(`dropzone-${ID}`), {
      dataTransfer: {
        files: [
          makeFile(PDF_MAGIC, { name: "passport.pdf", type: "application/pdf" }),
        ],
      },
    });
    await waitFor(() =>
      expect(screen.getByTestId("slot-status")).toHaveAttribute(
        "data-state",
        "accepted"
      )
    );

    // The stored reference carries an opaque id and a status — no URL field.
    // Waited for: the reference map is reported from an effect, which flushes
    // a tick after the slot's DOM state settles.
    await waitFor(() =>
      expect(onChange.mock.calls.at(-1)?.[0]?.[ID]).toEqual(
        expect.objectContaining({
          documentId: "doc_abc123",
          status: "accepted",
        })
      )
    );
    const reference = onChange.mock.calls.at(-1)[0][ID];
    expect(JSON.stringify(reference)).not.toMatch(/https?:\/\//);
    expect(reference.secure_url).toBeUndefined();
    expect(reference.url).toBeUndefined();

    // Nothing in the rendered DOM links to a remote asset. The only URL is the
    // local object URL used for the preview thumbnail.
    const html = document.body.innerHTML;
    expect(html).not.toContain("cloudinary");
    expect(html).not.toContain(SIGNED_TARGET.uploadUrl);
    expect(html).not.toMatch(/src="https?:\/\//);
  });
});
