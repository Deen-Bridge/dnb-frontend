import { useColorScheme } from "react-native";
import { Colors, type ColorTheme } from "@/constants/colors";

type ThemeMode = "light" | "dark" | "system";

let currentMode: ThemeMode = "system";

export function setThemeMode(mode: ThemeMode) {
  currentMode = mode;
}

export function getThemeMode(): ThemeMode {
  return currentMode;
}

export function useAppTheme(): { colors: ColorTheme; isDark: boolean } {
  const systemScheme = useColorScheme();
  const isDark =
    currentMode === "dark" ||
    (currentMode === "system" && systemScheme === "dark");

  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
  };
}
