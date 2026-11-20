#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = readFileSync(path.join(root, "next.config.mjs"), "utf8");
const manifest = JSON.parse(readFileSync(path.join(root, "config/approved-image-hosts.json"), "utf8"));
const approved = new Set(manifest.production.map(({ hostname }) => hostname));
const configured = [...config.matchAll(/hostname:\s*["']([^"']+)["']/g)].map((match) => match[1]);
const unexpected = configured.filter((hostname) => !approved.has(hostname));
const missing = [...approved].filter((hostname) => !configured.includes(hostname));

if (unexpected.length || missing.length) {
  console.error(JSON.stringify({ unexpected, missing }, null, 2));
  process.exit(1);
}
console.log(`Image host allowlist OK (${configured.length} production host).`);
