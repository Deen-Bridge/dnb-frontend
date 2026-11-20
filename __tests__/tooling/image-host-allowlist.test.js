import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());

describe("production image host governance", () => {
  it("keeps next.config hosts aligned with the reviewed manifest", () => {
    const config = readFileSync(path.join(root, "next.config.mjs"), "utf8");
    const manifest = JSON.parse(readFileSync(path.join(root, "config/approved-image-hosts.json"), "utf8"));
    const configured = [...config.matchAll(/hostname:\s*["']([^"']+)["']/g)].map((match) => match[1]);
    expect(configured).toEqual(manifest.production.map(({ hostname }) => hostname));
  });

  it("does not approve known placeholder or unowned hosts", () => {
    const config = readFileSync(path.join(root, "next.config.mjs"), "utf8");
    for (const host of ["picsum.photos", "i.ibb.co", "logo.clearbit.com"]) {
      expect(config).not.toContain(host);
    }
  });
});
