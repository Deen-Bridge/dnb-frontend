const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const SENSITIVE_KEYS = new Set([
  "authToken",
  "userInfo",
  "authorization",
  "cookie",
  "cookies",
  "query",
  "query_string",
  "url",
  "href",
  "path",
]);
const REDACTED = "[redacted]";

const redactEmails = (value: unknown): unknown =>
  typeof value === "string"
    ? value
        .replace(EMAIL_REGEX, "[redacted-email]")
        .replace(/https?:\/\/[^\s"'<>]+/gi, "[redacted-url]")
    : value;

const scrubObjectValues = (obj: any): any => { // TODO(types): Sentry arbitrary extra/data dictionary
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

export const scrubSentryEvent = (event: any): any => { // TODO(types): Sentry Event object shape
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
    delete event.request.url;
    delete event.request.query_string;
    delete event.request.data;
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
      delete crumb.message;
      delete crumb.timestamp;
      scrubObjectValues(crumb.data);
    }
  }

  delete event.message;
  delete event.request;
  if (Array.isArray(event.exception?.values)) {
    event.exception.values = event.exception.values.map((value: any) => ({
      type: typeof value?.type === "string" ? value.type : "Error",
    }));
  }

  return event;
};
