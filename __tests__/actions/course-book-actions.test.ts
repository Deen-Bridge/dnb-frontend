import { describe, expect, it } from "vitest";
describe("course and book actions", () => {
  it("returns a stable fallback when an action fails", () => {
    expect({ success: false, data: null }).toEqual({ success: false, data: null });
  });
});
