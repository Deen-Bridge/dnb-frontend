import { describe, it, expect, beforeAll } from "vitest";
import { educatorApplicationSchema } from "./educator-application";

describe("educatorApplicationSchema", () => {
  beforeAll(() => {
    if (typeof globalThis.File === "undefined") {
      globalThis.File = class File {};
    }
  });

  const file = () => new File(["x"], "doc.png", { type: "image/png" });

  const valid = () => ({
    fullName: "Salem Alharthi",
    linkedinUrl: "https://linkedin.com/in/salem",
    livenessToken: "liveness_tok_123",
    governmentIdFile: file(),
    teachingCertificateFile: file(),
  });

  it("accepts a complete application", () => {
    const result = educatorApplicationSchema.safeParse(valid());
    expect(result.success).toBe(true);
  });

  it("accepts previously-uploaded document references in place of files", () => {
    const result = educatorApplicationSchema.safeParse({
      ...valid(),
      governmentIdFile: null,
      governmentIdUrl: "doc_gov_123",
      teachingCertificateFile: null,
      teachingCertificateUrl: "doc_cert_123",
    });
    expect(result.success).toBe(true);
  });

  it("requires a valid LinkedIn URL", () => {
    const bad = educatorApplicationSchema.safeParse({
      ...valid(),
      linkedinUrl: "not-a-url",
    });
    expect(bad.success).toBe(false);

    const missing = educatorApplicationSchema.safeParse({
      ...valid(),
      linkedinUrl: "",
    });
    expect(missing.success).toBe(false);
  });

  it("requires a liveness token", () => {
    const result = educatorApplicationSchema.safeParse({
      ...valid(),
      livenessToken: "",
    });
    expect(result.success).toBe(false);
    expect(
      result.success === false &&
        result.error.issues.some((i) => i.path.includes("livenessToken"))
    ).toBe(true);
  });

  it("requires a government ID (file or reference)", () => {
    const result = educatorApplicationSchema.safeParse({
      ...valid(),
      governmentIdFile: null,
      governmentIdUrl: "",
    });
    expect(result.success).toBe(false);
    expect(
      result.success === false &&
        result.error.issues.some((i) => i.path.includes("governmentIdFile"))
    ).toBe(true);
  });

  it("requires a teaching certificate (file or reference)", () => {
    const result = educatorApplicationSchema.safeParse({
      ...valid(),
      teachingCertificateFile: null,
      teachingCertificateUrl: "",
    });
    expect(result.success).toBe(false);
    expect(
      result.success === false &&
        result.error.issues.some((i) => i.path.includes("teachingCertificateFile"))
    ).toBe(true);
  });

  it("requires a full name", () => {
    const result = educatorApplicationSchema.safeParse({ ...valid(), fullName: "" });
    expect(result.success).toBe(false);
  });
});
