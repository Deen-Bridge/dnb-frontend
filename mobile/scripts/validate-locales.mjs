#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["en", "ar"];
const flatten = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === "object" ? flatten(child, full) : [full];
  });

const data = Object.fromEntries(
  locales.map((locale) => [locale, JSON.parse(readFileSync(path.join(root, "i18n", `${locale}.json`), "utf8"))])
);
const keys = Object.fromEntries(locales.map((locale) => [locale, new Set(flatten(data[locale]))]));
const errors = [];
for (const locale of locales.slice(1)) {
  for (const key of keys.en) if (!keys[locale].has(key)) errors.push(`${locale}: missing ${key}`);
  for (const key of keys[locale]) if (!keys.en.has(key)) errors.push(`${locale}: unused ${key}`);
}
if (errors.length) {
  console.error(`Locale validation failed with ${errors.length} error(s):`);
  console.error(errors.map((error) => `  - ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Locale validation passed: ${keys.en.size} shared keys across ${locales.join(", ")}.`);
}
