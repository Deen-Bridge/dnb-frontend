import { describe, expect, it } from "vitest";
import { sanitizeAnnouncementHtml, sanitizeAnnouncementUrl } from "@/lib/security/sanitize-announcement-html";

describe("announcement content safety", () => {
  it("removes executable markup and unsafe links while preserving supported text", () => {
    const result = sanitizeAnnouncementHtml('<p>Hello <strong>team</strong></p><script>alert(1)</script><a href="javascript:alert(1)">open</a>');
    expect(result).toContain("Hello <strong>team</strong>");
    expect(result).not.toContain("script");
    expect(result).not.toContain("javascript:");
  });

  it("allows secure same-site links and rejects external or dangerous schemes", () => {
    expect(sanitizeAnnouncementUrl("/help#security")).toBe("/help#security");
    expect(sanitizeAnnouncementUrl("https://example.com/phishing")).toBeNull();
    expect(sanitizeAnnouncementUrl("javascript:alert(1)")).toBeNull();
  });
});
