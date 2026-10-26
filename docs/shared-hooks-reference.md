# Shared Hooks API Reference (`hooks/`)

This guide documents the parameter contracts, return shapes, and error behaviors for shared hooks in `hooks/`.

## Stellar & Payments
- `useStellarWallet()`: Manages Freighter connection state (`address`, `network`, `isConnected`, `connect()`, `disconnect()`).
- `useStellarPayment()`: Builds, signs, and submits XLM/USDC payment transactions with duplicate-submission guards.
- `useStellarDonation()` / `useStellarScholarship()`: Specialized wrappers separating general sadaqah donations from milestone-tracked scholarship escrow contributions.

## Media & Uploads
- `useDocumentUpload()` / `useCloudinaryUpload()`: Validates magic bytes and MIME constraints before uploading verification or course assets.

## Auth, RBAC & Real-time State
- `useAuth()` / `useCan(capability)`: Exposes current session user, normalized role, and capability checks backed by `lib/auth/roles.ts`.
- `useNotificationSSE()` / `useStreamingChat()`: Manages Server-Sent Event subscriptions with automatic cleanup on unmount.
