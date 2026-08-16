import { describe, it, expect, beforeAll } from "vitest";
import {
  buildDraftStorageKey,
  serializeDraftValues,
  isFile,
  DEFAULT_PREFIX,
} from "./draft-serialization";

describe("buildDraftStorageKey", () => {
  it("namespaces drafts per user", () => {
    expect(buildDraftStorageKey("user1")).toBe(`${DEFAULT_PREFIX}user1`);
    expect(buildDraftStorageKey("user2")).toBe(`${DEFAULT_PREFIX}user2`);
  });

  it("appends an optional id discriminator", () => {
    expect(buildDraftStorageKey("user1", "course123")).toBe(
      `${DEFAULT_PREFIX}user1_course123`
    );
  });

  it("accepts a custom prefix", () => {
    expect(buildDraftStorageKey("user1", null, "dnb_educator_")).toBe(
      "dnb_educator_user1"
    );
  });

  it("falls back to anon when no user id", () => {
    expect(buildDraftStorageKey(null)).toBe(`${DEFAULT_PREFIX}anon`);
    expect(buildDraftStorageKey(undefined)).toBe(`${DEFAULT_PREFIX}anon`);
  });
});

describe("serializeDraftValues", () => {
  beforeAll(() => {
    // Node 20+ provides a global File; stub one when running on older runtimes.
    if (typeof globalThis.File === "undefined") {
      globalThis.File = class File {
        constructor() {
          this.name = "mock.png";
        }
      };
    }
  });

  it("preserves plain JSON-serializable values", () => {
    const out = serializeDraftValues({
      fullName: "Salem",
      linkedinUrl: "https://linkedin.com/in/salem",
      currentStep: 2,
      tags: ["a", "b"],
    });
    expect(out).toEqual({
      fullName: "Salem",
      linkedinUrl: "https://linkedin.com/in/salem",
      currentStep: 2,
      tags: ["a", "b"],
    });
  });

  it("strips File objects so they never round-trip as mock media", () => {
    const file = new File(["x"], "id.png", { type: "image/png" });
    expect(isFile(file)).toBe(true);

    const out = serializeDraftValues({
      governmentIdFile: file,
      teachingCertificateFile: file,
      fullName: "Salem",
    });

    expect(out.governmentIdFile).toBeNull();
    expect(out.teachingCertificateFile).toBeNull();
    expect(out.fullName).toBe("Salem");
  });

  it("returns an object for nullish input", () => {
    expect(serializeDraftValues(undefined)).toEqual({});
  });
});
