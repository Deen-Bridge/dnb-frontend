# Mobile release configuration

Development builds may use localhost APIs, Stellar testnet, and the public Jitsi service.

Preview and production builds fail validation unless API and AI endpoints use non-local HTTPS URLs, the USDC issuer and Firebase values are present, Stellar uses mainnet, and Jitsi uses a private domain with JWT enforcement enabled. Run `npm run config:test` and `npm run config:check` from `mobile/`; diagnostics print configuration names and status only, never secret values.
