"use client";

import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "./lib/sentry/pii";

// Wallet modal cancellations are intentional user actions, not bugs.
// Patterns mirror lib/stellar/stellarErrors.js (isUserRejection / isNoWalletError).
const ignoreErrors = [
  "Modal closed by user",
  "Transaction cancelled",
  "USER_REJECTED",
  /modal.*(closed|dismissed)/i,
  /(request|user|signing).*(rejected|cancelled|declined|denied)/i,
  /(no wallet|no extension|not installed) (detected|found)?/i,
];

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  ignoreErrors,
  beforeSend(event) {
    return scrubSentryEvent(event);
  },
});
