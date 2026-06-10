// This file configures the initialization of Sentry on the edge runtime.
// The config you add here will be used whenever the edge handles a request.
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,
});
