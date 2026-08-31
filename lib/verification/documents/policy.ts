import { inspectFileSignature } from "./fileSignature";

export const DOCUMENT_TYPES = {
  GOVERNMENT_ID: "government_id",
  TEACHING_CERTIFICATE: "teaching_certificate",
  SUPPORTING_DOCUMENT: "supporting_document",
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];

export interface DocumentSlot {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
  allowCamera: boolean;
}

export const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    type: DOCUMENT_TYPES.GOVERNMENT_ID,
    label: "Government ID",
    description:
      "Passport, national ID card, or driver's licence. All four corners visible.",
    required: true,
    allowCamera: true,
  },
  {
    type: DOCUMENT_TYPES.TEACHING_CERTIFICATE,
    label: "Teaching or school certificate",
    description:
      "Ijazah, teaching licence, or a certificate from the institution you teach at.",
    required: true,
    allowCamera: true,
  },
  {
    type: DOCUMENT_TYPES.SUPPORTING_DOCUMENT,
    label: "Supporting document",
    description: "Optional — anything else that supports your application.",
    required: false,
    allowCamera: false,
  },
];

export const ALLOWED_MIME_TYPES: readonly string[] = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export const ACCEPT_ATTRIBUTE: string = ALLOWED_MIME_TYPES.join(",");

export const MAX_DOCUMENT_BYTES: number = 10 * 1024 * 1024;

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
};

function normaliseMime(mime?: string): string {
  const value = String(mime ?? "").toLowerCase().trim();
  return value === "image/jpg" ? "image/jpeg" : value;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${Math.round(value * 10) / 10} ${units[exponent]}`;
}

export const REJECTION = {
  EMPTY: "empty",
  TYPE_NOT_ALLOWED: "type_not_allowed",
  TOO_LARGE: "too_large",
  SIGNATURE_MISMATCH: "signature_mismatch",
  SIGNATURE_UNRECOGNISED: "signature_unrecognised",
  UNREADABLE: "unreadable",
} as const;

export type RejectionReason = typeof REJECTION[keyof typeof REJECTION];

export interface ValidationResult {
  valid: boolean;
  reason: RejectionReason | null;
  error: string | null;
  detectedMime: string | null;
}

function reject(reason: RejectionReason, error: string): ValidationResult {
  return { valid: false, reason, error, detectedMime: null };
}

export interface ValidateDocumentFileOptions {
  maxBytes?: number;
  allowedMimeTypes?: readonly string[];
}

export async function validateDocumentFile(
  file: File | Blob,
  options: ValidateDocumentFileOptions = {}
): Promise<ValidationResult> {
  const {
    maxBytes = MAX_DOCUMENT_BYTES,
    allowedMimeTypes = ALLOWED_MIME_TYPES,
  } = options;

  if (!file) {
    return reject(REJECTION.EMPTY, "No file selected.");
  }

  if (file.size === 0) {
    return reject(REJECTION.EMPTY, "That file is empty.");
  }

  const declaredMime = normaliseMime((file as File).type);
  const allowed = allowedMimeTypes.map(normaliseMime);

  if (!allowed.includes(declaredMime)) {
    const names = allowedMimeTypes
      .map((mime) => MIME_LABELS[mime] ?? mime)
      .join(", ");
    return reject(
      REJECTION.TYPE_NOT_ALLOWED,
      `${
        MIME_LABELS[declaredMime] ?? (declaredMime || "That file type")
      } isn't accepted. Upload a ${names}.`
    );
  }

  if (file.size > maxBytes) {
    return reject(
      REJECTION.TOO_LARGE,
      `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(
        maxBytes
      )}.`
    );
  }

  let inspection;
  try {
    inspection = await inspectFileSignature(file);
  } catch {
    return reject(
      REJECTION.UNREADABLE,
      "That file couldn't be read. Try selecting it again."
    );
  }

  const { detectedMime, hostileLabel } = inspection;

  if (!detectedMime) {
    return reject(
      REJECTION.SIGNATURE_UNRECOGNISED,
      hostileLabel
        ? `That file is a ${hostileLabel}, not a document. Upload a PDF, JPEG, or PNG.`
        : "That file's contents don't match a PDF, JPEG, or PNG."
    );
  }

  if (detectedMime !== declaredMime) {
    return reject(
      REJECTION.SIGNATURE_MISMATCH,
      `That file is named like a ${
        MIME_LABELS[declaredMime] ?? declaredMime
      } but its contents are a ${
        MIME_LABELS[detectedMime] ?? detectedMime
      }. Upload the original document.`
    );
  }

  return { valid: true, reason: null, error: null, detectedMime };
}
