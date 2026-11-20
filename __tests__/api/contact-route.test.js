import { afterEach, describe, expect, it, vi } from "vitest";

const { POST, __resetContactState } = await import("../../app/api/contact/route.js");

const request = (body, headers = {}) => new Request("http://localhost/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});

const valid = { name: "Amina", email: "amina@example.com", topic: "General enquiry", message: "Please help." };

afterEach(() => {
  delete process.env.SUPPORT_CONTACT_WEBHOOK_URL;
  vi.restoreAllMocks();
  __resetContactState();
});

describe("contact route", () => {
  it("rejects invalid input without calling a provider", async () => {
    const response = await POST(request({ ...valid, email: "not-an-email" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false });
  });

  it("returns a truthful outage when the provider is not configured", async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/unavailable/i);
  });

  it("forwards only the contract payload and deduplicates retries", async () => {
    process.env.SUPPORT_CONTACT_WEBHOOK_URL = "https://support.example.test/intake";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 202 }));
    const headers = { "Idempotency-Key": "request-1" };
    const first = await POST(request(valid, headers));
    const second = await POST(request(valid, headers));
    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject(valid);
  });
});
