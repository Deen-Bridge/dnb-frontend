# Admin performance budget (#332)

Admin functionality must never tax learner-facing page loads. This document
records the budget rules and how they are enforced.

## Rule 1 — admin code stays out of public bundles

The app uses the Next.js **App Router**, which code-splits **per route**. Every
`app/[locale]/admin/**` and `app/[locale]/dashboard/admin/**` route compiles to
its own chunk that is only fetched when a user navigates there. A learner on a
public page (`/`, `/dashboard/courses`, `/dashboard/library`, …) never downloads
any admin route's JavaScript.

**Guardrail:** never import an admin page/component from a shared layout, a
learner route, or a component that a learner route renders. Admin surfaces are
reached only through admin routes.

## Rule 2 — heavy libraries load lazily, never in a route's initial JS

The heaviest client libraries in the tree:

| Library | Weight | Where used | Loading |
| --- | --- | --- | --- |
| `recharts` | large | admin revenue analytics; learner charts | **lazy** (`next/dynamic`, `ssr:false`) |
| `pdfjs-dist` | large | library book reader | **lazy** (dynamic `import()` on open) — already isolated |
| `framer-motion` | moderate | animated surfaces | tree-shaken; keep imports granular |

`recharts` on the admin **Revenue Analytics** page (`app/[locale]/admin/analytics/
revenue/`) previously shipped in that route's initial payload. Its chart
rendering now lives in the sibling `RevenueCharts.jsx` module, loaded via
`next/dynamic({ ssr: false })`, so recharts is split into its own async chunk
that downloads **after** the page shell paints (behind a skeleton). See the
before/after First Load JS numbers in the PR description.

**Guardrail:** when adding a chart / PDF / video / other heavy widget to an admin
page, wrap it in `next/dynamic` (with a skeleton `loading` fallback and
`ssr:false` for browser-only libs). Do not statically import `recharts` or
`@/components/ui/chart` into an admin page module — keep them behind the dynamic
boundary.

## Rule 3 — budget targets

- **Admin route First Load JS**: keep in line with the leaner admin pages; a
  route pulling in a heavy widget eagerly (which pushed the revenue route's First
  Load JS well above its siblings) is over budget — split the widget out.
- Measure with the bundle analyzer: `ANALYZE=true npm run build` (writes
  `.next/analyze/*.html`), and read the per-route **First Load JS** column that
  `npm run build` prints. Paste before/after numbers for the touched routes in
  any PR that moves bundle weight.

## Rule 4 — dependency discipline

No new state-management or utility libraries "for performance" without team
discussion. Prefer code-splitting and tree-shaking existing deps over adding new
ones. This PR adds only the Puppeteer runtime used by the Lighthouse auth fixture.

## Lighthouse route and profile gate (#717)

CI runs Lighthouse three times per URL and retains reports as workflow
artifacts. The matrix covers public home/login plus authenticated dashboard,
courses, library, scholarships, and live-spaces surfaces. The auth script seeds
only deterministic browser-local fixture cookies; it never calls the backend or
uses a real account.

The same matrix runs with documented desktop and mobile Lighthouse presets. The
enforced budgets are performance ≥ 0.85, LCP ≤ 2.5s, INP ≤ 500ms, CLS ≤ 0.1,
total transfer ≤ 5 MiB, and initial script transfer ≤ 1.5 MiB. Three runs
reduce single-run noise; threshold changes should include the retained baseline
reports.
