// Dedicated "explicit any only" ESLint config.
//
// `eslint.config.mjs` runs the full Next.js rule set and reports explicit
// `any` as a *warning* so the existing backlog does not break CI. This config
// does the opposite: it enables nothing but
// `@typescript-eslint/no-explicit-any`, at *error* level, so
// `scripts/check-explicit-any.mjs` can count the remaining sites precisely
// and compare them against the tracked baseline.
//
// Run it directly with:
//
//   npx eslint --config eslint.config.explicit-any.mjs --format json <paths>
//
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "public/**",
      "mobile/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
