import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("lib/logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("silences debug/info in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    logger.debug("dev only");
    logger.info("dev only");

    expect(debug).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
  });

  it("emits debug/info outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    logger.debug("dev only");
    logger.info("dev only");

    expect(debug).toHaveBeenCalledWith("dev only");
    expect(info).toHaveBeenCalledWith("dev only");
  });

  it("always emits warn/error, including in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.warn("still visible");
    logger.error("still visible");

    expect(warn).toHaveBeenCalledWith("still visible");
    expect(error).toHaveBeenCalledWith("still visible");
  });

  it("forwards errors passed to logger.error to Sentry", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("boom");

    logger.error("failed:", failure);

    // logger.error stays synchronous; the Sentry forward happens on the next
    // tick via a dynamic import.
    await vi.waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(failure);
    });
  });

  it("wraps plain messages before forwarding them to Sentry", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error("something failed");

    await vi.waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: "something failed" })
      );
    });
  });

  it("does not forward non-error payloads to Sentry", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.spyOn(console, "error").mockImplementation(() => {});

    logger.error({ statusCode: 500 });

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});