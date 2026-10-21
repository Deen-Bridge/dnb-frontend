import { describe, it, expect } from "vitest";
import {
  parseUserFilters,
  serializeUserFilters,
  toApiParams,
  getActiveChips,
} from "@/lib/admin/user-filters";

describe("user-filters", () => {
  it("parses and drops invalid values", () => {
    const f = parseUserFilters(
      new URLSearchParams("q=%20ali%20&role=boss&status=banned&from=2025-01-02&to=bad")
    );
    expect(f).toEqual({ q: "ali", role: "", status: "banned", from: "2025-01-02", to: "" });
  });

  it("round-trips and omits empties", () => {
    const f = { q: "x", role: "mentor", status: "", from: "", to: "2025-02-01" };
    expect(serializeUserFilters(f).toString()).toBe("q=x&role=mentor&to=2025-02-01");
    expect(toApiParams(f)).toEqual({ search: "x", role: "mentor", createdTo: "2025-02-01" });
    expect(getActiveChips(f).map((c) => c.key)).toEqual(["q", "role", "to"]);
  });
});
