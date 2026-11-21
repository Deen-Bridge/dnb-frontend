import { describe, expect, it } from "vitest";

describe("profile content state contract", () => {
  it("does not use the shipped placeholder copy", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("components/organisms/account/profile/ProfileContent.jsx", "utf8");
    expect(source).not.toContain("Stay tuned");
    expect(source).toContain("profileId");
    expect(source).toContain("aria-live=\"polite\"");
    expect(source).toContain('This profile is unavailable.');
    expect(source).toContain('<Placeholder title="books" profileId={profileId} />');
  });
});
