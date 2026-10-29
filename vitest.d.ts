// Type-only: augments Vitest's `Assertion<T>` with jest-dom matchers
// (toBeInTheDocument, toHaveAttribute, etc). The runtime registration
// already happens in vitest.setup.js; this file exists only so `tsc`
// picks up the ambient types, since vitest.setup.js (a .js file) isn't
// matched by tsconfig's `**/*.ts` include glob.
import "@testing-library/jest-dom/vitest";
