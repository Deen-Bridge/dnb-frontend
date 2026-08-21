"use client";
/**
 * useDocumentUpload
 * -----------------
 * Owns the per-slot lifecycle for educator KYC document uploads.
 *
 * Slot lifecycle
 * --------------
 *   empty → validating → requesting → uploading → scanning → accepted
 *                     ↘ error                            ↘ rejected
 *
 * `validating` runs entirely on the client and is the ONLY gate that can stop
 * a file before a signed upload target is requested. A file that fails
 * validation never reaches `requesting`, so no network call is made for it —
 * that is the property __tests__/documents/magicBytes.test.js pins down.
 *
 * What this hook stores
 * ---------------------
 * Per slot: display metadata (name/size), progress, an in-memory object URL
 * for image previews, and the opaque document reference `{ documentId,
 * status }`. It never stores a remote URL, because none is ever produced —
 * see lib/actions/educators/uploadDocument.js.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { validateDocumentFile } from "@/lib/verification/documents/policy";
import {
  DOCUMENT_STATUS,
  fetchDocumentStatus,
  finalizeUpload,
  isTerminalStatus,
  removeDocument as removeDocumentRequest,
  requestUploadTarget,
  uploadToSignedTarget,
} from "@/lib/actions/educators/uploadDocument";

// ── Slot states ────────────────────────────────────────────────────────────

export const SLOT_STATE = /** @type {const} */ ({
  EMPTY: "empty",
  VALIDATING: "validating",
  REQUESTING: "requesting",
  UPLOADING: "uploading",
  SCANNING: "scanning",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  ERROR: "error",
});

const EMPTY_SLOT = Object.freeze({
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

/** Map a document scan status onto a slot state. */
function slotStateForStatus(status) {
  if (status === DOCUMENT_STATUS.ACCEPTED) return SLOT_STATE.ACCEPTED;
  if (status === DOCUMENT_STATUS.REJECTED) return SLOT_STATE.REJECTED;
  return SLOT_STATE.SCANNING;
}

/** Object URLs are only useful for formats the browser can render inline. */
function makePreviewUrl(file) {
  if (typeof URL?.createObjectURL !== "function") return null;
  if (!String(file.type).startsWith("image/")) return null;
  return URL.createObjectURL(file);
}

function revokePreviewUrl(url) {
  if (url && typeof URL?.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

/**
 * @param {Object} [options]
 * @param {number} [options.pollIntervalMs] gap between scan-status polls
 * @param {number} [options.maxPollAttempts] give up after this many polls
 */
export function useDocumentUpload(options = {}) {
  const { pollIntervalMs = 3000, maxPollAttempts = 20 } = options;

  const [slots, setSlots] = useState({});

  // Live refs so async work can bail out after unmount without setting state.
  const mountedRef = useRef(true);
  const abortControllersRef = useRef({});
  const previewUrlsRef = useRef({});
  const timersRef = useRef([]);

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

  const patchSlot = useCallback((documentType, patch) => {
    if (!mountedRef.current) return;
    setSlots((prev) => ({
      ...prev,
      [documentType]: { ...EMPTY_SLOT, ...prev[documentType], ...patch },
    }));
  }, []);

  const setPreviewUrl = useCallback((documentType, url) => {
    revokePreviewUrl(previewUrlsRef.current[documentType]);
    previewUrlsRef.current[documentType] = url;
  }, []);

  const sleep = useCallback(
    (ms) =>
      new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        timersRef.current.push(id);
      }),
    []
  );

  // ── Scan polling ─────────────────────────────────────────────────────────

  const pollScanStatus = useCallback(
    async (documentType, documentId) => {
      for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
        await sleep(pollIntervalMs);
        if (!mountedRef.current) return;

        let result;
        try {
          result = await fetchDocumentStatus(documentId);
        } catch {
          // A transient status-check failure is not an upload failure; the
          // document is already stored. Keep waiting.
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
            },
          });
          return;
        }
      }

      // Ran out of attempts — leave the slot in `scanning`; the review queue
      // will resolve it and the status center reflects the final state.
    },
    [maxPollAttempts, patchSlot, pollIntervalMs, sleep]
  );

  // ── Upload ───────────────────────────────────────────────────────────────

  /**
   * Validate then upload a file into a slot.
   *
   * @param {string} documentType
   * @param {File} file
   * @returns {Promise<{ ok: boolean, reason?: string, reference?: Object }>}
   */
  const uploadDocument = useCallback(
    async (documentType, file) => {
      // ── Client gate — nothing below this runs unless the file is valid ──
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
        return { ok: false, reason: validation.reason };
      }

      const previewUrl = makePreviewUrl(file);
      setPreviewUrl(documentType, previewUrl);

      const controller =
        typeof AbortController === "function" ? new AbortController() : null;
      abortControllersRef.current[documentType] = controller;

      try {
        // ── Signed target ────────────────────────────────────────────────
        patchSlot(documentType, {
          state: SLOT_STATE.REQUESTING,
          previewUrl,
          progress: 0,
        });

        const target = await requestUploadTarget({
          documentType,
          filename: file.name,
          // The VERIFIED type from the magic bytes, not the browser's guess.
          contentType: validation.detectedMime,
          size: file.size,
        });

        // ── Bytes ────────────────────────────────────────────────────────
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

        // ── Finalise → scanning ──────────────────────────────────────────
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

        if (!isTerminalStatus(reference.status)) {
          // Deliberately not awaited — the upload is done and the caller
          // shouldn't block on the scan. Errors are swallowed inside the poll
          // loop; the catch here only guards against an unhandled rejection.
          pollScanStatus(documentType, reference.documentId).catch(() => {});
        }

        return { ok: true, reference };
      } catch (err) {
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

  // ── Remove ───────────────────────────────────────────────────────────────

  /**
   * Clear a slot, deleting the stored document if one was created.
   * @param {string} documentType
   */
  const removeSlot = useCallback(
    async (documentType) => {
      abortControllersRef.current[documentType]?.abort();

      const existingId = slots[documentType]?.reference?.documentId;

      if (existingId) {
        try {
          await removeDocumentRequest(existingId);
        } catch (err) {
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

  // ── Replace ──────────────────────────────────────────────────────────────

  /**
   * Swap the file in a slot. The previously stored document is deleted first
   * so a replaced document never lingers in the review queue.
   *
   * @param {string} documentType
   * @param {File} file
   */
  const replaceDocument = useCallback(
    async (documentType, file) => {
      const existingId = slots[documentType]?.reference?.documentId;

      if (existingId) {
        try {
          await removeDocumentRequest(existingId);
        } catch {
          // Deleting the old copy is best-effort — the new upload still
          // supersedes it in the review queue.
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

  /** @param {string} documentType */
  const getSlot = useCallback(
    (documentType) => slots[documentType] ?? EMPTY_SLOT,
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
