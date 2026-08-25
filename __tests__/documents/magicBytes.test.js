/**
 * Magic-byte pre-validation (issue #172)
 * --------------------------------------
 * `File.type` is derived from the file extension and is therefore
 * attacker-controlled. These tests pin the property that matters: a file whose
 * declared extension/MIME says PDF but whose leading bytes say otherwise is
 * rejected — the exact adversarial case a type- or size-only check cannot
 * catch.
 */

import { describe, it, expect } from "vitest";
import {
  identifyHostileSignature,
  identifySignature,
  inspectFileSignature,
  readMagicBytes,
} from "@/lib/verification/documents/fileSignature";
import {
  MAX_DOCUMENT_BYTES,
  REJECTION,
  formatBytes,
  validateDocumentFile,
} from "@/lib/verification/documents/policy";

// ── Fixtures ───────────────────────────────────────────────────────────────

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34];
const JPEG_MAGIC = [0xff, 0xd8, 0xff, 0xe0];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WINDOWS_EXE_MAGIC = [0x4d, 0x5a, 0x90, 0x00]; // "MZ"
const ELF_MAGIC = [0x7f, 0x45, 0x4c, 0x46];
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];

/** Build a File with the given leading bytes, padded to `size`. */
function makeFile(magic, { name, type, size = 2048 }) {
  const bytes = new Uint8Array(size);
  bytes.set(magic, 0);
  return new File([bytes], name, { type });
}

// ---------------------------------------------------------------------------

describe("readMagicBytes", () => {
  it("reads only the leading bytes, not the whole file", async () => {
    const file = makeFile(PDF_MAGIC, {
      name: "id.pdf",
      type: "application/pdf",
      size: 5 * 1024 * 1024,
    });

    const bytes = await readMagicBytes(file, 5);

    expect(bytes).toHaveLength(5);
    expect(Array.from(bytes)).toEqual([0x25, 0x50, 0x44, 0x46, 0x2d]);
  });
});

describe("identifySignature", () => {
  it.each([
    ["PDF", PDF_MAGIC, "application/pdf"],
    ["JPEG", JPEG_MAGIC, "image/jpeg"],
    ["PNG", PNG_MAGIC, "image/png"],
  ])("recognises %s", (_label, magic, expected) => {
    expect(identifySignature(new Uint8Array(magic))?.mime).toBe(expected);
  });

  it("returns null for content it does not recognise", () => {
    expect(identifySignature(new Uint8Array(WINDOWS_EXE_MAGIC))).toBeNull();
    expect(identifySignature(new Uint8Array([0x00, 0x01, 0x02]))).toBeNull();
  });
});

describe("identifyHostileSignature", () => {
  it.each([
    ["Windows executable", WINDOWS_EXE_MAGIC],
    ["Linux executable", ELF_MAGIC],
    ["ZIP or Office archive", ZIP_MAGIC],
  ])("names a %s", (label, magic) => {
    expect(identifyHostileSignature(new Uint8Array(magic))).toBe(label);
  });
});

describe("inspectFileSignature", () => {
  it("reports the real type of a renamed executable", async () => {
    const disguised = makeFile(WINDOWS_EXE_MAGIC, {
      name: "passport.pdf",
      type: "application/pdf",
    });

    const result = await inspectFileSignature(disguised);

    expect(result.detectedMime).toBeNull();
    expect(result.hostileLabel).toBe("Windows executable");
  });
});

// ---------------------------------------------------------------------------
// The acceptance criterion, stated directly.
// ---------------------------------------------------------------------------

describe("validateDocumentFile — the adversarial case", () => {
  it("rejects a renamed .exe that declares itself a PDF", async () => {
    const disguised = makeFile(WINDOWS_EXE_MAGIC, {
      name: "passport.pdf",
      type: "application/pdf",
    });

    // Type check passes. Size check passes. Only the bytes give it away.
    expect(disguised.type).toBe("application/pdf");
    expect(disguised.size).toBeLessThan(MAX_DOCUMENT_BYTES);

    const result = await validateDocumentFile(disguised);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe(REJECTION.SIGNATURE_UNRECOGNISED);
    expect(result.error).toContain("Windows executable");
  });

  it("rejects a PNG renamed to .pdf (declared/actual mismatch)", async () => {
    const mislabelled = makeFile(PNG_MAGIC, {
      name: "certificate.pdf",
      type: "application/pdf",
    });

    const result = await validateDocumentFile(mislabelled);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe(REJECTION.SIGNATURE_MISMATCH);
    expect(result.error).toMatch(/contents are a PNG/i);
  });

  it("rejects a ZIP renamed to .png", async () => {
    const result = await validateDocumentFile(
      makeFile(ZIP_MAGIC, { name: "diploma.png", type: "image/png" })
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain("ZIP or Office archive");
  });
});

describe("validateDocumentFile — type and size gates", () => {
  it("rejects a disallowed declared type outright", async () => {
    const result = await validateDocumentFile(
      makeFile(ZIP_MAGIC, {
        name: "notes.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe(REJECTION.TYPE_NOT_ALLOWED);
  });

  it("rejects a file over the size limit", async () => {
    const oversized = makeFile(PDF_MAGIC, {
      name: "scan.pdf",
      type: "application/pdf",
      size: MAX_DOCUMENT_BYTES + 1,
    });

    const result = await validateDocumentFile(oversized);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe(REJECTION.TOO_LARGE);
    expect(result.error).toContain(formatBytes(MAX_DOCUMENT_BYTES));
  });

  it("rejects an empty file", async () => {
    const result = await validateDocumentFile(
      new File([], "blank.pdf", { type: "application/pdf" })
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe(REJECTION.EMPTY);
  });

  it("rejects a missing file", async () => {
    const result = await validateDocumentFile(null);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(REJECTION.EMPTY);
  });
});

describe("validateDocumentFile — genuine documents pass", () => {
  it.each([
    ["a real PDF", PDF_MAGIC, "id.pdf", "application/pdf", "application/pdf"],
    ["a real JPEG", JPEG_MAGIC, "id.jpg", "image/jpeg", "image/jpeg"],
    ["a real PNG", PNG_MAGIC, "id.png", "image/png", "image/png"],
  ])("accepts %s", async (_label, magic, name, type, expectedMime) => {
    const result = await validateDocumentFile(makeFile(magic, { name, type }));

    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.detectedMime).toBe(expectedMime);
  });

  it("accepts image/jpg as an alias for image/jpeg", async () => {
    const result = await validateDocumentFile(
      makeFile(JPEG_MAGIC, { name: "id.jpg", type: "image/jpg" })
    );

    expect(result.valid).toBe(true);
  });
});
