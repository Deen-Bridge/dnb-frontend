/**
 * Verification-document upload
 * ----------------------------
 * Uploads educator KYC documents (government ID, teaching certificate) to
 * private storage via a short-lived signed URL, so that no publicly reachable
 * asset URL is ever produced or stored.
 *
 * Why not the existing Cloudinary helper
 * --------------------------------------
 * lib/utils/cloudinaryUpload.js posts to an UNSIGNED upload preset and returns
 * `result.secure_url` — a permanently public asset URL. That is fine for a
 * course thumbnail and unacceptable for a passport scan. Identity documents
 * must never travel through that path; __tests__/documents/noPublicUrl.test.js
 * asserts this module never imports it.
 *
 * Flow (contract agreed with the educator-verification pipeline, dnb-backend#92)
 * ------------------------------------------------------------------------------
 *   1. POST /api/educators/applications/documents/upload-url
 *        → { documentId, uploadUrl, method, headers, expiresAt }
 *      The signed URL is short-lived and write-only.
 *
 *   2. PUT/POST the raw bytes to `uploadUrl`.
 *      This request goes to the storage provider, NOT to our API, so it is
 *      sent with a bare axios client — our Authorization header must never
 *      leak to a third-party origin.
 *
 *   3. POST /api/educators/applications/documents/:id/complete
 *        → { documentId, status: "scan_pending" | "accepted" | "rejected" }
 *      Server-side malware scanning starts here.
 *
 *   4. GET  /api/educators/applications/documents/:id  (poll)
 *        → { documentId, status, scanMessage }
 *
 * What is stored client-side
 * --------------------------
 * Only the opaque `documentId` and its status. Never a URL. Reading a document
 * back is a separate, deliberate call (`fetchDocumentSignedUrl` in
 * fetchVerificationStatus.js) that mints a fresh time-limited URL on demand.
 */

import axios from "axios";
import axiosInstance from "@/lib/config/axios.config";

// ── Document scan lifecycle ────────────────────────────────────────────────

export const DOCUMENT_STATUS = /** @type {const} */ ({
  SCAN_PENDING: "scan_pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
});

/** @typedef {typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS]} DocumentStatus */

/** Statuses that mean the scan has finished, one way or the other. */
const TERMINAL_STATUSES = new Set([
  DOCUMENT_STATUS.ACCEPTED,
  DOCUMENT_STATUS.REJECTED,
]);

export const isTerminalStatus = (status) => TERMINAL_STATUSES.has(status);

/** Normalise whatever the backend returns onto the three known statuses. */
function normaliseStatus(raw) {
  const value = String(raw ?? "").toLowerCase();
  if (value === DOCUMENT_STATUS.ACCEPTED || value === "clean") {
    return DOCUMENT_STATUS.ACCEPTED;
  }
  if (
    value === DOCUMENT_STATUS.REJECTED ||
    value === "infected" ||
    value === "quarantined"
  ) {
    return DOCUMENT_STATUS.REJECTED;
  }
  return DOCUMENT_STATUS.SCAN_PENDING;
}

/** Turn an axios failure into a plain Error with the backend's message. */
function toError(err, fallback) {
  return new Error(
    err?.response?.data?.message ?? err?.message ?? fallback
  );
}

// ── Step 1 — request a signed upload target ────────────────────────────────

/**
 * @param {Object} params
 * @param {string} params.documentType  one of DOCUMENT_TYPES
 * @param {string} params.filename
 * @param {string} params.contentType   the VERIFIED mime (from magic bytes)
 * @param {number} params.size
 * @returns {Promise<{documentId: string, uploadUrl: string, method: string, headers: Object, expiresAt: string}>}
 */
export async function requestUploadTarget({
  documentType,
  filename,
  contentType,
  size,
}) {
  if (!documentType) throw new Error("documentType is required");
  if (!contentType) throw new Error("contentType is required");

  try {
    const res = await axiosInstance.post(
      "/api/educators/applications/documents/upload-url",
      { documentType, filename, contentType, size }
    );

    const { documentId, uploadUrl, method, headers, expiresAt } = res.data ?? {};

    if (!documentId || !uploadUrl) {
      throw new Error("Upload target response was incomplete");
    }

    return {
      documentId,
      uploadUrl,
      method: (method ?? "PUT").toUpperCase(),
      headers: headers ?? { "Content-Type": contentType },
      expiresAt: expiresAt ?? null,
    };
  } catch (err) {
    throw toError(err, "Could not start the upload");
  }
}

// ── Step 2 — send the bytes to the signed target ───────────────────────────

/**
 * Uploads the raw file to the signed URL.
 *
 * Deliberately uses a BARE axios call rather than axiosInstance: the signed URL
 * points at the storage provider, and the app's request interceptor would
 * otherwise attach the user's Authorization bearer token to a third-party
 * origin.
 *
 * @param {Object} params
 * @param {string} params.uploadUrl
 * @param {string} params.method
 * @param {Object} params.headers
 * @param {File}   params.file
 * @param {(percent: number) => void} [params.onProgress]
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<void>}
 */
export async function uploadToSignedTarget({
  uploadUrl,
  method = "PUT",
  headers = {},
  file,
  onProgress,
  signal,
}) {
  try {
    await axios.request({
      url: uploadUrl,
      method,
      data: file,
      headers,
      signal,
      // Never send cookies or credentials to the storage origin.
      withCredentials: false,
      onUploadProgress: (event) => {
        if (!onProgress) return;
        const total = event.total ?? file?.size;
        if (!total) return;
        onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
      },
    });
  } catch (err) {
    if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED") {
      throw err;
    }
    throw toError(err, "Upload failed");
  }
}

// ── Step 3 — finalise, which kicks off malware scanning ────────────────────

/**
 * @param {Object} params
 * @param {string} params.documentId
 * @param {string} params.documentType
 * @returns {Promise<{documentId: string, documentType: string, status: DocumentStatus, filename: string|null, uploadedAt: string|null, scanMessage: string|null}>}
 */
export async function finalizeUpload({ documentId, documentType }) {
  if (!documentId) throw new Error("documentId is required");

  try {
    const res = await axiosInstance.post(
      `/api/educators/applications/documents/${documentId}/complete`,
      { documentType }
    );

    return toDocumentReference(res.data ?? {}, { documentId, documentType });
  } catch (err) {
    throw toError(err, "Could not finish the upload");
  }
}

// ── Step 4 — poll scan status ──────────────────────────────────────────────

/**
 * @param {string} documentId
 * @returns {Promise<{documentId: string, status: DocumentStatus, scanMessage: string|null}>}
 */
export async function fetchDocumentStatus(documentId) {
  if (!documentId) throw new Error("documentId is required");

  try {
    const res = await axiosInstance.get(
      `/api/educators/applications/documents/${documentId}`
    );
    const data = res.data ?? {};
    return {
      documentId: data.documentId ?? documentId,
      status: normaliseStatus(data.status),
      scanMessage: data.scanMessage ?? null,
    };
  } catch (err) {
    throw toError(err, "Could not check the scan status");
  }
}

// ── Remove ─────────────────────────────────────────────────────────────────

/**
 * Deletes a previously uploaded document. Used by both "remove" and the first
 * half of "replace".
 *
 * @param {string} documentId
 * @returns {Promise<void>}
 */
export async function removeDocument(documentId) {
  if (!documentId) throw new Error("documentId is required");

  try {
    await axiosInstance.delete(
      `/api/educators/applications/documents/${documentId}`
    );
  } catch (err) {
    throw toError(err, "Could not remove the document");
  }
}

// ── Reference shape stored client-side ─────────────────────────────────────

/**
 * The ONLY document shape the client keeps. Note the absence of any URL field:
 * viewing a document requires a fresh signed URL minted on demand.
 *
 * @param {Object} raw
 * @param {Object} defaults
 */
function toDocumentReference(raw, defaults = {}) {
  return {
    documentId: raw.documentId ?? raw.id ?? defaults.documentId ?? null,
    documentType: raw.documentType ?? raw.type ?? defaults.documentType ?? null,
    status: normaliseStatus(raw.status),
    filename: raw.filename ?? defaults.filename ?? null,
    uploadedAt: raw.uploadedAt ?? null,
    scanMessage: raw.scanMessage ?? null,
  };
}

export { toDocumentReference };
