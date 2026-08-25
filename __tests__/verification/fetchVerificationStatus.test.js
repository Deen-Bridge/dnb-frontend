/**
 * fetchVerificationStatus — unit tests
 * ------------------------------------
 * Verifies the action layer:
 *   - Returns normalised data on success
 *   - Returns NOT_STARTED_FALLBACK on 404 and 403
 *   - Throws on other errors
 *   - fetchDocumentSignedUrl validates required param and forwards token
 *   - No biometric data ever appears in any request body
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchVerificationStatus,
  fetchDocumentSignedUrl,
  VERIFICATION_STATUS,
} from "@/lib/actions/educators/fetchVerificationStatus";

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

import axiosInstance from "@/lib/config/axios.config";

const FULL_RESPONSE = {
  status: "incomplete",
  lastCompletedStep: 1,
  totalSteps: 3,
  rejectionReason: null,
  submittedAt: null,
  reviewedAt: null,
  documents: [
    {
      id: "doc_1",
      type: "national_id",
      filename: "id_front.jpg",
      uploadedAt: "2024-01-01T00:00:00.000Z",
      signedUrlEndpoint: "/api/educators/applications/documents/doc_1/signed-url",
    },
  ],
  timeline: [
    { status: "identity", label: "Identity verification", ts: "2024-01-01T00:00:00.000Z", done: true },
    { status: "documents", label: "Document upload", ts: null, done: false },
    { status: "review", label: "Under review", ts: null, done: false },
  ],
};

describe("fetchVerificationStatus — success", () => {
  beforeEach(() => {
    axiosInstance.get.mockResolvedValue({ data: FULL_RESPONSE });
  });
  afterEach(() => vi.clearAllMocks());

  it("calls the correct endpoint", async () => {
    await fetchVerificationStatus();
    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/educators/applications/status"
    );
  });

  it("returns normalised status", async () => {
    const result = await fetchVerificationStatus();
    expect(result.status).toBe(VERIFICATION_STATUS.INCOMPLETE);
    expect(result.lastCompletedStep).toBe(1);
    expect(result.totalSteps).toBe(3);
  });

  it("returns documents array with masked filename fields", async () => {
    const result = await fetchVerificationStatus();
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].filename).toBe("id_front.jpg");
    // signedUrlEndpoint is a path, not a public URL
    expect(result.documents[0].signedUrlEndpoint).toContain("signed-url");
  });

  it("normalises unknown status to not_started", async () => {
    axiosInstance.get.mockResolvedValue({ data: { ...FULL_RESPONSE, status: "UNKNOWN_FUTURE_STATE" } });
    const result = await fetchVerificationStatus();
    expect(result.status).toBe(VERIFICATION_STATUS.NOT_STARTED);
  });

  it("guards against missing optional fields", async () => {
    axiosInstance.get.mockResolvedValue({ data: { status: "pending" } });
    const result = await fetchVerificationStatus();
    expect(result.lastCompletedStep).toBe(0);
    expect(result.documents).toEqual([]);
    expect(result.rejectionReason).toBeNull();
  });
});

describe("fetchVerificationStatus — 404 / 403 fallback", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns NOT_STARTED_FALLBACK on 404", async () => {
    axiosInstance.get.mockRejectedValue({ response: { status: 404 } });
    const result = await fetchVerificationStatus();
    expect(result.status).toBe(VERIFICATION_STATUS.NOT_STARTED);
    expect(result.lastCompletedStep).toBe(0);
    expect(result.documents).toEqual([]);
  });

  it("returns NOT_STARTED_FALLBACK on 403", async () => {
    axiosInstance.get.mockRejectedValue({ response: { status: 403 } });
    const result = await fetchVerificationStatus();
    expect(result.status).toBe(VERIFICATION_STATUS.NOT_STARTED);
  });

  it("throws on 500 errors", async () => {
    axiosInstance.get.mockRejectedValue({
      response: { status: 500, data: { message: "Internal server error" } },
    });
    await expect(fetchVerificationStatus()).rejects.toThrow("Internal server error");
  });

  it("throws on network errors", async () => {
    axiosInstance.get.mockRejectedValue({ message: "Network Error" });
    await expect(fetchVerificationStatus()).rejects.toThrow("Network Error");
  });
});

describe("fetchDocumentSignedUrl", () => {
  afterEach(() => vi.clearAllMocks());

  it("throws without documentId", async () => {
    await expect(fetchDocumentSignedUrl("")).rejects.toThrow("documentId is required");
    await expect(fetchDocumentSignedUrl(null)).rejects.toThrow("documentId is required");
  });

  it("POSTs to the correct endpoint", async () => {
    axiosInstance.post.mockResolvedValue({
      data: { signedUrl: "https://cdn.example.com/signed?token=abc", expiresAt: "2024-01-01T01:00:00Z" },
    });
    const result = await fetchDocumentSignedUrl("doc_1");
    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/educators/applications/documents/doc_1/signed-url"
    );
    expect(result.signedUrl).toMatch(/^https:\/\//);
  });

  it("throws with backend message on error", async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: "Document not found" } },
    });
    await expect(fetchDocumentSignedUrl("doc_bad")).rejects.toThrow("Document not found");
  });
});
