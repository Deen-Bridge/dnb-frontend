"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { validateDocumentFile } from "@/lib/verification/documents/policy";
import {
  DOCUMENT_STATUS,
  DocumentStatus,
  fetchDocumentStatus,
  finalizeUpload,
  isTerminalStatus,
  removeDocument as removeDocumentRequest,
  requestUploadTarget,
  uploadToSignedTarget,
  DocumentReference,
} from "@/lib/actions/educators/uploadDocument";

export const SLOT_STATE = {
  EMPTY: "empty",
  VALIDATING: "validating",
  REQUESTING: "requesting",
  UPLOADING: "uploading",
  SCANNING: "scanning",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ERROR: "error",
} as const;

export type SlotStateValue = typeof SLOT_STATE[keyof typeof SLOT_STATE];

export interface SlotInfo {
  state: SlotStateValue;
  progress: number;
  error: string | null;
  errorReason: string | null;
  filename: string | null;
  size: number | null;
  mimeType: string | null;
  previewUrl: string | null;
  reference: DocumentReference | null;
  scanMessage: string | null;
}

const EMPTY_SLOT: SlotInfo = Object.freeze({
  state: SLOT_STATE.EMPTY,
  progress: 0,
  error: null,
  errorReason: null,
  filename: null,
  size: null,
  mimeType: null,
  previewUrl: null,
  reference: null,
  scanMessage: null,
});

function slotStateForStatus(status: DocumentStatus): SlotStateValue {
  if (status === DOCUMENT_STATUS.ACCEPTED) return SLOT_STATE.ACCEPTED;
  if (status === DOCUMENT_STATUS.REJECTED) return SLOT_STATE.REJECTED;
  return SLOT_STATE.SCANNING;
}

function makePreviewUrl(file: File): string | null {
  if (typeof URL?.createObjectURL !== "function") return null;
  if (!String(file.type).startsWith("image/")) return null;
  return URL.createObjectURL(file);
}

function revokePreviewUrl(url?: string | null): void {
  if (url && typeof URL?.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

export interface UseDocumentUploadOptions {
  pollIntervalMs?: number;
  maxPollAttempts?: number;
}

export interface UploadDocumentResult {
  ok: boolean;
  reason?: string;
  reference?: DocumentReference;
}

export interface UseDocumentUploadReturn {
  slots: Record<string, SlotInfo>;
  getSlot: (documentType: string) => SlotInfo;
  uploadDocument: (documentType: string, file: File) => Promise<UploadDocumentResult>;
  replaceDocument: (documentType: string, file: File) => Promise<UploadDocumentResult>;
  removeDocument: (documentType: string) => Promise<{ ok: boolean }>;
  reset: () => void;
}

export function useDocumentUpload(options: UseDocumentUploadOptions = {}): UseDocumentUploadReturn {
  const { pollIntervalMs = 3000, maxPollAttempts = 20 } = options;

  const [slots, setSlots] = useState<Record<string, SlotInfo>>({});

  const mountedRef = useRef<boolean>(true);
  const abortControllersRef = useRef<Record<string, AbortController | null>>({});
  const previewUrlsRef = useRef<Record<string, string | null>>({});
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Object.values(abortControllersRef.current).forEach((c) => c?.abort());
      Object.values(previewUrlsRef.current).forEach(revokePreviewUrl);
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const patchSlot = useCallback((documentType: string, patch: Partial<SlotInfo>) => {
    if (!mountedRef.current) return;
    setSlots((prev) => ({
      ...prev,
      [documentType]: { ...EMPTY_SLOT, ...prev[documentType], ...patch },
    }));
  }, []);

  const setPreviewUrl = useCallback((documentType: string, url: string | null) => {
    revokePreviewUrl(previewUrlsRef.current[documentType]);
    previewUrlsRef.current[documentType] = url;
  }, []);

  const sleep = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        timersRef.current.push(id);
      }),
    []
  );

  const pollScanStatus = useCallback(
    async (documentType: string, documentId: string) => {
      for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
        await sleep(pollIntervalMs);
        if (!mountedRef.current) return;

        let result;
        try {
          result = await fetchDocumentStatus(documentId);
        } catch {
          continue;
        }

        if (!mountedRef.current) return;

        if (isTerminalStatus(result.status)) {
          patchSlot(documentType, {
            state: slotStateForStatus(result.status),
            scanMessage: result.scanMessage,
            error:
              result.status === DOCUMENT_STATUS.REJECTED
                ? result.scanMessage ??
                  "This document was rejected by the security scan."
                : null,
            reference: {
              documentId,
              documentType,
              status: result.status,
              filename: null,
              uploadedAt: null,
              scanMessage: result.scanMessage,
            },
          });
          return;
        }
      }
    },
    [maxPollAttempts, patchSlot, pollIntervalMs, sleep]
  );

  const uploadDocument = useCallback(
    async (documentType: string, file: File): Promise<UploadDocumentResult> => {
      patchSlot(documentType, {
        state: SLOT_STATE.VALIDATING,
        progress: 0,
        error: null,
        errorReason: null,
        filename: file?.name ?? null,
        size: file?.size ?? null,
        mimeType: file?.type ?? null,
        previewUrl: null,
        scanMessage: null,
      });

      const validation = await validateDocumentFile(file);

      if (!validation.valid) {
        setPreviewUrl(documentType, null);
        patchSlot(documentType, {
          state: SLOT_STATE.ERROR,
          error: validation.error,
          errorReason: validation.reason,
          previewUrl: null,
          reference: null,
        });
        return { ok: false, reason: validation.reason || undefined };
      }

      const previewUrl = makePreviewUrl(file);
      setPreviewUrl(documentType, previewUrl);

      const controller =
        typeof AbortController === "function" ? new AbortController() : null;
      abortControllersRef.current[documentType] = controller;

      try {
        patchSlot(documentType, {
          state: SLOT_STATE.REQUESTING,
          previewUrl,
          progress: 0,
        });

        const target = await requestUploadTarget({
          documentType,
          filename: file.name,
          contentType: validation.detectedMime || file.type || "application/octet-stream",
          size: file.size,
        });

        patchSlot(documentType, { state: SLOT_STATE.UPLOADING, progress: 0 });

        await uploadToSignedTarget({
          uploadUrl: target.uploadUrl,
          method: target.method,
          headers: target.headers,
          file,
          signal: controller?.signal,
          onProgress: (percent) =>
            patchSlot(documentType, {
              state: SLOT_STATE.UPLOADING,
              progress: percent,
            }),
        });

        patchSlot(documentType, { progress: 100, state: SLOT_STATE.SCANNING });

        const reference = await finalizeUpload({
          documentId: target.documentId,
          documentType,
        });

        patchSlot(documentType, {
          state: slotStateForStatus(reference.status),
          reference,
          scanMessage: reference.scanMessage,
          progress: 100,
        });

        if (!isTerminalStatus(reference.status) && reference.documentId) {
          pollScanStatus(documentType, reference.documentId).catch(() => {});
        }

        return { ok: true, reference };
      } catch (err: any) { // TODO(types): Upload pipeline error
        if (err?.code === "ERR_CANCELED") {
          return { ok: false, reason: "cancelled" };
        }
        patchSlot(documentType, {
          state: SLOT_STATE.ERROR,
          error: err?.message ?? "Upload failed",
          errorReason: "upload_failed",
          reference: null,
        });
        return { ok: false, reason: "upload_failed" };
      } finally {
        delete abortControllersRef.current[documentType];
      }
    },
    [patchSlot, pollScanStatus, setPreviewUrl]
  );

  const removeSlot = useCallback(
    async (documentType: string): Promise<{ ok: boolean }> => {
      abortControllersRef.current[documentType]?.abort();

      const existingId = slots[documentType]?.reference?.documentId;

      if (existingId) {
        try {
          await removeDocumentRequest(existingId);
        } catch (err: any) { // TODO(types): Error from remove document
          patchSlot(documentType, {
            error: err?.message ?? "Could not remove the document",
            errorReason: "remove_failed",
          });
          return { ok: false };
        }
      }

      setPreviewUrl(documentType, null);

      if (!mountedRef.current) return { ok: true };
      setSlots((prev) => {
        const next = { ...prev };
        delete next[documentType];
        return next;
      });

      return { ok: true };
    },
    [patchSlot, setPreviewUrl, slots]
  );

  const replaceDocument = useCallback(
    async (documentType: string, file: File): Promise<UploadDocumentResult> => {
      const existingId = slots[documentType]?.reference?.documentId;

      if (existingId) {
        try {
          await removeDocumentRequest(existingId);
        } catch {
          // Deleting the old copy is best-effort
        }
      }

      return uploadDocument(documentType, file);
    },
    [slots, uploadDocument]
  );

  const reset = useCallback(() => {
    Object.values(abortControllersRef.current).forEach((c) => c?.abort());
    Object.values(previewUrlsRef.current).forEach(revokePreviewUrl);
    previewUrlsRef.current = {};
    if (mountedRef.current) setSlots({});
  }, []);

  const getSlot = useCallback(
    (documentType: string): SlotInfo => slots[documentType] ?? EMPTY_SLOT,
    [slots]
  );

  return {
    slots,
    getSlot,
    uploadDocument,
    replaceDocument,
    removeDocument: removeSlot,
    reset,
  };
}

export default useDocumentUpload;
