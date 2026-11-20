# Mobile Stellar safety contract

Every mobile payment build must provide an explicit `testnet` or `mainnet`
network and a valid USDC issuer account. The app must fail closed before a
quote, preflight, initialize, or submit request when either value is invalid.

The backend remains authoritative for asset/network checks, idempotency, and
transaction state. The mobile client uses the preflight endpoint before
initialization and must not treat a wallet signature as settlement. Production
builds should set `EXPO_PUBLIC_STELLAR_NETWORK=mainnet` and
`EXPO_PUBLIC_USDC_ISSUER` through the release environment, never a source file.
