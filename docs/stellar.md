# Stellar auth and payment flows

High-level overview of how the web app signs users in with a Stellar wallet (SEP-10) and how payments and donations are signed and submitted. Everything here is taken from the frontend code. Backend behavior is not in this repo and is marked **unverified**.

## Files at a glance

| Concern | File |
| --- | --- |
| Wallet kit provider, wallet state, `signTransaction` | `components/stellar/StellarProvider.tsx` |
| SEP-10 sign-in | `hooks/useStellarAuth.ts` |
| Purchase payments | `hooks/useStellarPayment.ts` |
| Sadaqah donations | `hooks/useStellarDonation.ts` |
| Error mapping | `lib/stellar/stellarErrors.ts` |
| Payment UI | `components/stellar/PaymentModal.tsx` |
| Wallet connect UI | `components/stellar/WalletConnectButton.tsx` |
| Transaction list | `components/stellar/TransactionHistory.tsx` |
| Login button | `components/organisms/auth/login-form.jsx` (calls `useStellarAuth`) |

## 1. Wallet kit provider

`StellarProvider` is mounted in `components/providers/AppProviders.jsx`. On mount it:

1. Creates a `StellarWalletsKit` with the Freighter, xBull and Albedo modules, default wallet Freighter.
2. Sets `kitInitialized` to true. Hooks check this before doing anything.
3. Checks whether `window.freighter` reports a connected extension (`hasWalletExtension`).
4. If a user is logged in, fetches `GET /api/stellar/wallet/me` to restore the linked wallet.

The provider exposes `selectWallet` (opens the kit's auth modal and returns an address, no backend write), `connectWallet` (same modal, then `POST /api/stellar/wallet/connect`), `disconnectWallet`, `refreshBalance`, `signTransaction` and `validateForPayment`.

`signTransaction(xdr, networkPassphrase)` calls the kit and turns a user rejection into an error with `code = "USER_REJECTED"`.

### Network configuration

- `NEXT_PUBLIC_STELLAR_NETWORK`: `testnet` (default) or `mainnet`. Documented in `README.md` and `.env.example`.
- The provider reads `process.env.NEXT_PUBLIC_STELLAR_NETWORK` directly. Its `EXPECTED_PASSPHRASE` is `Networks.PUBLIC` for `mainnet`, otherwise `Networks.TESTNET`.
- `lib/config/env.ts` also exposes `config.stellarNetwork` (default `testnet`), which the transparency page uses. Both read the same variable, but the provider does not go through `config`.
- `playwright.config.js` sets it to `testnet` for e2e runs.
- The donation hook falls back to the same testnet/mainnet choice when the server does not return a `networkPassphrase`.

## 2. SEP-10 sign-in (`useStellarAuth`)

Endpoints used by the frontend:

- `GET /api/auth/stellar/challenge?account=<address>` returns `{ transaction, networkPassphrase }`.
- `POST /api/auth/stellar/verify` with body `{ transaction: <signed XDR> }`.

Steps in `loginWithStellar()`:

1. **Availability probe (on mount).** `GET` the challenge endpoint. A 404 or 503 sets `stellarAuthAvailable = false`, which disables the button. Any other response counts as available.
2. **Select wallet.** `selectWallet()` opens the kit modal and gets the address.
3. **Challenge.** `GET` the challenge for that address. The response must include `transaction` and a network passphrase.
4. **Sign.** `signTransaction(transaction, networkPassphrase)` asks the wallet to sign the challenge.
5. **Verify.** `POST` the signed XDR. If the error looks like an expired challenge, the hook fetches a new challenge and signs again, once.
6. **Result handling:**
   - `registered === false`: shows a "link your wallet from the dashboard" message and returns `{ unregistered: true, account }`. No session is created.
   - Otherwise the response must contain `token` and `user`. The hook calls `persistSession(token, user)` from `hooks/useAuth` and returns the user. `login-form.jsx` then redirects to `/admin` or `/dashboard`.
   - A 404 or 503 turns the feature off for the session.
   - Closing the wallet modal is treated as cancellation and returns `null`.

Note: the hook does not verify the signature or the challenge itself. That is done by the server at `/verify`.

**Unverified:** challenge expiry time, how the server checks signatures, whether the session token is set as a cookie, and the exact shape of the verify response. These are inferred from the client code only.

## 3. Purchase payments (`useStellarPayment`)

Used by `PaymentModal`. Three steps, each a separate server call.

1. **Initialize.** `POST /api/stellar/payment/initialize` with `{ itemType, itemId, buyerWallet }`. The response is stored as `currentTransaction` and must have `success: true`. The client reads `transactionId`, `payment.xdr`, `payment.networkPassphrase` and, optionally, `sep7Uri` (rendered as a QR code by `Sep7QrCode`).
2. **Sign.** `executePayment(paymentData)` calls `signTransaction(payment.xdr, payment.networkPassphrase)`.
3. **Submit.** `POST /api/stellar/payment/submit` with `{ transactionId, signedXdr }`. On success it shows a toast, refreshes the user and balance, and clears `currentTransaction`.

Other calls:

- `cancelPayment()`: `DELETE /api/stellar/payment/transactions/:transactionId`, then clears local state. `PaymentModal` calls it when the user goes back or closes the modal mid-flow.
- `getTransactionHistory({ role, page, limit })`: `GET /api/stellar/payment/transactions`. Used by `TransactionHistory`.
- `getTransaction(id)`: `GET /api/stellar/payment/transactions/:id`.

Error handling: a user rejection returns `false` and shows a "cancelled" toast. Other errors are sent to Sentry (tag `feature: stellar-payment`) and mapped through `mapStellarError`. `PaymentModal` also runs `validateForPayment` before the user confirms. It checks wallet connection, network mismatch, USDC trustline and USDC balance.

## 4. Donations (`useStellarDonation`)

Used by `app/[locale]/dashboard/sadaqah/page.jsx`.

1. **Initialize.** `POST /api/stellar/donation/initialize` with `{ amount, publicKey }`. The response must include `donationId` and `transactionXdr`, and may include `networkPassphrase`.
2. **Sign.** `signTransaction(transactionXdr, networkPassphrase ?? <network from config>)`.
3. **Submit.** `POST /api/stellar/donation/submit` with `{ donationId, signedXdr }`.

Other calls:

- `getDonationStats()`: `GET /api/stellar/donation/stats`. A 503 is reported as `unconfigured: true`.
- `cancelDonation()` only clears local state. It does not call the server.

Error messages are matched on text (for example `insufficient`, `op_no_trust`, `rejected`). These are the same Horizon-style codes listed in `lib/stellar/stellarErrors.ts`.

## 5. Wallet endpoints (used by the provider)

- `GET /api/stellar/wallet/me`: restores the linked wallet on load.
- `POST /api/stellar/wallet/connect` with `{ publicKey }`.
- `DELETE /api/stellar/wallet/disconnect`.
- `GET /api/stellar/wallet/balance/:publicKey`: refreshes balance info.

## 6. Testnet vs mainnet

- The default is `testnet`. Set `NEXT_PUBLIC_STELLAR_NETWORK=mainnet` for production.
- The frontend chooses the passphrase in three places: the provider's kit init, the donation fallback, and whatever `networkPassphrase` the server returns for payments. The payment hook has no fallback and uses the server's value.
- Network mismatch detection is weak. `checkNetwork` in the provider calls `StellarWalletsKit.authModal()` and only sets `networkMismatch` when the error message contains "network" or "mismatch". On success it always sets it to false. **Unverified:** whether the wallet kit reports mismatches this way.

## Known gaps

- Backend response shapes and the server-side checks for SEP-10, payments and donations are not in this repo. **Unverified.**
- `lib/stellar/stellarErrors.ts` is a `.ts` file, but some comments and `eslint.config.a11y.mjs` refer to `.js`/`.jsx` names. Those references are stale.
- Typing is incomplete in the hooks. See `docs/type-safety.md` (issues #514 to #516).
