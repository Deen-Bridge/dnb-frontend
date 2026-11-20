#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = JSON.parse(readFileSync(path.join(root, "app.json"), "utf8")).expo;
const eas = JSON.parse(readFileSync(path.join(root, "eas.json"), "utf8"));
const errors = [];
if (!/^\d+\.\d+\.\d+$/.test(app.version)) errors.push("expo.version must be semver");
if (!app.ios?.bundleIdentifier) errors.push("ios.bundleIdentifier is required");
if (!app.android?.package) errors.push("android.package is required");
for (const profile of ["development", "preview", "production"]) {
  if (!eas.build?.[profile]) errors.push(`eas build profile ${profile} is required`);
}
if (eas.submit?.production?.android?.serviceAccountKeyPath === "./google-services.json") {
  console.log("Release config: Android signing path is declared but credentials remain external to the repository.");
}
if (errors.length) {
  console.error(errors.map((error) => `  - ${error}`).join("\n"));
  process.exitCode = 1;
} else console.log("Release config validation passed; signing secrets are not read or printed.");
