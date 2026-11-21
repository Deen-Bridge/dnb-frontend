import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const script = join(dirname(fileURLToPath(import.meta.url)), "validate-mobile-config.mjs");

test("development profile permits local defaults", () => {
  const result = spawnSync(process.execPath, [script], { env: { ...process.env, EXPO_PUBLIC_BUILD_PROFILE: "development" } });
  assert.equal(result.status, 0);
});

test("production profile rejects local and testnet values", () => {
  const result = spawnSync(process.execPath, [script], { env: { ...process.env, EXPO_PUBLIC_BUILD_PROFILE: "production", EXPO_PUBLIC_API_URL: "http://localhost:5000", EXPO_PUBLIC_AI_API_URL: "http://localhost:8000", EXPO_PUBLIC_STELLAR_NETWORK: "testnet", EXPO_PUBLIC_JITSI_DOMAIN: "https://meet.jit.si", EXPO_PUBLIC_JITSI_REQUIRE_JWT: "false" } });
  assert.notEqual(result.status, 0);
});
