import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = ".next/static";
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
const MAX_CHUNK_BYTES = 1.5 * 1024 * 1024;

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }));
  return nested.flat();
}

const assets = (await files(root)).filter((file) => file.endsWith(".js") || file.endsWith(".css"));
const sizes = await Promise.all(assets.map(async (file) => ({ file, size: (await stat(file)).size })));
const total = sizes.reduce((sum, asset) => sum + asset.size, 0);
const largest = sizes.reduce((max, asset) => Math.max(max, asset.size), 0);
if (total > MAX_TOTAL_BYTES || largest > MAX_CHUNK_BYTES) {
  console.error(`asset budget exceeded: total=${total} largest=${largest}`);
  process.exit(1);
}
console.log(`asset budget passed: ${assets.length} assets, total=${total}, largest=${largest}`);
