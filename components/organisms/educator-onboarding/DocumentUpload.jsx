"use client";
/**
 * DocumentUpload
 * --------------
 * The secure upload surface for educator KYC documents.
 *
 * Per slot it supports drag/drop, click-to-browse, mobile camera capture,
 * per-file progress, an inline preview, replace, remove, and a "scan pending"
 * state that resolves to accepted or rejected.
 *
 * Security notes
 * --------------
 * - Every file passes validateDocumentFile() (type + size + magic bytes)
 *   BEFORE a signed upload target is requested. A rejected file produces an
 *   inline reason and never touches the network.
 * - The preview is a local object URL built from the File the user picked. It
 *   is not a remote link, and it is revoked when the slot is cleared.
 * - No component in this tree ever receives or renders a public asset URL.
 */

import { useCallback, useId, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ACCEPT_ATTRIBUTE,
  DOCUMENT_SLOTS,
  MAX_DOCUMENT_BYTES,
  formatBytes,
} from "@/lib/verification/documents/policy";
import useDocumentUpload, { SLOT_STATE } from "@/hooks/useDocumentUpload";

// ── Per-state presentation ─────────────────────────────────────────────────

const BUSY_STATES = new Set([
  SLOT_STATE.VALIDATING,
  SLOT_STATE.REQUESTING,
  SLOT_STATE.UPLOADING,
]);

const STATUS_COPY = {
  [SLOT_STATE.VALIDATING]: "Checking file…",
  [SLOT_STATE.REQUESTING]: "Preparing secure upload…",
  [SLOT_STATE.UPLOADING]: "Uploading…",
  [SLOT_STATE.SCANNING]: "Scan pending — checking this file for malware",
  [SLOT_STATE.ACCEPTED]: "Accepted",
  [SLOT_STATE.REJECTED]: "Rejected",
};

function StatusPill({ state }) {
  if (state === SLOT_STATE.EMPTY) return null;

  const tone =
    state === SLOT_STATE.ACCEPTED
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : state === SLOT_STATE.REJECTED || state === SLOT_STATE.ERROR
      ? "bg-destructive/10 text-destructive"
      : state === SLOT_STATE.SCANNING
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-muted text-muted-foreground";

  const Icon =
    state === SLOT_STATE.ACCEPTED
      ? CheckCircle2
      : state === SLOT_STATE.REJECTED
      ? ShieldAlert
      : state === SLOT_STATE.ERROR
      ? AlertCircle
      : Loader2;

  return (
    <span
      data-testid="slot-status"
      data-state={state}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", BUSY_STATES.has(state) && "animate-spin")}
        aria-hidden="true"
      />
      {STATUS_COPY[state] ?? "Not uploaded"}
    </span>
  );
}

// ── One document slot ──────────────────────────────────────────────────────

function DocumentSlot({ slot, definition, onSelectFile, onRemove }) {
  const inputId = useId();
  const cameraInputId = `${inputId}-camera`;
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const isBusy = BUSY_STATES.has(slot.state);
  const hasFile = slot.state !== SLOT_STATE.EMPTY;
  const canReplace =
    hasFile && !isBusy && slot.state !== SLOT_STATE.VALIDATING;

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (file) onSelectFile(definition.type, file);
    },
    [definition.type, onSelectFile]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      if (isBusy) return;
      handleFiles(event.dataTransfer?.files);
    },
    [handleFiles, isBusy]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const openBrowser = useCallback(() => fileInputRef.current?.click(), []);
  const openCamera = useCallback(() => cameraInputRef.current?.click(), []);

  return (
    <section
      data-testid={`document-slot-${definition.type}`}
      data-state={slot.state}
      className="rounded-xl border border-border bg-card p-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {definition.label}
            {definition.required && (
              <span className="ml-1 text-destructive" aria-hidden="true">
                *
              </span>
            )}
            {!definition.required && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Optional
              </span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {definition.description}
          </p>
        </div>
        <StatusPill state={slot.state} />
      </header>

      {/* ── Drop zone ─────────────────────────────────────────────────────── */}
      {!hasFile && (
        <div
          data-testid={`dropzone-${definition.type}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "mt-3 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            isDragging
              ? "border-accent bg-accent/5"
              : "border-border bg-background"
          )}
        >
          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            Drag a file here, or
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={openBrowser}
              data-testid={`browse-${definition.type}`}
              className="rounded-full border border-accent px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Choose file
            </button>
            {definition.allowCamera && (
              <button
                type="button"
                onClick={openCamera}
                data-testid={`camera-${definition.type}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                Take a photo
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            PDF, JPEG, or PNG · up to {formatBytes(MAX_DOCUMENT_BYTES)}
          </p>
        </div>
      )}

      {/* ── Selected file ─────────────────────────────────────────────────── */}
      {hasFile && (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-border bg-background p-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
            {slot.previewUrl ? (
              // Local object URL for the file the user just picked — never a
              // remote asset, so next/image would add nothing here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slot.previewUrl}
                alt={`Preview of ${slot.filename}`}
                data-testid={`preview-${definition.type}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText
                className="h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {slot.filename}
            </p>
            {slot.size != null && (
              <p className="text-xs text-muted-foreground">
                {formatBytes(slot.size)}
              </p>
            )}

            {/* Progress */}
            {isBusy && (
              <div className="mt-2">
                <div
                  role="progressbar"
                  aria-valuenow={slot.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${definition.label} upload progress`}
                  data-testid={`progress-${definition.type}`}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${slot.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {slot.progress}%
                </p>
              </div>
            )}

            {/* Scan pending */}
            {slot.state === SLOT_STATE.SCANNING && (
              <p
                data-testid={`scan-pending-${definition.type}`}
                className="mt-2 text-xs text-amber-600 dark:text-amber-400"
              >
                Scan pending — you can continue; we&apos;ll tell you if
                anything is wrong.
              </p>
            )}

            {/* Errors / rejection */}
            {slot.error && (
              <p
                role="alert"
                data-testid={`error-${definition.type}`}
                className="mt-2 text-xs text-destructive"
              >
                {slot.error}
              </p>
            )}

            {/* Actions */}
            {canReplace && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openBrowser}
                  data-testid={`replace-${definition.type}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(definition.type)}
                  data-testid={`remove-${definition.type}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Hidden inputs ─────────────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        data-testid={`input-${definition.type}`}
        aria-label={`Upload ${definition.label}`}
        onChange={(event) => {
          handleFiles(event.target.files);
          // Allow re-selecting the same filename after a rejection.
          event.target.value = "";
        }}
      />
      {definition.allowCamera && (
        <input
          ref={cameraInputRef}
          id={cameraInputId}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          data-testid={`camera-input-${definition.type}`}
          aria-label={`Photograph ${definition.label}`}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      )}
    </section>
  );
}

// ── Public component ───────────────────────────────────────────────────────

/**
 * @param {Object} props
 * @param {Array} [props.slots]        slot definitions; defaults to DOCUMENT_SLOTS
 * @param {(refs: Object) => void} [props.onChange]  called with the current
 *        map of documentType → document reference whenever it changes
 * @param {() => void} [props.onComplete]  called when the user submits and all
 *        required slots hold a document
 * @param {() => void} [props.onCancel]
 * @param {Object} [props.uploadOptions]  forwarded to useDocumentUpload
 */
export default function DocumentUpload({
  slots: definitions = DOCUMENT_SLOTS,
  onChange,
  onComplete,
  onCancel,
  uploadOptions,
}) {
  const { slots, getSlot, uploadDocument, replaceDocument, removeDocument } =
    useDocumentUpload(uploadOptions);

  const handleSelectFile = useCallback(
    async (documentType, file) => {
      const existing = slots[documentType]?.reference?.documentId;
      const run = existing ? replaceDocument : uploadDocument;

      const result = await run(documentType, file);

      if (result?.ok && onChange) {
        onChange({
          ...collectReferences(slots),
          [documentType]: result.reference,
        });
      }
      return result;
    },
    [onChange, replaceDocument, slots, uploadDocument]
  );

  const handleRemove = useCallback(
    async (documentType) => {
      const result = await removeDocument(documentType);
      if (result?.ok && onChange) {
        const next = collectReferences(slots);
        delete next[documentType];
        onChange(next);
      }
    },
    [onChange, removeDocument, slots]
  );

  const requiredTypes = definitions
    .filter((d) => d.required)
    .map((d) => d.type);

  const allRequiredUploaded = requiredTypes.every((type) => {
    const state = slots[type]?.state;
    return state === SLOT_STATE.SCANNING || state === SLOT_STATE.ACCEPTED;
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          Upload your documents
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These are stored privately and shared only with the reviewer handling
          your application. They are never published.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {definitions.map((definition) => (
          <DocumentSlot
            key={definition.type}
            definition={definition}
            slot={getSlot(definition.type)}
            onSelectFile={handleSelectFile}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            data-testid="documents-cancel"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onComplete}
          disabled={!allRequiredUploaded}
          data-testid="documents-continue"
          className="ml-auto rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/** Pull the { documentType: reference } map out of slot state. */
function collectReferences(slots) {
  return Object.entries(slots).reduce((acc, [type, slot]) => {
    if (slot?.reference) acc[type] = slot.reference;
    return acc;
  }, {});
}
