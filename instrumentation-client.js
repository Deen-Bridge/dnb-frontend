// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import {
  sentryBeforeSend,
  sentryBeforeSendTransaction,
  IGNORED_ERRORS,
} from "./sentry.shared.config";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Never send cookies, headers, or IP addresses by default. Scrubbing in
  // beforeSend below is a defense-in-depth backstop, not the primary control.
  sendDefaultPii: false,

  environment: process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Known noisy, non-actionable errors (e.g. closing the Stellar wallet
  // connect modal) should never create an event.
  ignoreErrors: IGNORED_ERRORS,

  beforeSend: sentryBeforeSend,
  beforeSendTransaction: sentryBeforeSendTransaction,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
