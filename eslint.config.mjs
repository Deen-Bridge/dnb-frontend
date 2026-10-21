import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Build output, vendored assets and the separately maintained mobile
    // workspace are not part of the Next.js source tree.
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "public/**",
      "mobile/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    // #523 — explicit-`any` guardrail.
    //
    // `tsconfig.json` already runs with `"strict": true`, so `noImplicitAny`
    // is effectively on. What is left are *explicit* `any`s, each of which
    // silently opts a single site out of the type system.
    //
    // The rule starts at "warn" so the existing backlog does not turn CI red
    // while #514–#522 type each module out. Flip it to "error" once the
    // tracked count in `scripts/explicit-any-baseline.json` reaches zero —
    // `scripts/check-explicit-any.mjs` already fails the build on any *new*
    // explicit `any`, so the backlog cannot grow in the meantime.
    //
    // Escape hatch (scoped + justified, enforced by the guard script):
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any -- <reason>
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
