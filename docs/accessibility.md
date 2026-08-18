# Accessibility

This document describes how accessibility (WCAG 2.1 AA) is enforced in the
DeenBridge frontend, what was fixed, and the known gaps still being tracked by
adjacent issues.

## Running the checks

The project has two lint passes:

1. `npm run lint` — `next lint` (next/core-web-vitals). This only covers route
   files under `app/` and `lib/`; `components/**` are intentionally excluded by
   the ESLint config.
2. `npm run a11y` — a dedicated accessibility gate that applies
   `eslint-plugin-jsx-a11y` (static, axe-aligned WCAG rules) to the whole
   source tree (`components/**` and `app/**`), excluding route metadata files.
   Config lives in `eslint.config.a11y.mjs`. The two ESLint plugins it loads
   (`eslint-plugin-jsx-a11y` and `@next/eslint-plugin-next`) are provided by
   `eslint-config-next`, so no extra install is required.

Both run in CI (`.github/workflows/ci.yml`). The a11y gate must report zero
errors before merging.

## What the a11y gate covers

The gate runs the full `jsx-a11y/recommended` rule set. After the WCAG pass the
tree is clean. Representative fixes include:

- **Form controls** — every select/combobox/file input/textarea has an
  associated `<label htmlFor>` or `aria-label` (TransactionHistory,
  profile-setup step-two, wizard-steps basics/media, space/book create forms,
  ComboBox, CommandPalette, chat inputs, review textareas, settings toggles).
- **Icon-only buttons** — `aria-label` added where a button only renders an
  icon (notification bell, reconnect, mark-read/delete, send/stop in
  StreamingAIChat, curriculum move/remove, receipt, password show/hide).
- **Keyboard operability** — click handlers moved from `<div>`/`<a>` onto
  real `<button>` elements (placeholder Notybell, ai chat-history overlay,
  login "forgot password"); the `Button` `to`-variant now fires `onClick` from
  the `<button>` itself; visible `focus-visible` rings added globally in
  `styles/globals.css` and on the button component and interactive cards.
- **Images** — decorative images/avatars are `alt=""`, meaningful images get
  descriptive alt text (book covers, mosque illustration), star ratings expose
  a text alternative via `role="img"` + `aria-label` or sr-only text.
- **Landmarks / structure** — skip link in `app/layout.js`; consistent
  `id="main-content"` on `<main>`; primary and account sidebars wrapped in
  `<nav aria-label>`; duplicate `<main>` removed; single `h1` per page.

## Accepted exceptions (owned by adjacent issues)

These files are ignored by the gate and documented here:

- **Custom Modal (#82)** — `components/molecules/Modal.js`,
  `components/stellar/PaymentModal.jsx`, and the reels dialogs/sheets
  (`ReelUploadDialog.jsx`, `ReelShareDialog.jsx`, `ReelCommentsSheet.jsx`).
  The Modal.js source does not parse under the a11y gate's parser; focus
  trapping, Escape handling, and aria attributes are tracked by the Modal
  rewrite in #82.
- **Reader keyboard navigation (#86)** — `app/dashboard/library/read/**` and
  `BookReaderClient.jsx`. Screen-reader/keyboard operation of the PDF reader is
  tracked in #86.
- **RTL / logical properties (#104)** — bidirectional and logical-property
  work, which interacts with focus and semantics, is tracked in #104.

## Known gaps

- **Dark-mode `bg-accent` text contrast** — `--color-accent: #5aa83e` in dark
  mode fails AA for `bg-accent text-white` (2.96:1). The token cannot satisfy
  both white-on-fill and bright-text-on-dark requirements, so the flagged
  surfaces were migrated to a new constant token `--color-accent-card`
  (`#265902`, white = 8.36:1 in both themes). Roughly 51 other `bg-accent
  text-white` usages remain; migrating them is coordinated with the theming
  token work, not this branch.
- **Video captions** — user-generated reels have no caption tracks; the
  `media-has-caption` rule is suppressed per element with the video given an
  `aria-label`. Adding caption support is a product decision.
- **Static analysis limits** — association between custom components and their
  labels/names relies on the manual audit + code review; `npm run a11y` catches
  the mechanical rules, but an axe/playwright crawl in the browser is
  recommended before launch.