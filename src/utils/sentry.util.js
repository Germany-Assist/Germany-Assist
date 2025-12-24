import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const captureError = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) return;
  console.log("im sending to dsn");
  Sentry.captureException(error, {
    extra: context,
  });
};
