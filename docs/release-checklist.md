# Frontend release validation

CI uses three explicit profiles:

| Profile | Purpose | Staging credentials |
| --- | --- | --- |
| `unit` | Lint, typecheck, component tests, and local build checks | Not required |
| `integration` | Deployed-like build and browser E2E against the controlled backend URL | Required only when an authenticated E2E scenario is added |
| `production` | Production preflight for HTTPS API routing, mainnet, and canonical USDC issuer | Required in the deployment environment; values are validated without printing secrets |

Run `RELEASE_PROFILE=<profile> npm run release:check` before a release. The validator rejects placeholder/example endpoints and reports configuration field names only.

The current integration E2E profile uses `https://dnb-backend-api.onrender.com` and Stellar testnet. Production deployments must provide the production API URL, `mainnet`, and the canonical mainnet USDC issuer through deployment configuration.
