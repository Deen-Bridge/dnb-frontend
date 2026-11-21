import { beforeEach, describe, expect, it, vi } from "vitest";
import { scrubSentryEvent } from "@/lib/sentry/pii";

const sensitiveFixture = {
  request: {
    headers: { Authorization: "Bearer header-secret", cookie: "sid=cookie-secret" },
    cookies: { sid: "cookie-secret" },
    query_string: "token=query-secret&email=learner@example.com",
    data: JSON.stringify({ nested: [{ refreshToken: "refresh-secret", phone: "+1 (555) 123-4567" }] }),
  },
  user: { id: "safe-user-id", email: "learner@example.com", phone: "+15551234567" },
  extra: {
    response: { paymentId: "payment-secret", profile: { email: "learner@example.com" } },
    learning: [{ prompt: "private prompt", answer: "private answer" }],
  },
  breadcrumbs: [{ message: "submitted learner@example.com", data: { nested: [{ token: "crumb-secret" }] } }],
  exception: { values: [{ value: "failed for learner@example.com", data: { apiKey: "api-secret" } }] },
};

describe("scrubSentryEvent", () => {
  it("scrubs nested objects, arrays, serialized JSON, query strings, and metadata", () => {
    const result = scrubSentryEvent(sensitiveFixture) as Record<string, unknown>;
    const serialized = JSON.stringify(result);
    for (const secret of [
      "header-secret", "cookie-secret", "query-secret", "learner@example.com", "refresh-secret",
      "+1 (555) 123-4567", "payment-secret", "private prompt", "private answer", "crumb-secret", "api-secret",
    ]) expect(serialized).not.toContain(secret);
    expect(serialized).toContain("safe-user-id");
    expect((result.request as Record<string, unknown>).cookies).toEqual({});
  });

  it("bounds recursive traversal", () => {
    let value: Record<string, unknown> = { token: "secret" };
    for (let index = 0; index < 20; index += 1) value = { nested: value };
    expect(JSON.stringify(scrubSentryEvent({ extra: value }))).not.toContain("secret");
  });
});

describe("Sentry beforeSend hooks", () => {
  beforeEach(() => vi.resetModules());

  it.each(["client", "server", "edge"])("uses the scrubber in the %s config", async (target) => {
    const init = vi.fn();
    vi.doMock("@sentry/nextjs", () => ({ init }));
    await import(`../../sentry.${target}.config.js`);
    const options = init.mock.calls[0]?.[0] as { beforeSend?: (event: unknown) => unknown };
    expect(options.beforeSend).toBeTypeOf("function");
    expect(JSON.stringify(options.beforeSend?.(sensitiveFixture))).not.toContain("header-secret");
  });
});
