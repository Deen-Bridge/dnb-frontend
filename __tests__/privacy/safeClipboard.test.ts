import { canCopyToClipboard } from "@/lib/privacy/safeClipboard";

describe("safe clipboard policy", () => {
  it("allows intentionally public values", () => {
    expect(canCopyToClipboard("GABC123", "public")).toBe(true);
  });

  it("rejects sensitive classifications and secret-like values", () => {
    expect(canCopyToClipboard("value", "sensitive")).toBe(false);
    expect(canCopyToClipboard("api_key", "public")).toBe(false);
    expect(canCopyToClipboard("private-key", "authenticated")).toBe(false);
  });
});
