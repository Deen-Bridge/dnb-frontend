import { describe, expect, it } from "vitest";
import { externalLinkProps, safeExternalUrl } from "@/lib/security/safe-external-url";

describe("safe external URL policy", () => {
  it("allows HTTPS and protects new tabs", () => {
    expect(safeExternalUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(externalLinkProps("https://example.com")).toMatchObject({ target: "_blank", rel: "noopener noreferrer", referrerPolicy: "no-referrer" });
  });

  it("rejects executable schemes and malformed values", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(externalLinkProps("not a URL")).toBeNull();
  });
});
