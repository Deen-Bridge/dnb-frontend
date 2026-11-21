import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, cachedFetch, setCacheScope, smartCache } from "@/lib/utils/cache";

const cacheKey = "cached-fetch:error-contract";
const url = "https://api.example.test/profile";

function response(overrides: Partial<Response>): Response {
  return {
    ok: true,
    status: 200,
    json: vi.fn(),
    ...overrides,
  } as unknown as Response;
}

describe("cachedFetch error contract", () => {
  beforeEach(() => {
    setCacheScope(null);
    smartCache.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setCacheScope(null);
    smartCache.clear();
  });

  it("rejects unsuccessful HTTP responses without caching fallback data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ ok: false, status: 403 })));

    await expect(cachedFetch(url, { cacheKey, forceRefresh: true })).rejects.toMatchObject({
      name: "ApiRequestError",
      status: 403,
      code: "UNAUTHORIZED",
    } satisfies Partial<ApiRequestError>);
    expect(smartCache.get(cacheKey)).toBeNull();
  });

  it("reports malformed JSON without caching it", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response({ json: vi.fn().mockRejectedValue(new SyntaxError("invalid JSON")) })
      )
    );

    await expect(cachedFetch(url, { cacheKey, forceRefresh: true })).rejects.toMatchObject({
      name: "ApiRequestError",
      status: null,
      code: "MALFORMED_RESPONSE",
    });
    expect(smartCache.get(cacheKey)).toBeNull();
  });

  it("preserves successful empty responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ json: vi.fn().mockResolvedValue([]) })));

    await expect(cachedFetch(url, { cacheKey, forceRefresh: true })).resolves.toEqual([]);
  });
});
