/**
 * PII scrubbing shared by every Sentry config (server, edge, client).
 * Non-negotiable: auth tokens, user objects, cookies and email addresses
 * must never leave the browser/server.
 */

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const SENSITIVE_KEYS = new Set(["authToken", "userInfo"]);
const REDACTED = "[redacted]";

const redactEmails = (value) =>
  typeof value === "string" ? value.replace(EMAIL_REGEX, "[redacted-email]") : value;

const scrubObjectValues = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      obj[key] = REDACTED;
    } else if (typeof obj[key] === "string") {
      obj[key] = redactEmails(obj[key]);
    }
  }
  return obj;
};

export const scrubSentryEvent = (event) => {
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers.authorization;
      delete event.request.headers.Cookie;
      delete event.request.headers.cookie;
    }
    if (event.request.cookies) {
      event.request.cookies = {};
    }
    if (typeof event.request.data === "string") {
      event.request.data = redactEmails(event.request.data);
    }
  }

  if (event.user && typeof event.user === "object") {
    const { id } = event.user;
    event.user = id != null ? { id } : {};
  }

  if (event.extra) {
    scrubObjectValues(event.extra);
  }

  if (Array.isArray(event.breadcrumbs)) {
    for (const crumb of event.breadcrumbs) {
      if (!crumb) continue;
      if (typeof crumb.message === "string") {
        crumb.message = redactEmails(crumb.message);
      }
      scrubObjectValues(crumb.data);
    }
  }

  return event;
};
