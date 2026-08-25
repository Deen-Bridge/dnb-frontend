export { Colors } from "@/constants/colors";
export { Spacing, BorderRadius, ScreenPadding } from "@/constants/spacing";
export { FontSize, LineHeight, FontWeight, Typography } from "@/constants/typography";

export const Theme = {
  light: {
    dark: false,
    colors: {
      primary: "#092601",
      background: "#ffffff",
      card: "#ffffff",
      text: "#171717",
      border: "#e5e5e5",
      notification: "#dc2626",
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: "#3d8c2b",
      background: "#0a0a0a",
      card: "#171717",
      text: "#fafafa",
      border: "#404040",
      notification: "#f87171",
    },
  },
} as const;
