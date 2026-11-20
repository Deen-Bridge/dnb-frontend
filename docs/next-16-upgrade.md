# Next.js 16 upgrade

This branch upgrades the application to Next.js 16.4.6, the matching
`eslint-config-next` and bundle-analyzer packages, and the Next 16-compatible
Node.js floor of 20.9.0.

## Migration notes

- The locale middleware is now `proxy.js`, using the same `next-intl` routing
  matcher and behavior.
- Turbopack is declared explicitly for Next 16 builds. The existing webpack
  canvas fallback remains available for integrations that invoke webpack.
- The npm lockfile was regenerated with npm 11 and lifecycle scripts disabled.

## Validation matrix

CI remains responsible for lint, accessibility, typecheck, unit tests, build,
Playwright smoke tests, and Lighthouse. A preview should also be checked on
desktop and mobile for authentication, Google login, protected dashboard
routes, payments, AI chat, spaces, and video calls.

## Rollback

If a preview or CI check identifies a regression, revert this focused commit
or restore the previous `next`, `@next/bundle-analyzer`, and
`eslint-config-next` versions together with the prior lockfile. Restore
`middleware.js` from the parent commit if the deployment platform has not yet
recognized `proxy.js`. Re-run `npm ci` and the full CI matrix before retrying
the deployment.
