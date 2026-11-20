import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const managedKeys = [
  "NODE_ENV",
  "NEXT_PUBLIC_APP_ENV",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_AI_API_URL",
  "NEXT_PUBLIC_STELLAR_NETWORK",
  "NEXT_PUBLIC_DONATION_WALLET",
  "NEXT_PUBLIC_USDC_ISSUER",
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_JITSI_DOMAIN",
  "NEXT_PUBLIC_JITSI_REQUIRE_JWT",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
  "NEXT_PUBLIC_LIVENESS_PROVIDER",
] as const;

const originalEnv = Object.fromEntries(
  managedKeys.map((key) => [key, process.env[key]])
);

function setEnv(values: Record<string, string>): void {
  for (const key of managedKeys) delete process.env[key];
  Object.assign(process.env, values);
}

function validStrictEnv(profile: "staging" | "production" = "production") {
  return {
    NODE_ENV: profile === "production" ? "production" : "test",
    NEXT_PUBLIC_APP_ENV: profile,
    NEXT_PUBLIC_API_URL: "https://api.example.com",
    NEXT_PUBLIC_AI_API_URL: "https://ai.example.com",
    NEXT_PUBLIC_STELLAR_NETWORK: "mainnet",
    NEXT_PUBLIC_DONATION_WALLET: "GABC123",
    NEXT_PUBLIC_USDC_ISSUER: "GISSUER123",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: "client.apps.googleusercontent.com",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "deenbridge",
    NEXT_PUBLIC_JITSI_DOMAIN: "https://video.example.com",
    NEXT_PUBLIC_JITSI_REQUIRE_JWT: "true",
    NEXT_PUBLIC_FIREBASE_API_KEY: "public-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "deenbridge.example.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "deenbridge",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "deenbridge.example.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123",
    NEXT_PUBLIC_FIREBASE_APP_ID: "app-id",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "measurement-id",
    NEXT_PUBLIC_LIVENESS_PROVIDER: "persona",
  };
}

describe("runtime environment profiles", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of managedKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else Object.assign(process.env, { [key]: value });
    }
  });

  it("keeps local defaults available only to development", async () => {
    setEnv({ NODE_ENV: "test", NEXT_PUBLIC_APP_ENV: "development" });

    const { config } = await import("@/lib/config/env");

    expect(config.apiUrl).toBe("http://localhost:5001");
    expect(config.aiApiUrl).toBe("http://localhost:8000");
    expect(config.stellarNetwork).toBe("testnet");
    expect(config.diagnostics).toMatchObject({
      profile: "development",
      strict: false,
      configured: { api: false, ai: false, stellar: false, video: false, identity: false },
    });
  });

  it("rejects unsafe staging values without exposing their contents", async () => {
    setEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_APP_ENV: "staging",
      NEXT_PUBLIC_API_URL: "http://localhost:5001",
      NEXT_PUBLIC_AI_API_URL: "http://localhost:8000",
      NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
      NEXT_PUBLIC_JITSI_REQUIRE_JWT: "false",
      NEXT_PUBLIC_LIVENESS_PROVIDER: "mock",
    });

    await expect(import("@/lib/config/env")).rejects.toThrow(
      /staging runtime configuration is unsafe or incomplete/,
    );
    await expect(import("@/lib/config/env")).rejects.not.toThrow("localhost:5001");
  });

  it("rejects missing production configuration during module initialization", async () => {
    setEnv({ NODE_ENV: "production" });

    await expect(import("@/lib/config/env")).rejects.toThrow(
      /production runtime configuration is unsafe or incomplete/,
    );
  });

  it("accepts a complete strict profile and returns redacted diagnostics", async () => {
    setEnv(validStrictEnv());

    const { config } = await import("@/lib/config/env");

    expect(config.runtimeProfile).toBe("production");
    expect(config.diagnostics).toEqual({
      profile: "production",
      strict: true,
      configured: { api: true, ai: true, stellar: true, video: true, identity: true },
    });
    expect(JSON.stringify(config.diagnostics)).not.toContain("api.example.com");
  });
});
