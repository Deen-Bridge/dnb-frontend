#!/usr/bin/env node

const env = process.env;
const profile = env.EXPO_PUBLIC_BUILD_PROFILE ?? env.EAS_BUILD_PROFILE ?? "development";
const release = profile === "preview" || profile === "production";
const errors = [];
const value = (name) => (env[name] ?? "").trim();
const required = ["EXPO_PUBLIC_API_URL", "EXPO_PUBLIC_AI_API_URL", "EXPO_PUBLIC_USDC_ISSUER", "EXPO_PUBLIC_FIREBASE_API_KEY", "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", "EXPO_PUBLIC_FIREBASE_PROJECT_ID", "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "EXPO_PUBLIC_FIREBASE_APP_ID"];
const placeholder = /^(?:your[_-]|change[_-]?me|example|placeholder|test)/i;
if (!["development", "preview", "production"].includes(profile)) errors.push("EXPO_PUBLIC_BUILD_PROFILE must be development, preview, or production");
if (release) {
  for (const name of required) if (!value(name) || placeholder.test(value(name))) errors.push(`${name} is required for release builds`);
  for (const name of ["EXPO_PUBLIC_API_URL", "EXPO_PUBLIC_AI_API_URL"]) if (!/^https:\/\//i.test(value(name)) || /localhost|127\.0\.0\.1/i.test(value(name))) errors.push(`${name} must be a non-local HTTPS URL`);
  if (value("EXPO_PUBLIC_STELLAR_NETWORK").toLowerCase() !== "mainnet") errors.push("EXPO_PUBLIC_STELLAR_NETWORK must be mainnet");
  if (!value("EXPO_PUBLIC_JITSI_DOMAIN") || /meet\.jit\.si|localhost|127\.0\.0\.1/i.test(value("EXPO_PUBLIC_JITSI_DOMAIN"))) errors.push("EXPO_PUBLIC_JITSI_DOMAIN must be a private non-local domain");
  if (value("EXPO_PUBLIC_JITSI_REQUIRE_JWT").toLowerCase() !== "true") errors.push("EXPO_PUBLIC_JITSI_REQUIRE_JWT must be true");
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(JSON.stringify({ profile, release, stellarNetwork: value("EXPO_PUBLIC_STELLAR_NETWORK") || "testnet", checks: "passed" }));
