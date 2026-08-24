/**
 * Verification-document policy
 * ----------------------------
 * The single source of truth for what an educator may upload as KYC evidence,
 * and the pre-flight gate that runs BEFORE any network call is made.
 *
 * Three checks, in order — cheapest and most conclusive first:
 *   1. Declared MIME must be in the allow-list (catches obvious mistakes).
 *   2. Size must be within the per-type limit (catches oversized files before
 *      we waste a signed URL on them).
 *   3. The leading bytes must actually match the declared type. This is the
 *      check `File.type` cannot do: a renamed `.exe` declares
 *      `application/pdf` and passes 1 and 2, but its first bytes are `MZ`.
 *
 * Nothing in this module performs I/O beyond reading the first 12 bytes of the
 * File the user selected.
 */

import { inspectFileSignature } from "./fileSignature";

// ── Document slots ─────────────────────────────────────────────────────────

/**
 * Document types the educator-application review queue (dnb-backend#92)
 * accepts. `type` is the value sent as document metadata.
 */
export const DOCUMENT_TYPES = /** @type {const} */ ({
  GOVERNMENT_ID: "government_id",
  TEACHING_CERTIFICATE: "teaching_certificate",
  SUPPORTING_DOCUMENT: "supporting_document",
});

/** @typedef {typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]} DocumentType */

export const DOCUMENT_SLOTS = [
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

// ── Limits ─────────────────────────────────────────────────────────────────

/** Accepted MIME types. Anything else is rejected before upload. */
export const ALLOWED_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

/** Value for an <input type="file" accept="..."> attribute. */
export const ACCEPT_ATTRIBUTE = ALLOWED_MIME_TYPES.join(",");

/** 10 MB — comfortably above a phone photo, well below an abuse vector. */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/** Human labels used in error copy. */
const MIME_LABELS = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
};

/** JPEG has two interchangeable MIME spellings. */
function normaliseMime(mime) {
  const value = String(mime ?? "").toLowerCase().trim();
  return value === "image/jpg" ? "image/jpeg" : value;
}

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${Math.round(value * 10) / 10} ${units[exponent]}`;
}

// ── Rejection reasons ──────────────────────────────────────────────────────

export const REJECTION = /** @type {const} */ ({
  EMPTY: "empty",
  TYPE_NOT_ALLOWED: "type_not_allowed",
  TOO_LARGE: "too_large",
  SIGNATURE_MISMATCH: "signature_mismatch",
  SIGNATURE_UNRECOGNISED: "signature_unrecognised",
  UNREADABLE: "unreadable",
});

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string|null} reason   machine-readable REJECTION code
 * @property {string|null} error    human-readable message shown inline
 * @property {string|null} detectedMime  what the bytes actually say
 */

/** @returns {ValidationResult} */
function reject(reason, error) {
  return { valid: false, reason, error, detectedMime: null };
}

/**
 * Validate a file for use as a verification document.
 *
 * Async because the signature check reads bytes off the File. Callers MUST
 * await this and MUST NOT start an upload unless `valid` is true.
 *
 * @param {File} file
 * @param {Object} [options]
 * @param {number} [options.maxBytes]
 * @param {string[]} [options.allowedMimeTypes]
 * @returns {Promise<ValidationResult>}
 */
export async function validateDocumentFile(file, options = {}) {
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

  // ── 1. Declared type ─────────────────────────────────────────────────────
  const declaredMime = normaliseMime(file.type);
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

  // ── 2. Size ──────────────────────────────────────────────────────────────
  if (file.size > maxBytes) {
    return reject(
      REJECTION.TOO_LARGE,
      `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(
        maxBytes
      )}.`
    );
  }

  // ── 3. Content signature ─────────────────────────────────────────────────
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
