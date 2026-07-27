// Cada paleta trae la superficie (fondo oscuro con texto blanco encima) y el color
// de texto por tema. Un valor fijo no puede ser legible sobre claro y sobre oscuro
// a la vez, por eso el rol de texto se separa en dos.
// Los valores de "green" son los de arranque y estan repetidos en styles/globals.css,
// que es lo que ve quien nunca eligio un accent; si cambian aca, cambiarlos alla.
export const ACCENT_PALETTES = {
  green: { surface: "#265902", textLight: "#046b30", textDark: "#4ade80" },
  blue: { surface: "#12395e", textLight: "#1d4ed8", textDark: "#7dd3fc" },
  purple: { surface: "#4a1d6a", textLight: "#6b21a8", textDark: "#d8b4fe" },
  orange: { surface: "#7a3803", textLight: "#9a3412", textDark: "#fdba74" },
  red: { surface: "#7f1d1d", textLight: "#b91c1c", textDark: "#fca5a5" },
};

export const FONT_SIZES = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

export const DEFAULT_ACCENT = "green";
export const DEFAULT_FONT_SIZE = "medium";

// Se guardan los colores ya resueltos ademas del nombre: asi el script de arranque
// aplica los valores sin necesitar la tabla de paletas.
export const STORAGE_KEYS = {
  accent: "dnb-accent",
  surface: "dnb-accent-surface",
  textLight: "dnb-accent-text-light",
  textDark: "dnb-accent-text-dark",
  fontSize: "dnb-font-size",
  fontSizeValue: "dnb-font-size-value",
};

export const CSS_VARS = {
  surface: "--color-accent",
  textLight: "--brand-text-light",
  textDark: "--brand-text-dark",
};

export function resolveAccent(name) {
  return ACCENT_PALETTES[name] || ACCENT_PALETTES[DEFAULT_ACCENT];
}

export function resolveFontSize(name) {
  return FONT_SIZES[name] || FONT_SIZES[DEFAULT_FONT_SIZE];
}

// Corre de forma sincrona antes del primer paint para que la apariencia guardada
// no aparezca despues de un frame con los valores por defecto.
export function appearanceInitScript() {
  const k = STORAGE_KEYS;
  const v = CSS_VARS;
  return `(function(){try{var d=document.documentElement,s=window.localStorage,x;
x=s.getItem("${k.surface}");if(x)d.style.setProperty("${v.surface}",x);
x=s.getItem("${k.textLight}");if(x)d.style.setProperty("${v.textLight}",x);
x=s.getItem("${k.textDark}");if(x)d.style.setProperty("${v.textDark}",x);
x=s.getItem("${k.fontSizeValue}");if(x)d.style.fontSize=x;}catch(e){}})();`;
}
