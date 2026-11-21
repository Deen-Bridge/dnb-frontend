# Mobile release gates

Issues [#729](https://github.com/Deen-Bridge/dnb-frontend/issues/729) and
[#730](https://github.com/Deen-Bridge/dnb-frontend/issues/730) are covered by
`.github/workflows/mobile.yml`.

Every mobile pull request runs release metadata validation, locale-key parity,
lint, and TypeScript checks. The workflow never reads signing credentials.
EAS signing remains external to the repository and is selected only by the
named `development`, `preview`, or `production` profile in `mobile/eas.json`.

Before a production build, attach:

- the commit SHA, Expo/EAS profile, app version, and artifact checksums;
- the lint, typecheck, locale, and accessibility results;
- staging traces for auth, courses, library, payments, calls, logout, Arabic
  RTL, font scaling, reduced motion, and screen-reader labels; and
- the staged-rollout decision and rollback/hotfix command.

If a check is waived, record the owner, issue, expiry date, and affected
platform in the release record. Never put signing keys, service-account JSON,
or device credentials in the repository or CI logs.
