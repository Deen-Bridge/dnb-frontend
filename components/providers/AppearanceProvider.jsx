"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  CSS_VARS,
  DEFAULT_ACCENT,
  DEFAULT_FONT_SIZE,
  STORAGE_KEYS,
  resolveAccent,
  resolveFontSize,
} from "@/lib/config/appearance.config";

const AppearanceContext = createContext(null);

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return context;
}

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(entries) {
  try {
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // localStorage falla en modo privado de algunos navegadores; la eleccion
    // sigue aplicada en esta sesion aunque no persista.
  }
}

export default function AppearanceProvider({ children }) {
  const [accent, setAccentState] = useState(DEFAULT_ACCENT);
  const [fontSize, setFontSizeState] = useState(DEFAULT_FONT_SIZE);
  const [mounted, setMounted] = useState(false);

  // El script de arranque ya aplico los valores guardados al documento; aca solo
  // se sincroniza el estado de React para que la UI marque la opcion correcta.
  useEffect(() => {
    setAccentState(read(STORAGE_KEYS.accent) || DEFAULT_ACCENT);
    setFontSizeState(read(STORAGE_KEYS.fontSize) || DEFAULT_FONT_SIZE);
    setMounted(true);
  }, []);

  const setAccent = (name) => {
    const palette = resolveAccent(name);
    const root = document.documentElement;
    // Se escriben los dos niveles de texto una sola vez: la cascada elige cual
    // rige segun este o no la clase dark, sin que el tema dispare un repintado.
    root.style.setProperty(CSS_VARS.surface, palette.surface);
    root.style.setProperty(CSS_VARS.textLight, palette.textLight);
    root.style.setProperty(CSS_VARS.textDark, palette.textDark);
    setAccentState(name);
    write({
      [STORAGE_KEYS.accent]: name,
      [STORAGE_KEYS.surface]: palette.surface,
      [STORAGE_KEYS.textLight]: palette.textLight,
      [STORAGE_KEYS.textDark]: palette.textDark,
    });
  };

  const setFontSize = (name) => {
    const value = resolveFontSize(name);
    document.documentElement.style.fontSize = value;
    setFontSizeState(name);
    write({
      [STORAGE_KEYS.fontSize]: name,
      [STORAGE_KEYS.fontSizeValue]: value,
    });
  };

  return (
    <AppearanceContext.Provider
      value={{ accent, fontSize, setAccent, setFontSize, mounted }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}
