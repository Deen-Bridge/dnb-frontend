import fs from "node:fs";

const directory = new URL("../messages/", import.meta.url);
const source = "en";
const locales = fs.readdirSync(directory).filter((file) => file.endsWith(".json"));

function flatten(value, prefix = "", result = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, result));
    return result;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      flatten(item, prefix ? `${prefix}.${key}` : key, result);
    }
    return result;
  }
  result.set(prefix, value);
  return result;
}

function readLocale(file) {
  try {
    return JSON.parse(fs.readFileSync(new URL(file, directory), "utf8"));
  } catch (error) {
    throw new Error(`${file}: invalid JSON (${error.message})`);
  }
}

const sourceKeys = flatten(readLocale(`${source}.json`));
const failures = [];

for (const file of locales) {
  const locale = file.replace(/\.json$/, "");
  if (locale === source) continue;
  const keys = flatten(readLocale(file));
  const missing = [...sourceKeys.keys()].filter((key) => !keys.has(key));
  const extra = [...keys.keys()].filter((key) => !sourceKeys.has(key));
  if (missing.length || extra.length) {
    failures.push(
      `${file}: ${missing.length} missing key(s), ${extra.length} extra key(s)`
    );
    if (missing.length) failures.push(`  missing: ${missing.join(", ")}`);
    if (extra.length) failures.push(`  extra: ${extra.join(", ")}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Locale catalogs are complete and valid (${locales.length} locales).`);
}
