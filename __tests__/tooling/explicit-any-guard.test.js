/**
 * Explicit-`any` guard (#523) — unit tests
 * ---------------------------------------
 * The guard is the CI teeth behind `@typescript-eslint/no-explicit-any`:
 *   - it must fail when a file gains explicit `any` sites,
 *   - it must fail when a new file introduces them,
 *   - it must pass when the count shrinks,
 *   - it must fail when an `eslint-disable` for the rule loses its
 *     `-- <reason>` justification.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  diffAgainstBaseline,
  findUnjustifiedDisables,
  listSourceFiles,
} from "../../scripts/check-explicit-any.mjs";

let tmpRoot;

// The directive text is assembled from parts so this fixture file does not
// itself contain a bare `eslint-disable` for the rule — the guard script
// scans every source file in the repo and would flag a literal one.
const RULE_NAME = "@typescript-eslint/no-explicit-any";
const directive = (reason) =>
  `// eslint-disable-next-line ${RULE_NAME}${reason ? ` -- ${reason}` : ""}`;
const inlineDirective = (reason) =>
  `// eslint-disable-line ${RULE_NAME}${reason ? ` -- ${reason}` : ""}`;

beforeAll(() => {
  tmpRoot = mkdtempSync(path.join(tmpdir(), "explicit-any-guard-"));
  mkdirSync(path.join(tmpRoot, "lib"), { recursive: true });
});

afterAll(() => {
  rmSync(tmpRoot, { recursive: true, force: true });
});

function write(relativePath, contents) {
  const target = path.join(tmpRoot, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents, "utf8");
  return relativePath;
}

describe("diffAgainstBaseline", () => {
  it("reports a regression when a file gains explicit any sites", () => {
    const { regressions } = diffAgainstBaseline(
      { "lib/a.ts": 3 },
      { total: 2, files: { "lib/a.ts": 2 } }
    );

    expect(regressions).toEqual([
      { file: "lib/a.ts", count: 3, allowed: 2 },
    ]);
  });

  it("reports a new file that introduces explicit any sites", () => {
    const { regressions, newFiles } = diffAgainstBaseline(
      { "lib/a.ts": 1, "lib/b.ts": 2 },
      { total: 1, files: { "lib/a.ts": 1 } }
    );

    expect(regressions).toEqual([]);
    expect(newFiles).toEqual([{ file: "lib/b.ts", count: 2, allowed: 0 }]);
  });

  it("reports progress when the count shrinks", () => {
    const { regressions, newFiles, fixed } = diffAgainstBaseline(
      { "lib/a.ts": 1 },
      { total: 2, files: { "lib/a.ts": 2 } }
    );

    expect(regressions).toEqual([]);
    expect(newFiles).toEqual([]);
    expect(fixed).toEqual([{ file: "lib/a.ts", count: 1, allowed: 2 }]);
  });

  it("reports a file that no longer contains any explicit any", () => {
    const { fixed } = diffAgainstBaseline(
      {},
      { total: 2, files: { "lib/a.ts": 2 } }
    );

    expect(fixed).toEqual([{ file: "lib/a.ts", count: 0, allowed: 2 }]);
  });
});

describe("findUnjustifiedDisables", () => {
  it("flags a scoped disable that has no justification", () => {
    const file = write(
      "lib/unjustified.ts",
      [directive(), "export const value: any = 1;", ""].join("\n")
    );

    const offenders = findUnjustifiedDisables([file], tmpRoot);

    expect(offenders).toHaveLength(1);
    expect(offenders[0].file).toBe(file);
    expect(offenders[0].line).toBe(1);
  });

  it("accepts a scoped disable that carries a reason", () => {
    const file = write(
      "lib/justified.ts",
      [directive("third-party blob"), "export const value: any = 1;", ""].join(
        "\n"
      )
    );

    expect(findUnjustifiedDisables([file], tmpRoot)).toEqual([]);
  });

  it("accepts a justified eslint-disable-line", () => {
    const file = write(
      "lib/inline.ts",
      `export const value: any = 1; ${inlineDirective("mock payload")}\n`
    );

    expect(findUnjustifiedDisables([file], tmpRoot)).toEqual([]);
  });

  it("ignores disables for other rules", () => {
    const file = write(
      "lib/other-rule.ts",
      ["// eslint-disable-next-line no-console", "export const value = 1;", ""].join(
        "\n"
      )
    );

    expect(findUnjustifiedDisables([file], tmpRoot)).toEqual([]);
  });

  it("ignores a reason that is present but empty", () => {
    const file = write(
      "lib/empty-reason.ts",
      [`${directive()} --`, "export const value: any = 1;", ""].join("\n")
    );

    expect(findUnjustifiedDisables([file], tmpRoot)).toHaveLength(1);
  });
});

describe("listSourceFiles", () => {
  it("returns tracked first-party source files and skips build output", () => {
    const files = listSourceFiles();

    expect(files.length).toBeGreaterThan(0);
    expect(files.every((f) => !f.startsWith("node_modules/"))).toBe(true);
    expect(files.every((f) => !f.startsWith(".next/"))).toBe(true);
    expect(files.every((f) => !f.startsWith("mobile/"))).toBe(true);
    expect(files.some((f) => f.endsWith(".ts") || f.endsWith(".tsx"))).toBe(true);
  });
});
