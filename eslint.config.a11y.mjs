import jsxA11y from "eslint-plugin-jsx-a11y";
import nextPlugin from "@next/eslint-plugin-next";

// Dedicated accessibility gate: applies eslint-plugin-jsx-a11y (the static,
// axe-aligned WCAG rules) to the whole source tree, independent of the
// next/core-web-vitals lint (which only covers route files). Run with:
//
//   npm run a11y
//
// Files owned by adjacent issues are excluded and documented in
// docs/accessibility.md: the custom Modal (#82), the reader keyboard nav
// (#86), and RTL / logical-property work (#104).
export default [
  {
    ignores: [
      "components/molecules/Modal.js",
      "components/stellar/PaymentModal.jsx",
      "components/organisms/reels/ReelUploadDialog.jsx",
      "components/organisms/reels/ReelShareDialog.jsx",
      "components/organisms/reels/ReelCommentsSheet.jsx",
      "app/dashboard/library/read/**",
      "**/BookReaderClient.jsx",
      "app/api/**",
      "app/manifest.js",
      "app/robots.js",
      "app/sitemap.js",
      "app/sw.js",
    ],
  },
  {
    files: ["components/**/*.{js,mjs,jsx}", "app/**/*.{js,mjs,jsx}"],
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        URL: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        location: "readonly",
        history: "readonly",
        NodeJS: "readonly",
        __dirname: "readonly",
      },
    },
    plugins: { "jsx-a11y": jsxA11y, "@next/next": nextPlugin },
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
];