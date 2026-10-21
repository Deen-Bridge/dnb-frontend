/// <reference types="vite/client" />
/**
 * Guard against shipping a locale whose message catalog has drifted from the
 * base locale.
 *
 * `messages/en.json` is the source of truth (see `i18n/request.js`): every
 * other locale has to expose exactly the same set of message keys, otherwise a
 * missing translation silently renders as an empty string at runtime.
 *
 * The catalogs are globbed off disk so a newly added locale is picked up
 * automatically - there is no list of locales to keep in sync here.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { routing } from "@/i18n/routing";

type Catalog = Record<string, unknown>;

const catalogModules = import.meta.glob("/messages/*.json", { eager: true }) as Record<
  string,
  { default: Catalog }
>;

/** Locale name -> catalog, e.g. `"en"` -> the parsed `messages/en.json`. */
const catalogs: Record<string, Catalog> = Object.fromEntries(
  Object.entries(catalogModules).map(([path, mod]) => [
    path.replace(/^.*\//, "").replace(/\.json$/, ""),
    mod.default,
  ])
);

const baseLocale: string = routing.defaultLocale;
const configuredLocales: string[] = [...routing.locales];

/** A message catalog is either a leaf string or a nested group of messages. */
function isGroup(value: unknown): value is Catalog {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Flattens a nested catalog into dotted key paths, e.g.
 * `{ navbar: { links: { home: "Home" } } }` -> `["navbar.links.home"]`.
 */
export function flattenKeys(catalog: Catalog, prefix = ""): string[] {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return isGroup(value) ? flattenKeys(value, path) : [path];
  });
}

/**
 * Compares two key sets and reports the gaps in both directions: keys the
 * target is missing, and keys the target has that the base locale does not.
 */
export function diffKeys(baseKeys: string[], targetKeys: string[]) {
  const base = new Set(baseKeys);
  const target = new Set(targetKeys);
  return {
    missing: [...base].filter((key) => !target.has(key)).sort(),
    extra: [...target].filter((key) => !base.has(key)).sort(),
  };
}

/** Human readable summary of the gaps, so a failing test says what to fix. */
function describeGaps(locale: string, gaps: { missing: string[]; extra: string[] }) {
  const lines: string[] = [];
  if (gaps.missing.length) {
    lines.push(`  missing in "${locale}": ${gaps.missing.join(", ")}`);
  }
  if (gaps.extra.length) {
    lines.push(`  not present in the base locale: ${gaps.extra.join(", ")}`);
  }
  return lines.join("\n");
}

/** Reads the raw value behind a dotted key path. */
function valueAtPath(catalog: Catalog, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, part) => (isGroup(node) ? node[part] : undefined), catalog);
}

describe("i18n message catalogs", () => {
  it("ships a message catalog for every configured locale", () => {
    const missingCatalogs = configuredLocales.filter((locale) => !catalogs[locale]);

    expect(
      missingCatalogs,
      `Missing message catalog file(s) in messages/: ${missingCatalogs.join(", ")}`
    ).toEqual([]);
  });

  it("does not leave a message catalog behind for an unsupported locale", () => {
    const orphaned = Object.keys(catalogs).filter((locale) => !configuredLocales.includes(locale));

    expect(
      orphaned,
      `Add these locales to i18n/routing.js or delete their catalog: ${orphaned.join(", ")}`
    ).toEqual([]);
  });

  it("gives every locale the same message keys as the base locale", () => {
    const baseKeys = flattenKeys(catalogs[baseLocale]);

    expect(baseKeys.length, `Base locale "${baseLocale}" has no message keys`).toBeGreaterThan(0);

    for (const locale of configuredLocales) {
      const gaps = diffKeys(baseKeys, flattenKeys(catalogs[locale]));

      expect(
        gaps.missing,
        `Locale "${locale}" does not match the base locale "${baseLocale}":\n${describeGaps(locale, gaps)}`
      ).toEqual([]);
      expect(
        gaps.extra,
        `Locale "${locale}" does not match the base locale "${baseLocale}":\n${describeGaps(locale, gaps)}`
      ).toEqual([]);
    }
  });

  it("never leaves a message value empty", () => {
    const emptyValues: string[] = [];

    for (const locale of configuredLocales) {
      const catalog = catalogs[locale];
      for (const key of flattenKeys(catalog)) {
        const value = valueAtPath(catalog, key);
        if (typeof value === "string" && value.trim() === "") {
          emptyValues.push(`${locale}:${key}`);
        }
      }
    }

    expect(emptyValues, `Empty message values: ${emptyValues.join(", ")}`).toEqual([]);
  });

  it("reports missing and extra keys when a locale drifts from the base locale", () => {
    const base = { common: { skip: "Skip", cancel: "Cancel" }, navbar: { home: "Home" } };
    const drifted = { common: { skip: "تخطى" }, navbar: { home: "الرئيسية", extra: "زائد" } };

    const gaps = diffKeys(flattenKeys(base), flattenKeys(drifted));

    expect(gaps.missing).toEqual(["common.cancel"]);
    expect(gaps.extra).toEqual(["navbar.extra"]);
    expect(describeGaps("ar", gaps)).toContain("common.cancel");
    expect(describeGaps("ar", gaps)).toContain("navbar.extra");
  });

  it("treats an empty locale catalog as entirely missing", () => {
    const base = { common: { skip: "Skip" }, navbar: { home: "Home" } };

    const gaps = diffKeys(flattenKeys(base), flattenKeys({}));

    expect(gaps.missing).toEqual(["common.skip", "navbar.home"]);
    expect(gaps.extra).toEqual([]);
  });

  it("ignores key order when comparing locales", () => {
    const base = { common: { skip: "Skip", cancel: "Cancel" } };
    const reordered = { common: { cancel: "إلغاء", skip: "تخطى" } };

    expect(diffKeys(flattenKeys(base), flattenKeys(reordered))).toEqual({
      missing: [],
      extra: [],
    });
  });

  describe("network isolation", () => {
    const fetchSpy = vi.fn(() => {
      throw new Error("The i18n catalog guard must not perform network requests.");
    });

    beforeEach(() => {
      vi.stubGlobal("fetch", fetchSpy);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("reads every catalog without hitting the network", () => {
      for (const locale of configuredLocales) {
        expect(() => flattenKeys(catalogs[locale])).not.toThrow();
      }

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
