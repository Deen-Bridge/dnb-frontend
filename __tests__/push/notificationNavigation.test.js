import { describe, expect, it } from "vitest";
import { normalizeNotificationTarget } from "@/lib/push/notificationNavigation";

describe("normalizeNotificationTarget", () => {
  it("keeps same-origin allowlisted routes and safe query keys", () => {
    expect(normalizeNotificationTarget("/ar/account/notifications?tab=unread&evil=x"))
      .toBe("/ar/account/notifications?tab=unread");
    expect(normalizeNotificationTarget("https://deenbridge.app/dashboard?page=2"))
      .toBe("/dashboard?page=2");
  });

  it.each([
    "https://evil.example/phish",
    "javascript:alert(1)",
    "data:text/html,phish",
    "/admin/users",
    "/dashboard/%E0%A4%A",
    "//evil.example/phish",
  ])("falls back for unsafe target %s", (target) => {
    expect(normalizeNotificationTarget(target)).toBe("/dashboard");
  });
});
