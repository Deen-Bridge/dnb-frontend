import { describe, expect, it } from "vitest";
import { assertTargetMatchesFile } from "@/lib/utils/cloudinaryUpload";

const target = (overrides = {}) => ({
  url: "https://upload.example.test/target",
  assetId: "asset_123",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  constraints: { kind: "course-thumbnail", maxBytes: 1_000_000, mimeTypes: ["image/*"], folder: "courses/u1" },
  ...overrides,
});

describe("governed upload targets", () => {
  it("rejects a target for another resource or folder", () => {
    const file = new File(["image"], "cover.png", { type: "image/png" });
    expect(() => assertTargetMatchesFile(target({ constraints: { ...target().constraints, kind: "reel-poster" } }), file, { kind: "course-thumbnail", size: file.size, mimeType: file.type })).toThrow(/authorized/);
    expect(() => assertTargetMatchesFile(target({ constraints: { ...target().constraints, folder: "" } }), file, { kind: "course-thumbnail", size: file.size, mimeType: file.type })).toThrow(/authorized/);
  });

  it("rejects an expired target and a file that exceeds the server limit", () => {
    const file = new File(["too-large"], "cover.png", { type: "image/png" });
    expect(() => assertTargetMatchesFile(target({ expiresAt: new Date(Date.now() - 1).toISOString() }), file, { kind: "course-thumbnail", size: file.size, mimeType: file.type })).toThrow(/expired/);
    expect(() => assertTargetMatchesFile(target({ constraints: { ...target().constraints, maxBytes: 1 } }), file, { kind: "course-thumbnail", size: file.size, mimeType: file.type })).toThrow(/size/);
  });
});
