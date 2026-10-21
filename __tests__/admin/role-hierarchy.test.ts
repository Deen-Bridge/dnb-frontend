import { describe, it, expect } from "vitest";
import { canModerateUser } from "@/lib/admin/role-hierarchy";

describe("canModerateUser", () => {
  it("allows moderating strictly lower roles", () => {
    expect(canModerateUser("admin", "student")).toBe(true);
    expect(canModerateUser("admin", "educator")).toBe(true);
  });
  it("blocks equal or higher roles", () => {
    expect(canModerateUser("admin", "admin")).toBe(false);
    expect(canModerateUser("mentor", "admin")).toBe(false);
  });
});
