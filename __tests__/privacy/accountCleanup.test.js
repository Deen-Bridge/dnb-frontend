import { describe, expect, it, vi } from "vitest";
import { clearClientAccountData } from "@/lib/privacy/accountCleanup";

describe("clearClientAccountData", () => {
  it("removes account data, caches, service workers, and push state", async () => {
    localStorage.setItem("dnb:book-progress:1", "draft");
    localStorage.setItem("appearance-theme", "dark");
    sessionStorage.setItem("dnb:session", "secret");
    const deleteCache = vi.fn().mockResolvedValue(true);
    const unregister = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("caches", {
      keys: vi.fn().mockResolvedValue(["deenbridge-pages"]),
      delete: deleteCache,
    });
    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistrations: vi.fn().mockResolvedValue([{ unregister }]),
      },
    });
    const unsubscribePush = vi.fn().mockResolvedValue(undefined);

    const result = await clearClientAccountData({ unsubscribePush });

    expect(localStorage.getItem("dnb:book-progress:1")).toBeNull();
    expect(localStorage.getItem("appearance-theme")).toBe("dark");
    expect(sessionStorage.length).toBe(0);
    expect(deleteCache).toHaveBeenCalledWith("deenbridge-pages");
    expect(unregister).toHaveBeenCalledOnce();
    expect(unsubscribePush).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ push: true, caches: 1, serviceWorkers: 1 });
  });
});
