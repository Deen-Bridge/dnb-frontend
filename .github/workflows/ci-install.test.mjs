import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const workflowText = await readFile(new URL("./ci.yml", import.meta.url), "utf8");

test("CI uses locked installs without an npm install fallback", () => {
  assert.equal(workflowText.includes("npm ci ||"), false);
  assert.equal(workflowText.includes("npm install --no-audit --no-fund"), false);
  assert.equal((workflowText.match(/run: npm ci --no-audit --no-fund/g) ?? []).length, 3);
});

test("npm ci rejects an out-of-sync lockfile", () => {
  const fixture = mkdtempSync(join(tmpdir(), "dnb-ci-install-"));
  try {
    writeFileSync(join(fixture, "package.json"), JSON.stringify({ name: "lockfile-fixture", version: "1.0.0", dependencies: { "is-number": "7.0.0" } }));
    writeFileSync(join(fixture, "package-lock.json"), JSON.stringify({ name: "lockfile-fixture", version: "1.0.0", lockfileVersion: 3, requires: true, packages: { "": { name: "lockfile-fixture", version: "1.0.0", dependencies: {} } } }));
    assert.throws(
      () => execFileSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: fixture, encoding: "utf8", stdio: "pipe" }),
      /package-lock|in sync|npm ci can only install/i,
    );
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
