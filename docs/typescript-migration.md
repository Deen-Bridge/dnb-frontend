# TypeScript Migration Guide

This document outlines the architecture, contributor workflow, and type safety policies for the ongoing incremental TypeScript migration in `dnb-frontend` ([#103](https://github.com/Deen-Bridge/dnb-frontend/issues/103)).

---

## 1. Overview & Strategy

The codebase uses an **incremental migration strategy**:
- **Strict compiler configuration** (`tsconfig.json`) with `"allowJs": true`, `"checkJs": false`, and `"noEmit": true`.
- Converted layers (`lib/`, `hooks/`, `components/stellar/`, and `types/`) are strictly type-checked.
- Existing JavaScript files (`.js`, `.jsx`) continue to build and run normally without blocking migration progress.
- CI runs `npm run typecheck` (`tsc --noEmit`) to gate all pull requests against regressions in typed surfaces.

---

## 2. Directory Structure & Shared Types

Shared type definitions live in the root `types/` directory:

| Path | Purpose |
| :--- | :--- |
| `types/api.ts` | Zod schemas and derived TypeScript types for shared models (e.g., `User`, `Course`, `Book`, `Space`, `Review`, `ApiResponse`). |
| `types/stellar.ts` | Stellar blockchain types: Horizon responses, payment records, SEP-7 payloads, wallet metadata. |
| `types/auth.ts` | Auth credentials, session payloads, role definitions, and token structures. |
| `types/shims.d.ts` | Ambient declarations for untyped third-party modules and asset loaders. |

### Deriving Types from Zod Schemas

To prevent schema-type drift, API models are defined as Zod schemas and inferred using `z.infer`:

```typescript
import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "educator", "admin", "superadmin"]),
});

export type User = z.infer<typeof UserSchema>;
```

---

## 3. Step-by-Step Contributor Workflow

When migrating a `.js` or `.jsx` file to TypeScript:

1. **Rename the file**:
   - Plain logic / utilities / actions: `.js` $\rightarrow$ `.ts`
   - React components / hooks with JSX: `.jsx` (or `.js` with JSX) $\rightarrow$ `.tsx`

2. **Add Type Annotations**:
   - Explicitly type function parameters, return values, and component `props`.
   - Import domain types from `@/types/api`, `@/types/stellar`, or `@/types/auth`.
   - Export named interfaces for component props (e.g., `export interface ButtonProps { ... }`).

3. **Verify Locally**:
   ```bash
   npm run typecheck
   ```
   Ensure zero TypeScript diagnostic errors are emitted.

4. **Verify Tests and Linting**:
   ```bash
   npm test
   npm run lint
   ```

---

## 4. Policy on `any` and `@ts-ignore`

To maintain rigorous type safety across the repository:

1. **No blanket file-level suppressions**:
   - `// @ts-nocheck` is **strictly prohibited**.
   - `// @ts-ignore` or `// @ts-expect-error` should only be used as a last resort for third-party library incompatibilities with an inline comment explaining why.

2. **Policy on `any`**:
   - Avoid `any` whenever possible; prefer `unknown`, generic parameters, or union types.
   - If `any` is temporarily unavoidable (e.g., untyped backend payload or mock harness), it **MUST** be accompanied by a `// TODO(types): <reason>` comment on the same line or immediately preceding it.
   - CI and repo verification scripts check for unannotated `any` usages in migrated directories.

Example:
```typescript
// Allowed:
const handleLegacyData = (rawPayload: any) => { // TODO(types): Replace with backend legacy response schema
  console.log(rawPayload);
};

// Forbidden:
const handleLegacyData = (rawPayload: any) => { ... };
```

---

## 5. CI Gating

The GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs the following check on every pull request:

```yaml
- name: Run type check
  run: npm run typecheck
```

Any type mismatch in `.ts` and `.tsx` files will cause the CI check to fail. Ensure all local conversions pass `npm run typecheck` before pushing your branch.
