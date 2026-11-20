import { describe, expect, it } from "vitest";
import { validateManifest } from "../../scripts/check-type-boundary-ownership.mjs";

describe("type-boundary ownership", () => {
  it("requires one active owner for every baseline file", () => {
    const baseline = { files: { "hooks/useExample.ts": 1 } };
    const manifest = {
      entries: [{ pattern: "hooks/**", owner: "team", issue: 785, expires: "2027-01-01" }],
    };

    expect(validateManifest(baseline, manifest, new Date("2026-11-20T00:00:00Z"))).toEqual([]);
  });

  it("rejects missing ownership and expired entries", () => {
    const baseline = { files: { "hooks/useExample.ts": 1, "lib/api.ts": 1 } };
    const manifest = {
      entries: [{ pattern: "hooks/**", owner: "team", issue: 785, expires: "2026-01-01" }],
    };

    expect(validateManifest(baseline, manifest, new Date("2026-11-20T00:00:00Z"))).toHaveLength(2);
  });
});
