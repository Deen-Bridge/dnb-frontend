#!/usr/bin/env node
/**
 * Explicit-`any` guard — #523
 * --------------------------
 * `tsconfig.json` already runs with `"strict": true`, so `noImplicitAny` is
 * effectively on. The remaining explicit `any`s are the ones a lint-cleanup
 * pass left behind, and each one silently opts a single site out of the type
 * system.
 *
 * This script is the CI teeth behind the `@typescript-eslint/no-explicit-any`
 * rule that `eslint.config.mjs` enables:
 *
 *   1. It counts every explicit `any` that is NOT covered by a scoped,
 *      justified `eslint-disable-next-line` comment.
 *   2. It compares that count against the tracked baseline in
 *      `scripts/explicit-any-baseline.json`.
 *   3. It fails when the count *grows* — i.e. when someone introduces a new
 *      explicit `any` instead of typing the site.
 *   4. It fails when an `eslint-disable` for the rule is missing its
 *      `-- <reason>` justification.
 *
 * Usage:
 *   node scripts/check-explicit-any.mjs            # verify against the baseline
 *   node scripts/check-explicit-any.mjs --update   # rewrite the baseline
 *   node scripts/check-explicit-any.mjs --json     # machine-readable output
 *
 * The baseline only ever needs regenerating when a per-module typing issue
 * (#514–#522) removes explicit `any`s; the count is expected to trend down.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const RULE = "@typescript-eslint/no-explicit-any";
const CONFIG_FILE = path.join(ROOT, "eslint.config.explicit-any.mjs");
const BASELINE_FILE = path.join(ROOT, "scripts", "explicit-any-baseline.json");

// Directories that never contain first-party application code.
const IGNORED_DIRS = new Set([
  ".next",
  "node_modules",
  "out",
  "coverage",
  "public",
  "mobile",
  ".git",
]);

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

/**
 * Tracked source files, so the guard ignores build output and untracked
 * scratch files. Falls back to a filesystem walk when git is unavailable.
 */
export function listSourceFiles(root = ROOT) {
  let tracked = [];
  try {
    const out = execFileSync("git", ["ls-files", "-z"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
    tracked = out.split("\0").filter(Boolean);
  } catch {
    tracked = [];
  }

  const files = tracked.length
    ? tracked
    : execFileSync("find", [".", "-type", "f"], { cwd: root, encoding: "utf8" })
        .split("\n")
        .filter(Boolean)
        .map((f) => f.replace(/^\.\//, ""));

  return files
    .map((f) => path.relative(root, path.resolve(root, f)))
    .filter((f) => !f.split(path.sep).some((seg) => IGNORED_DIRS.has(seg)))
    .filter((f) => SOURCE_EXTENSIONS.has(path.extname(f)))
    .sort();
}

/**
 * A scoped disable must name the rule and carry a `-- <reason>` justification.
 * Returns the offending `file:line` entries.
 */
export function findUnjustifiedDisables(files, root = ROOT) {
  const directive =
    /eslint-disable(?:-next-line|-line)?\s+@typescript-eslint\/no-explicit-any(?![^\n]*--\s*\S)/;
  const offenders = [];

  for (const file of files) {
    const contents = readFileSync(path.join(root, file), "utf8");
    contents.split("\n").forEach((line, index) => {
      if (directive.test(line)) {
        offenders.push({ file, line: index + 1, text: line.trim() });
      }
    });
  }

  return offenders;
}

/**
 * Explicit `any` sites that are not covered by a justified disable.
 * Returns a map of `file -> count` plus the total.
 */
export async function collectExplicitAny(files, root = ROOT) {
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: CONFIG_FILE,
    errorOnUnmatchedPattern: false,
  });

  const results = await eslint.lintFiles(files);
  const perFile = {};
  let total = 0;

  for (const result of results) {
    const messages = result.messages.filter((m) => m.ruleId === RULE);
    if (!messages.length) continue;
    const file = path.relative(root, result.filePath);
    perFile[file] = messages.length;
    total += messages.length;
  }

  return { perFile, total };
}

function readBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
  } catch {
    return { total: 0, files: {} };
  }
}

function writeBaseline(baseline) {
  const sorted = Object.fromEntries(
    Object.entries(baseline.files).sort(([a], [b]) => a.localeCompare(b))
  );
  const payload = {
    ...baseline,
    total: Object.values(sorted).reduce((sum, n) => sum + n, 0),
    files: sorted,
  };
  writeFileSync(BASELINE_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

/**
 * Compare the live count against the baseline.
 * Returns `{ regressions, fixed, newFiles }`.
 */
export function diffAgainstBaseline(perFile, baseline) {
  const baselineFiles = baseline.files || {};
  const regressions = [];
  const fixed = [];
  const newFiles = [];

  for (const [file, count] of Object.entries(perFile)) {
    const allowed = baselineFiles[file];
    if (allowed === undefined) {
      newFiles.push({ file, count, allowed: 0 });
    } else if (count > allowed) {
      regressions.push({ file, count, allowed });
    } else if (count < allowed) {
      fixed.push({ file, count, allowed });
    }
  }

  for (const [file, allowed] of Object.entries(baselineFiles)) {
    if (!(file in perFile)) fixed.push({ file, count: 0, allowed });
  }

  return { regressions, fixed, newFiles };
}

async function main() {
  const argv = process.argv.slice(2);
  const update = argv.includes("--update");
  const asJson = argv.includes("--json");

  const files = listSourceFiles();
  const { perFile, total } = await collectExplicitAny(files);
  const unjustified = findUnjustifiedDisables(files);

  const baseline = readBaseline();

  if (update) {
    const updated = writeBaseline({
      ...baseline,
      updatedAt: new Date().toISOString().slice(0, 10),
      files: perFile,
    });
    if (asJson) {
      process.stdout.write(
        `${JSON.stringify({ ok: true, updated: true, total: updated.total })}\n`
      );
    } else {
      process.stdout.write(
        `Updated ${path.relative(ROOT, BASELINE_FILE)} — ${updated.total} explicit any site(s) tracked.\n`
      );
    }
    return 0;
  }

  const { regressions, fixed, newFiles } = diffAgainstBaseline(perFile, baseline);
  const baselineTotal = baseline.total ?? 0;
  const failed = regressions.length > 0 || newFiles.length > 0 || unjustified.length > 0;

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: !failed,
          total,
          baselineTotal,
          regressions,
          newFiles,
          fixed,
          unjustified,
        },
        null,
        2
      )}\n`
    );
    return failed ? 1 : 0;
  }

  const remaining = Math.max(baselineTotal - total, 0);
  process.stdout.write(
    `Explicit-any guard (#523): ${total} site(s) outstanding, ${remaining} to zero ` +
      `(baseline ${baselineTotal}).\n`
  );

  if (fixed.length) {
    process.stdout.write(
      `\nProgress — ${fixed.length} file(s) improved:\n` +
        fixed
          .map(
            (f) =>
              `  ✓ ${f.file}: ${f.allowed} → ${f.count} (-${f.allowed - f.count})`
          )
          .join("\n") +
        "\n"
    );
    process.stdout.write(
      `\nTip: run \`npm run lint:any -- --update\` to refresh the baseline.\n`
    );
  }

  if (regressions.length) {
    process.stdout.write(
      `\nFAIL — ${regressions.length} file(s) gained explicit \`any\`:\n` +
        regressions
          .map(
            (r) =>
              `  ✗ ${r.file}: ${r.count} explicit any (baseline allowed ${r.allowed})`
          )
          .join("\n") +
        "\n"
    );
  }

  if (newFiles.length) {
    process.stdout.write(
      `\nFAIL — ${newFiles.length} file(s) introduced explicit \`any\` that the baseline does not know:\n` +
        newFiles
          .map((f) => `  ✗ ${f.file}: ${f.count} explicit any`)
          .join("\n") +
        "\n"
    );
  }

  if (unjustified.length) {
    process.stdout.write(
      `\nFAIL — ${unjustified.length} eslint-disable directive(s) for ${RULE} lack a justification.\n` +
        "Every disable must be scoped and justified:\n" +
        "  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>\n" +
        unjustified
          .map((u) => `  ✗ ${u.file}:${u.line} ${u.text}`)
          .join("\n") +
        "\n"
    );
  }

  if (failed) {
    process.stdout.write(
      `\nType the site instead of widening the type, or add a scoped, justified disable.\n`
    );
    return 1;
  }

  process.stdout.write("\nOK — no new explicit `any` introduced.\n");
  return 0;
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (invokedDirectly) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      process.stderr.write(`${error?.stack || error}\n`);
      process.exitCode = 1;
    });
}

export { main };
