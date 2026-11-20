import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/components/seo/JsonLd";

describe("JSON-LD serialization", () => {
  it("escapes script-breaking HTML characters and separators", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>", text: "a\u2028b\u2029c & >" });
    expect(output).toContain("\\u003c/script\\u003e");
    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u2028");
    expect(output).toContain("\\u2029");
    expect(output).toContain("\\u0026");
  });
});
