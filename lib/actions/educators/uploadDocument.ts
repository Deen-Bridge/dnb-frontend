import axios from "axios";
import axiosInstance from "@/lib/config/axios.config";

export const DOCUMENT_STATUS = {
  SCAN_PENDING: "scan_pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type DocumentStatus = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];

const TERMINAL_STATUSES = new Set<DocumentStatus>([
  DOCUMENT_STATUS.ACCEPTED,
  DOCUMENT_STATUS.REJECTED,
]);

export const isTerminalStatus = (status: DocumentStatus): boolean => TERMINAL_STATUSES.has(status);

function normaliseStatus(raw: unknown): DocumentStatus {
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

function toError(err: any, fallback: string): Error { // TODO(types): Axios error shape
  return new Error(
    err?.response?.data?.message ?? err?.message ?? fallback
  );
}

export interface RequestUploadTargetParams {
  documentType: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface UploadTargetResult {
  documentId: string;
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresAt: string | null;
}

export async function requestUploadTarget({
  documentType,
  filename,
  contentType,
  size,
}: RequestUploadTargetParams): Promise<UploadTargetResult> {
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

export interface UploadToSignedTargetParams {
  uploadUrl: string;
  method?: string;
  headers?: Record<string, string>;
  file: File | Blob;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export async function uploadToSignedTarget({
  uploadUrl,
  method = "PUT",
  headers = {},
  file,
  onProgress,
  signal,
}: UploadToSignedTargetParams): Promise<void> {
  try {
    await axios.request({
      url: uploadUrl,
      method,
      data: file,
      headers,
      signal,
      withCredentials: false,
      onUploadProgress: (event) => {
        if (!onProgress) return;
        const total = event.total ?? (file as File)?.size;
        if (!total) return;
        onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
      },
    });
  } catch (err: any) { // TODO(types): Axios error on direct upload
    if (axios.isCancel?.(err) || err?.code === "ERR_CANCELED") {
      throw err;
    }
    throw toError(err, "Upload failed");
  }
}

export interface FinalizeUploadParams {
  documentId: string;
  documentType: string;
}

export interface DocumentReference {
  documentId: string | null;
  documentType: string | null;
  status: DocumentStatus;
  filename: string | null;
  uploadedAt: string | null;
  scanMessage: string | null;
}

export async function finalizeUpload({ documentId, documentType }: FinalizeUploadParams): Promise<DocumentReference> {
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

export interface DocumentStatusResult {
  documentId: string;
  status: DocumentStatus;
  scanMessage: string | null;
}

export async function fetchDocumentStatus(documentId: string): Promise<DocumentStatusResult> {
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

export async function removeDocument(documentId: string): Promise<void> {
  if (!documentId) throw new Error("documentId is required");

  try {
    await axiosInstance.delete(
      `/api/educators/applications/documents/${documentId}`
    );
  } catch (err) {
    throw toError(err, "Could not remove the document");
  }
}

function toDocumentReference(raw: any, defaults: Partial<DocumentReference> = {}): DocumentReference { // TODO(types): Document raw reference
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
