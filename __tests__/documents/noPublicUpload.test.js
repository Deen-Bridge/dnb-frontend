/**
 * Static guard: verification documents never use the unsigned Cloudinary path
 * ---------------------------------------------------------------------------
 * lib/utils/cloudinaryUpload.js posts to an UNSIGNED upload preset and returns
 * `result.secure_url` — a permanently public asset URL. It is the right tool
 * for a course thumbnail and the wrong tool for a passport scan.
 *
 * A runtime test can only prove that the paths it happens to exercise behave.
 * This file is the lint-style assertion the issue asks for: it reads the
 * verification-document source files and fails if any of them reaches for the
 * unsigned uploader, or grows a public-URL field.
 *
 * If a future change genuinely needs to touch these files, this test is the
 * place that change has to argue with.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Every source file that participates in the document-upload path. */
const DOCUMENT_UPLOAD_SOURCES = [
  "lib/actions/educators/uploadDocument.js",
  "lib/verification/documents/policy.js",
  "lib/verification/documents/fileSignature.js",
  "hooks/useDocumentUpload.js",
  "components/organisms/educator-onboarding/DocumentUpload.jsx",
];

function read(relativePath) {
  const full = resolve(REPO_ROOT, relativePath);
  expect(existsSync(full), `${relativePath} should exist`).toBe(true);
  return readFileSync(full, "utf8");
}

describe("verification documents never use the unsigned Cloudinary preset", () => {
  it.each(DOCUMENT_UPLOAD_SOURCES)(
    "%s does not import the Cloudinary uploader",
    (relativePath) => {
      const source = read(relativePath);

      expect(source).not.toMatch(
        /(?:from\s*|require\(\s*)["'][^"']*cloudinaryUpload["']/
      );
      expect(source).not.toMatch(
        /(?:from\s*|require\(\s*)["'][^"']*useCloudinaryUpload["']/
      );
    }
  );

  it.each(DOCUMENT_UPLOAD_SOURCES)(
    "%s never references an upload preset or api.cloudinary.com",
    (relativePath) => {
      const source = read(relativePath);

      expect(source).not.toContain("upload_preset");
      expect(source).not.toContain("api.cloudinary.com");
      expect(source).not.toContain("dnb_courses_thumbnails");
    }
  );

  it("the upload action never reads or returns a public URL field", () => {
    const source = read("lib/actions/educators/uploadDocument.js");

    // `secure_url` is Cloudinary's public asset URL. It must not appear
    // outside the explanatory comment that says why it is absent.
    const codeOnly = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    expect(codeOnly).not.toContain("secure_url");
    expect(codeOnly).not.toContain("publicUrl");
  });

  it("the upload action sends bytes with a bare axios client, not axiosInstance", () => {
    const source = read("lib/actions/educators/uploadDocument.js");

    // The signed URL points at a third-party storage origin; routing it
    // through axiosInstance would attach the user's bearer token to it.
    expect(source).toMatch(/axios\.request\(/);
    expect(source).toMatch(/withCredentials:\s*false/);
  });
});

describe("the existing Cloudinary path is untouched and still thumbnail-only", () => {
  it("course wizards still use the unsigned preset, which is fine for thumbnails", () => {
    const wizard = read("components/organisms/create/course-wizard.jsx");

    expect(wizard).toContain("useCloudinaryUpload");
  });

  it("no verification surface imports the Cloudinary hook", () => {
    const verificationSurfaces = [
      "components/organisms/educator-onboarding/DocumentUpload.jsx",
      "components/organisms/educator-onboarding/LivenessCapture.jsx",
      "components/organisms/educator-onboarding/LivenessConsent.jsx",
    ].filter((path) => existsSync(resolve(REPO_ROOT, path)));

    for (const path of verificationSurfaces) {
      expect(read(path)).not.toContain("Cloudinary");
    }
  });
});
