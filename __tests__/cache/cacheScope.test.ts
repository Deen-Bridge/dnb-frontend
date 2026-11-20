import { afterEach, describe, expect, it } from "vitest";
import { getCacheScope, setCacheScope, smartCache } from "@/lib/utils/cache";

describe("authenticated cache scope", () => {
  afterEach(() => setCacheScope(null));

  it("clears the previous account when the scope changes", () => {
    setCacheScope("account-a");
    smartCache.set("chat:history:reused", { owner: "a" });
    setCacheScope("account-b");

    expect(getCacheScope()).toBe("account-b");
    expect(smartCache.get("chat:history:reused")).toBeNull();
  });

  it("does not let public scope read account data", () => {
    setCacheScope("account-a");
    smartCache.set("profile:reused", { owner: "a" });
    setCacheScope(null);

    expect(smartCache.get("profile:reused")).toBeNull();
  });
});
