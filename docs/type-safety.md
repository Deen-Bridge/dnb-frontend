# Type Safety — the explicit-`any` guardrail

**Issue:** [#523](https://github.com/Deen-Bridge/dnb-frontend/issues/523)

`tsconfig.json` already compiles with `"strict": true`, so `noImplicitAny` is
effectively on. What remains are **explicit** `any`s — sites where a developer
wrote `any` by hand, silently opting that one spot out of the type system.

This document describes the guardrail that keeps the count from growing, how
to remove an `any` when you touch a file, and how the backlog is tracked.

---

## 1. The rule

`eslint.config.mjs` enables `@typescript-eslint/no-explicit-any` for every
`.ts` / `.tsx` file:

```js
{
  files: ["**/*.{ts,tsx}"],
  plugins: { "@typescript-eslint": tsPlugin },
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
  },
}
```

It is set to **`warn`** on purpose: the backlog is still being typed out by
[#514](https://github.com/Deen-Bridge/dnb-frontend/issues/514)–[#522](https://github.com/Deen-Bridge/dnb-frontend/issues/522),
and flipping the rule to `error` before the backlog is empty would turn CI
red for every open pull request.

**When the tracked count reaches zero, flip the rule to `error`.** The guard
script below already fails CI on any *new* explicit `any`, so the backlog
cannot grow while it drains.

### Scope

`npm run lint` covers the whole first-party source tree, not just the Next.js
route directories:

```bash
npm run lint
# next lint --dir app --dir components --dir lib --dir hooks --dir contexts
#            --dir types --dir __tests__ --dir e2e
```

`hooks/`, `contexts/`, `types/` and the test folders used to be invisible to
the linter, which is where a large share of the backlog lived.

---

## 2. The escape hatch

An explicit `any` is only acceptable when it is **scoped** and **justified**:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- third-party SDK returns an untyped blob
const payload = await legacySdk.fetch();
```

Rules:

1. **Scoped** — use `eslint-disable-next-line` (or `eslint-disable-line`) and
   name the rule. Never use a blanket `/* eslint-disable */`.
2. **Justified** — put `-- <reason>` after the rule name on the same line.
   The guard script fails CI when the reason is missing.
3. **No file-level blanket** — `// @ts-nocheck` is strictly prohibited, and
   `// @ts-ignore` / `// @ts-expect-error` are last-resort only.

> Prefer `unknown` over `any` whenever the shape is not known yet: `unknown`
> forces a narrowing step at every use site, while `any` disables checking for
> the whole expression.

> **Writing a test fixture?** The guard script scans every source file for
> bare `eslint-disable` directives for this rule, so a fixture that needs the
> literal directive text should build it from a constant instead of writing it
> out inline — see `__tests__/tooling/explicit-any-guard.test.js` for the
> pattern.

---

## 3. The tracked count

`scripts/explicit-any-baseline.json` records the current backlog, per file:

```json
{
  "rule": "@typescript-eslint/no-explicit-any",
  "issue": "https://github.com/Deen-Bridge/dnb-frontend/issues/523",
  "total": 398,
  "files": { "hooks/usePurchases.ts": 12, "…": 0 }
}
```

Check it locally with:

```bash
npm run lint:any
```

The guard script:

* counts every explicit `any` that is **not** covered by a justified disable;
* compares that count against the baseline;
* **fails** when a file gains explicit `any`s, or when a new file introduces
  them;
* **fails** when an `eslint-disable` for the rule is missing its `-- <reason>`;
* **passes** when the count shrinks, and tells you how many sites are left.

Regenerate the baseline after typing a module out:

```bash
npm run lint:any -- --update
```

> The baseline only ever shrinks. A `--update` that *raises* the total means
> new `any`s were introduced — review the diff before committing it.

CI runs the same command on every pull request:

```yaml
- name: Guard explicit-any count
  run: npm run lint:any
```

---

## 4. Working on the backlog

The per-module typing issues are:

| Issue | Module |
| :--- | :--- |
| [#514](https://github.com/Deen-Bridge/dnb-frontend/issues/514) | `hooks/useStellarAuth.ts` — SEP-10 payloads |
| [#515](https://github.com/Deen-Bridge/dnb-frontend/issues/515) | `hooks/useStellarDonation.ts` — donation payloads |
| [#516](https://github.com/Deen-Bridge/dnb-frontend/issues/516) | `hooks/useStellarPayment.ts` — transaction shapes |
| [#517](https://github.com/Deen-Bridge/dnb-frontend/issues/517) | `hooks/useDocumentUpload.ts` — upload pipeline |
| [#518](https://github.com/Deen-Bridge/dnb-frontend/issues/518) | `hooks/useStreamingChat.ts` — SSE events |
| [#519](https://github.com/Deen-Bridge/dnb-frontend/issues/519) | `hooks/useFlaggedContent.ts` — flagged item shape |
| [#520](https://github.com/Deen-Bridge/dnb-frontend/issues/520) | `lib/services/emails/*` — email payloads |
| [#521](https://github.com/Deen-Bridge/dnb-frontend/issues/521) | `lib/validation/password.ts` — dynamic `superRefine` |
| [#522](https://github.com/Deen-Bridge/dnb-frontend/issues/522) | `lib/actions` — server action DTOs |

When you pick one up:

1. Replace the `any` with a real type — a domain type from `types/api.ts`,
   `types/stellar.ts` or `types/auth.ts`, a `zod` schema, or `unknown` plus a
   narrowing step.
2. Run `npm run typecheck` and `npm test`.
3. Run `npm run lint:any -- --update` to refresh the baseline.
4. Flip the rule to `error` in `eslint.config.mjs` once the total is `0`.

---

## 5. Related documents

* [`docs/typescript-migration.md`](./typescript-migration.md) — the incremental
  migration strategy and the general `any` / `@ts-ignore` policy.
* [`docs/rbac.md`](./rbac.md) — role normalisation, used by the RBAC helpers
  that still carry a few explicit `any`s.
