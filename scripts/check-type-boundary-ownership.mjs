#!/usr/bin/env node
/**
 * Verify that every explicit-any baseline file has an accountable owner,
 * tracking issue, and a review-by date. The manifest is intentionally
 * file-pattern based so a single new site cannot silently escape ownership.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = path.join(ROOT, "scripts", "explicit-any-baseline.json");
const MANIFEST = path.join(ROOT, "scripts", "type-boundary-owners.json");

function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replaceAll("**", "@@DOUBLE@@").replaceAll("*", "[^/]*").replaceAll("@@DOUBLE@@", ".*")}$`);
}

export function validateManifest(baseline, manifest, today = new Date()) {
  const errors = [];
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const compiled = entries.map((entry) => ({ ...entry, matcher: globToRegExp(entry.pattern || "") }));

  for (const file of Object.keys(baseline.files || {})) {
    const owners = compiled.filter(({ matcher }) => matcher.test(file));
    if (owners.length !== 1) {
      errors.push(`${file}: expected exactly one owner entry, found ${owners.length}`);
      continue;
    }
    const entry = owners[0];
    if (!entry.owner || !Number.isInteger(entry.issue) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.expires)) {
      errors.push(`${file}: owner, numeric issue, and YYYY-MM-DD expiry are required`);
      continue;
    }
    const expiry = new Date(`${entry.expires}T00:00:00Z`);
    if (Number.isNaN(expiry.valueOf()) || expiry < today) {
      errors.push(`${file}: ownership entry expired on ${entry.expires}`);
    }
  }

  return errors;
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const errors = validateManifest(baseline, manifest);

if (errors.length) {
  process.stderr.write(`FAIL — ${errors.length} type-boundary ownership error(s):\n`);
  process.stderr.write(errors.map((error) => `  ✗ ${error}`).join("\n") + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write(`OK — ${Object.keys(baseline.files || {}).length} explicit-any file(s) have active ownership.\n`);
}
