// WCAG 2.1 relative-luminance + contrast-ratio calculator.
// Usage: node scripts/contrast.mjs "color1" "color2" [fontSize] [bold]
// Accepts #hex, rgb(), or named Tailwind palette colors (hex map below).
const map = {
  white: "#ffffff", black: "#000000",
  "gray-50": "#f9fafb", "gray-100": "#f3f4f6", "gray-200": "#e5e7eb",
  "gray-300": "#d1d5db", "gray-400": "#9ca3af", "gray-500": "#6b7280",
  "gray-600": "#4b5563", "gray-700": "#374151", "gray-800": "#1f2937",
  "green-50": "#f0fdf4", "green-100": "#dcfce7", "green-200": "#bbf7d0",
  "green-300": "#86efac", "green-400": "#4ade80", "green-500": "#22c55e",
  "green-600": "#16a34a", "green-700": "#15803d", "green-800": "#166534",
  "red-50": "#fef2f2", "red-500": "#ef4444", "red-600": "#dc2626",
  "blue-300": "#93c5fd", "cyan-400": "#22d3ee", "yellow-400": "#facc15",
  "indigo-300": "#a5b4fc", "secondary": "#009900", "accent": "#265902",
  "accent-card": "#265902", "highlight": "#008200", "basic": "#092601",
  "ink": "#14260c", "ink-muted": "#40593a", "ink-inverse": "#eef5ec",
  "ink-inverse-muted": "#b9d1b0", "surface": "#f3f7f1", "surface-raised": "#fafcf9",
  "brand-text-light": "#046b30", "brand-text-dark": "#4ade80",
  "dark-accent": "#5aa83e", "dark-ink": "#eaf3e6", "dark-ink-muted": "#9fbb93",
  "dark-surface": "#0f1f0a", "dark-surface-raised": "#17290f",
  "muted-foreground": "#71717b", "muted": "#f4f4f5", "f7f7f7": "#f7f7f7",
};

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbFromInput(input) {
  input = String(input).trim().toLowerCase();
  if (input.startsWith("white/")) {
    const alpha = Number(input.split("/")[1]) / 100;
    return { fg: hexToRgb("#ffffff"), alpha };
  }
  if (input.startsWith("black/")) {
    const alpha = Number(input.split("/")[1]) / 100;
    return { fg: hexToRgb("#000000"), alpha };
  }
  if (map[input]) return { fg: hexToRgb(map[input]) };
  if (input.startsWith("#")) return { fg: hexToRgb(input) };
  if (input.startsWith("rgb")) {
    const m = input.match(/[\d.]+/g).slice(0, 3).map(Number);
    return { fg: m };
  }
  return null;
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function blendAlpha(fg, bg, alpha) {
  return fg.map((f, i) => Math.round(f * alpha + bg[i] * (1 - alpha)));
}

const [, , fgArg, bgArg, sizeArg, boldArg] = process.argv;
if (!fgArg || !bgArg) {
  console.log("usage: node scripts/contrast.mjs <fg> <bg> [fontSizePx] [bold]");
  process.exit(1);
}
const fgInput = rgbFromInput(fgArg);
const bgInput = rgbFromInput(bgArg);
if (!fgInput || !bgInput) {
  console.log("unknown color:", fgArg, bgArg);
  process.exit(1);
}
const fg = fgInput.alpha ? blendAlpha(fgInput.fg, bgInput.fg, fgInput.alpha) : fgInput.fg;
const bg = bgInput.alpha ? blendAlpha(bgInput.fg, fgInput.fg, bgInput.alpha) : bgInput.fg;
const ratio = contrast(fg, bg);
const size = sizeArg ? Number(sizeArg) : 16;
const bold = boldArg === "bold";
const isLarge = bold ? size >= 18.66 : size >= 24;
const req = isLarge ? 3 : 4.5;
const pass = ratio >= req;
console.log(
  `${fgArg} on ${bgArg} = ${ratio.toFixed(2)}:1 (${size}px${bold ? " bold" : ""}, ${isLarge ? "large text" : "normal text"}) -> ${pass ? "PASS" : "FAIL"} AA ${req}:1`
);