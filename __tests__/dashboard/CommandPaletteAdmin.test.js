import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { destinationGroups } from "@/components/organisms/dashboard/CommandPalette";

describe("CommandPalette destination groups", () => {
  const admin = destinationGroups.find((g) => g.id === "admin");

  it("marks the admin group as admin-only", () => {
    expect(admin.adminOnly).toBe(true);
    expect(destinationGroups.find((g) => g.id === "goto").adminOnly).toBeFalsy();
  });

  it("only contains /admin routes", () => {
    expect(admin.items.length).toBeGreaterThan(20);
    admin.items.forEach((i) => expect(i.href).toMatch(/^\/admin(\/|$)/));
  });
});
