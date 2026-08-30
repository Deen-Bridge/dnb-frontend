export interface AccentPalette {
  surface: string;
  textLight: string;
  textDark: string;
}

export type AccentName = "green" | "blue" | "purple" | "orange" | "red";
export type FontSizeName = "small" | "medium" | "large";

export const ACCENT_PALETTES: Record<AccentName, AccentPalette> = {
  green: { surface: "#265902", textLight: "#046b30", textDark: "#4ade80" },
  blue: { surface: "#12395e", textLight: "#1d4ed8", textDark: "#7dd3fc" },
  purple: { surface: "#4a1d6a", textLight: "#6b21a8", textDark: "#d8b4fe" },
  orange: { surface: "#7a3803", textLight: "#9a3412", textDark: "#fdba74" },
  red: { surface: "#7f1d1d", textLight: "#b91c1c", textDark: "#fca5a5" },
};

export const FONT_SIZES: Record<FontSizeName, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

export const DEFAULT_ACCENT: AccentName = "green";
export const DEFAULT_FONT_SIZE: FontSizeName = "medium";

export const STORAGE_KEYS = {
  accent: "dnb-accent",
  surface: "dnb-accent-surface",
  textLight: "dnb-accent-text-light",
  textDark: "dnb-accent-text-dark",
  fontSize: "dnb-font-size",
  fontSizeValue: "dnb-font-size-value",
} as const;

export const CSS_VARS = {
  surface: "--color-accent",
  textLight: "--brand-text-light",
  textDark: "--brand-text-dark",
} as const;

export function resolveAccent(name?: string): AccentPalette {
  if (name && name in ACCENT_PALETTES) {
    return ACCENT_PALETTES[name as AccentName];
  }
  return ACCENT_PALETTES[DEFAULT_ACCENT];
}

export function resolveFontSize(name?: string): string {
  if (name && name in FONT_SIZES) {
    return FONT_SIZES[name as FontSizeName];
  }
  return FONT_SIZES[DEFAULT_FONT_SIZE];
}

export function appearanceInitScript(): string {
  const k = STORAGE_KEYS;
  const v = CSS_VARS;
  return `(function(){try{var d=document.documentElement,s=window.localStorage,x;
x=s.getItem("${k.surface}");if(x)d.style.setProperty("${v.surface}",x);
x=s.getItem("${k.textLight}");if(x)d.style.setProperty("${v.textLight}",x);
x=s.getItem("${k.textDark}");if(x)d.style.setProperty("${v.textDark}",x);
x=s.getItem("${k.fontSizeValue}");if(x)d.style.fontSize=x;}catch(e){}})();`;
}
