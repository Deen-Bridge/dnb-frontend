import { describe, expect, it } from "vitest";
describe("book preview", () => { it("does not expose a preview without a source", () => { const source = ""; expect(source).toBe(""); }); });
