export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const FontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const Typography = {
  h1: {
    fontSize: FontSize["4xl"],
    lineHeight: LineHeight.tight,
    fontWeight: FontWeight.bold,
  },
  h2: {
    fontSize: FontSize["3xl"],
    lineHeight: LineHeight.tight,
    fontWeight: FontWeight.bold,
  },
  h3: {
    fontSize: FontSize["2xl"],
    lineHeight: LineHeight.tight,
    fontWeight: FontWeight.semibold,
  },
  h4: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.normal,
    fontWeight: FontWeight.semibold,
  },
  body: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.normal,
    fontWeight: FontWeight.normal,
  },
  bodyLarge: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.normal,
    fontWeight: FontWeight.normal,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.normal,
    fontWeight: FontWeight.normal,
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.normal,
    fontWeight: FontWeight.normal,
  },
  label: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.normal,
    fontWeight: FontWeight.medium,
  },
  button: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.tight,
    fontWeight: FontWeight.semibold,
  },
} as const;
