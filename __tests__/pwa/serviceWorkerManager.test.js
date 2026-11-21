import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activateWaitingServiceWorker,
  isServiceWorkerSupported,
  registerServiceWorker,
  SERVICE_WORKER_PATH,
  unregisterServiceWorker,
} from "@/lib/pwa/serviceWorkerManager";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("service worker update contract", () => {
  it("uses one cache-bypassing registration path", async () => {
    const register = vi.fn().mockResolvedValue({
      installing: null,
      addEventListener: vi.fn(),
    });
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    await registerServiceWorker();

    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_PATH, {
      updateViaCache: "none",
    });
  });

  it("does not activate an update without an explicitly waiting worker", () => {
    expect(activateWaitingServiceWorker({})).toBe(false);
  });

  it("only asks the waiting worker to activate after user confirmation", () => {
    const postMessage = vi.fn();
    expect(activateWaitingServiceWorker({ waiting: { postMessage } })).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });

  it("reports unsupported browsers without attempting registration", async () => {
    vi.stubGlobal("navigator", {});
    expect(isServiceWorkerSupported()).toBe(false);
    await expect(registerServiceWorker()).resolves.toBeNull();
  });

  it("can unregister only the authoritative worker during rollback", async () => {
    const unregister = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistrations: vi.fn().mockResolvedValue([
          { active: { scriptURL: "https://example.test/sw.js" }, unregister },
          { active: { scriptURL: "https://example.test/firebase-messaging-sw.js" }, unregister: vi.fn() },
        ]),
      },
    });

    await expect(unregisterServiceWorker()).resolves.toBe(true);
    expect(unregister).toHaveBeenCalledOnce();
  });
});
