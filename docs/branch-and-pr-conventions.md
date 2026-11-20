# Branch, Commit, and Pull Request Conventions

## Branch Naming
Use scoped prefixes matching the change category:
- `feat/<short-slug>` — new product or Stellar integration features
- `fix/<short-slug>` — bug fixes and regression patches
- `security/<short-slug>` — CSP, redirect validation, and upload hardening
- `docs/<short-slug>` — architecture and contributor documentation
- `test/<short-slug>` — unit and Playwright E2E test suites

## Commit & PR Hygiene
1. Follow Conventional Commits (`feat:`, `fix:`, `security:`, `docs:`, `test:`).
2. Link the target issue using `Closes #<issue-number>` in the PR description.
3. Run `npm test` (Vitest) and `npm run lint` locally before pushing.
