import { describe, expect, it } from "vitest";

describe("maintenance control-plane contract", () => {
  it("does not retain a browser-local store or client actor", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync("lib/actions/admin-maintenance.js", "utf8");
    expect(source).toContain("axiosInstance.get");
    expect(source).toContain("axiosInstance.put");
    expect(source).not.toContain("mockMaintenance");
    expect(source).not.toContain("payload.actor");
  });
});
