// This file configures the initialization of Sentry for edge runtime features
// (middleware, edge routes, etc). The config here doesn't apply to serverless
// functions or client-side code.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend, sentryBeforeSendTransaction } from "./sentry.shared.config";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: false,

  environment: process.env.NODE_ENV,

  tracesSampleRate: 0.1,

  debug: false,

  beforeSend: sentryBeforeSend,
  beforeSendTransaction: sentryBeforeSendTransaction,
});
