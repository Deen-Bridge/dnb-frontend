/**
 * File signature (magic byte) inspection
 * --------------------------------------
 * `File.type` is the browser's guess, derived from the file extension. It is
 * attacker-controlled: renaming `payload.exe` to `passport.pdf` produces a File
 * whose `.type` is `application/pdf`. A type- or size-only check cannot tell
 * the difference — only the leading bytes can.
 *
 * This module reads the first bytes of a File and reports what the content
 * actually is, independent of its name or declared MIME type.
 *
 * Nothing here touches the network. It is a pure pre-flight gate that runs
 * before any upload target is even requested.
 */

/** How many leading bytes we need to identify every signature below. */
export const SIGNATURE_BYTE_LENGTH = 12;

/**
 * Signatures for the formats we accept for KYC documents.
 * Each entry lists the byte prefix(es) that identify the format.
 */
const ACCEPTED_SIGNATURES = [
  {
    mime: "application/pdf",
    label: "PDF",
    // "%PDF-"
    prefixes: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  },
  {
    mime: "image/jpeg",
    label: "JPEG image",
    // SOI marker + first marker byte
    prefixes: [[0xff, 0xd8, 0xff]],
  },
  {
    mime: "image/png",
    label: "PNG image",
    prefixes: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
];

/**
 * Signatures we explicitly name when rejecting, so the user (and the audit
 * log) get a meaningful reason instead of a generic "invalid file".
 */
const KNOWN_HOSTILE_SIGNATURES = [
  { label: "Windows executable", prefixes: [[0x4d, 0x5a]] }, // "MZ"
  { label: "Linux executable", prefixes: [[0x7f, 0x45, 0x4c, 0x46]] }, // ELF
  {
    label: "Mach-O executable",
    prefixes: [
      [0xfe, 0xed, 0xfa, 0xce],
      [0xfe, 0xed, 0xfa, 0xcf],
      [0xcf, 0xfa, 0xed, 0xfe],
      [0xca, 0xfe, 0xba, 0xbe],
    ],
  },
  { label: "ZIP or Office archive", prefixes: [[0x50, 0x4b, 0x03, 0x04]] },
  { label: "RAR archive", prefixes: [[0x52, 0x61, 0x72, 0x21]] },
  { label: "gzip archive", prefixes: [[0x1f, 0x8b]] },
  { label: "Shell script", prefixes: [[0x23, 0x21]] }, // "#!"
];

/**
 * Read the first bytes of a File/Blob.
 *
 * @param {Blob} file
 * @param {number} [length]
 * @returns {Promise<Uint8Array>}
 */
export async function readMagicBytes(file, length = SIGNATURE_BYTE_LENGTH) {
  const slice = file.slice(0, length);

  // Blob.arrayBuffer() is the modern path; FileReader is the fallback for
  // older Safari/WebView, which the mobile capture flow still has to support.
  if (typeof slice.arrayBuffer === "function") {
    return new Uint8Array(await slice.arrayBuffer());
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Unreadable file"));
    reader.readAsArrayBuffer(slice);
  });
}

/**
 * @param {Uint8Array} bytes
 * @param {number[]} prefix
 */
function startsWith(bytes, prefix) {
  if (bytes.length < prefix.length) return false;
  return prefix.every((byte, i) => bytes[i] === byte);
}

/**
 * Identify a byte prefix against the accepted-format table.
 *
 * @param {Uint8Array} bytes
 * @returns {{ mime: string, label: string } | null} null when unrecognised
 */
export function identifySignature(bytes) {
  for (const entry of ACCEPTED_SIGNATURES) {
    if (entry.prefixes.some((prefix) => startsWith(bytes, prefix))) {
      return { mime: entry.mime, label: entry.label };
    }
  }
  return null;
}

/**
 * Name a recognisably hostile payload, for a clearer rejection message.
 *
 * @param {Uint8Array} bytes
 * @returns {string | null}
 */
export function identifyHostileSignature(bytes) {
  for (const entry of KNOWN_HOSTILE_SIGNATURES) {
    if (entry.prefixes.some((prefix) => startsWith(bytes, prefix))) {
      return entry.label;
    }
  }
  return null;
}

/**
 * Inspect a File and report the content type its bytes actually declare.
 *
 * @param {File|Blob} file
 * @returns {Promise<{
 *   detectedMime: string | null,
 *   detectedLabel: string | null,
 *   hostileLabel: string | null,
 *   bytes: Uint8Array,
 * }>}
 */
export async function inspectFileSignature(file) {
  const bytes = await readMagicBytes(file);
  const accepted = identifySignature(bytes);
  return {
    detectedMime: accepted?.mime ?? null,
    detectedLabel: accepted?.label ?? null,
    hostileLabel: accepted ? null : identifyHostileSignature(bytes),
    bytes,
  };
}
