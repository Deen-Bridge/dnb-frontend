# Dependency and release governance

The web release is governed by the lockfile and the CI dependency gate. Changes to
`package-lock.json` must be reviewed with the manifest together; CI rejects lockfile
drift, high-severity advisories, and package install scripts that are not explicitly
allowlisted in `package.json`.

Source maps are uploaded only by the Sentry release integration when its repository
secrets are present. `hideSourcemaps: true` prevents public `.map` references in the
Next.js output. The build remains usable without Sentry credentials, but source-map
upload is intentionally unavailable in that case.

When a dependency exception is needed, record the package, advisory, owner, reason,
expiry date, and replacement plan in the pull request. Expired exceptions are failures,
not permanent suppressions.
