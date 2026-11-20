import { minimizeAnalyticsPayload } from "@/lib/privacy/analyticsConsent";

describe("analytics consent payload policy", () => {
  it("removes sensitive fields before optional telemetry", () => {
    expect(minimizeAnalyticsPayload({ action: "view", wallet: "G...", search: "fiqh" }))
      .toEqual({ action: "view", search: "fiqh" });
  });
});
