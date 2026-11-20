import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const mobileRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(mobileRoot, "..");
const production = process.argv.includes("--production");
const errors = [];

function readJson(relativePath) {
  try {
    return JSON.parse(readFileSync(resolve(mobileRoot, relativePath), "utf8"));
  } catch (error) {
    errors.push(`Cannot read ${relativePath}: ${error.message}`);
    return {};
  }
}

const app = readJson("app.json").expo ?? {};
const eas = readJson("eas.json");
const permissions = app.android?.permissions ?? [];

if (JSON.stringify(permissions) !== JSON.stringify(["CAMERA"])) {
  errors.push("Android permissions must remain exactly CAMERA.");
}

const cameraCopy = app.ios?.infoPlist?.NSCameraUsageDescription ?? "";
const photoCopy = app.ios?.infoPlist?.NSPhotoLibraryUsageDescription ?? "";
if (!/camera|liveness/i.test(cameraCopy) || !/profile photo/i.test(cameraCopy)) {
  errors.push("iOS camera permission copy must describe liveness and profile-photo capture.");
}
if (!/photo library/i.test(photoCopy) || !/profile photo/i.test(photoCopy)) {
  errors.push("iOS photo-library permission copy must describe profile-photo selection.");
}

const expectedSecrets = {
  appleId: "$EXPO_APPLE_ID",
  ascAppId: "$EXPO_ASC_APP_ID",
  appleTeamId: "$EXPO_APPLE_TEAM_ID",
};
const submitIos = eas.submit?.production?.ios ?? {};
for (const [key, expected] of Object.entries(expectedSecrets)) {
  if (submitIos[key] !== expected) {
    errors.push(`eas.json submit.production.ios.${key} must reference its CI/EAS secret.`);
  }
}
if ("serviceAccountKeyPath" in (eas.submit?.production?.android ?? {})) {
  errors.push("Android submission credentials must be managed by EAS; local key paths are forbidden.");
}

try {
  const tracked = execFileSync("git", ["ls-files", "mobile"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  for (const file of tracked.split("\n")) {
    if (/(google-services\.json|service-account.*\.json|credentials?\.json|\.(jks|p8|p12|key|mobileprovision))$/i.test(file)) {
      errors.push(`Credential or signing file is tracked: ${file}`);
    }
  }
} catch (error) {
  errors.push(`Unable to inspect tracked mobile files: ${error.message}`);
}

if (production) {
  for (const name of [
    "EXPO_TOKEN",
    "EXPO_OWNER",
    "EXPO_APPLE_ID",
    "EXPO_ASC_APP_ID",
    "EXPO_APPLE_TEAM_ID",
    "IOS_BUNDLE_IDENTIFIER",
    "ANDROID_PACKAGE",
  ]) {
    if (!process.env[name]) errors.push(`Production release secret/configuration is missing: ${name}.`);
  }
}

if (errors.length) {
  console.error("Mobile store preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(production ? "Mobile production store preflight passed." : "Mobile store configuration preflight passed.");
}
