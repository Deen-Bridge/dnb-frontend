import { describe, it, expect } from "vitest";
import {
  assertNoUploadPreset,
  buildSignedUploadRequest,
} from "./signed-upload";

describe("assertNoUploadPreset", () => {
  it("rejects any payload carrying an upload preset (case-insensitive)", () => {
    expect(() => assertNoUploadPreset({ upload_preset: "dnb_courses" })).toThrow(
      /unsigned upload preset/
    );
    expect(() =>
      assertNoUploadPreset({ UPLOAD_PRESET: "dnb_courses" })
    ).toThrow(/unsigned upload preset/);
  });

  it("allows signed credentials with no preset", () => {
    const creds = { uploadUrl: "https://signed.example", publicId: "doc_1" };
    expect(assertNoUploadPreset(creds)).toBe(creds);
  });
});

describe("buildSignedUploadRequest", () => {
  it("builds a signed PUT request with no preset", () => {
    const file = { type: "image/png" };
    const request = buildSignedUploadRequest(file, {
      uploadUrl: "https://api.cloudinary.com/signed/abc",
      publicId: "doc_1",
    });

    expect(request.url).toBe("https://api.cloudinary.com/signed/abc");
    expect(request.method).toBe("PUT");
    expect(request.body).toBe(file);
    expect(request.publicId).toBe("doc_1");
    expect(request.headers["Content-Type"]).toBe("image/png");
    // The signed flow must never include an unsigned preset.
    expect(Object.keys(request).map((k) => k.toLowerCase())).not.toContain(
      "upload_preset"
    );
  });

  it("requires an uploadUrl", () => {
    expect(() => buildSignedUploadRequest({ type: "image/png" }, {})).toThrow(
      /signed upload URL/
    );
  });
});
