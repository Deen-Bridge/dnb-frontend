import { beforeEach, describe, expect, it } from "vitest";
import {
  getTelemetryConsent,
  scrubBrowserTelemetryPayload,
  setTelemetryConsent,
} from "@/lib/privacy/scrubTelemetryPayload";
import { scrubSentryEvent } from "@/lib/sentry/pii";

describe("client telemetry privacy boundary", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to denied and supports withdrawal", () => {
    expect(getTelemetryConsent()).toBe("denied");
    setTelemetryConsent("granted");
    expect(getTelemetryConsent()).toBe("granted");
    setTelemetryConsent("denied");
    expect(getTelemetryConsent()).toBe("denied");
  });

  it("scrubs sensitive payload values and URLs", () => {
    expect(
      scrubBrowserTelemetryPayload({
        email: "person@example.com",
        page: "https://example.test/private?token=secret",
        message: "private message",
      }),
    ).toEqual({
      email: "[REDACTED]",
      page: "[REDACTED_URL]",
      message: "[REDACTED]",
    });
  });

  it("removes paths, queries, messages, and auth data from Sentry events", () => {
    const event = scrubSentryEvent({
      request: {
        url: "https://example.test/admin/users?email=person@example.com",
        query_string: "email=person@example.com",
        headers: { Authorization: "Bearer secret", Cookie: "authToken=secret" },
        data: "private message",
      },
      message: "private message",
      user: { id: "account-1", email: "person@example.com" },
      breadcrumbs: [{ message: "private route", data: { url: "/secret" } }],
      exception: { values: [{ type: "Error", value: "private message" }] },
    });

    expect(event.request).toBeUndefined();
    expect(event.message).toBeUndefined();
    expect(event.user).toEqual({ id: "account-1" });
    expect(event.breadcrumbs[0]).toEqual({ data: { url: "[redacted]" } });
    expect(event.exception.values).toEqual([{ type: "Error" }]);
  });
});
