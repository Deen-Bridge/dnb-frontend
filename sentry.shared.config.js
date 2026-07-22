// Shared Sentry event scrubbing used by the client, server, and edge configs.
//
// Identity/PII in this app lives in non-httpOnly cookies (authToken,
// userInfo including email) so it can leak into event payloads via request
// headers, cookies, breadcrumbs, or the "extra" context. This module strips
// all of that before anything leaves the browser/server.

const SENSITIVE_HEADER_KEYS = ["authorization", "cookie", "set-cookie"];
const SENSITIVE_COOKIE_KEYS = ["authToken", "userInfo"];
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Known noisy, non-actionable errors we don't want cluttering Sentry.
export const IGNORED_ERRORS = [
  // Stellar wallet-kit modal dismissed by the user - not a real error.
  "wallet modal closed",
  "User closed wallet modal",
];

function scrubString(value) {
  if (typeof value !== "string") return value;
  return value.replace(EMAIL_REGEX, "[redacted-email]");
}

function scrubHeaders(headers) {
  if (!headers || typeof headers !== "object") return headers;
  const cleaned = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADER_KEYS.includes(key.toLowerCase())) {
      cleaned[key] = "[redacted]";
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function scrubUrl(url) {
  if (typeof url !== "string") return url;
  let cleaned = url;
  for (const key of SENSITIVE_COOKIE_KEYS) {
    const pattern = new RegExp(`([?&]${key}=)[^&]*`, "gi");
    cleaned = cleaned.replace(pattern, "$1[redacted]");
  }
  return scrubString(cleaned);
}

function scrubRequest(request) {
  if (!request) return request;
  const cleaned = { ...request };

  // Never send cookies, regardless of shape.
  delete cleaned.cookies;

  if (cleaned.headers) {
    cleaned.headers = scrubHeaders(cleaned.headers);
  }
  if (cleaned.url) {
    cleaned.url = scrubUrl(cleaned.url);
  }
  return cleaned;
}

function scrubBreadcrumbs(breadcrumbs) {
  if (!Array.isArray(breadcrumbs)) return breadcrumbs;
  return breadcrumbs.map((crumb) => {
    const cleaned = { ...crumb };
    if (cleaned.data) {
      const data = { ...cleaned.data };
      delete data.cookies;
      delete data.Cookie;
      delete data.cookie;
      if (data.headers) data.headers = scrubHeaders(data.headers);
      if (data.url) data.url = scrubUrl(data.url);
      if (typeof data.message === "string") data.message = scrubString(data.message);
      cleaned.data = data;
    }
    if (typeof cleaned.message === "string") {
      cleaned.message = scrubString(cleaned.message);
    }
    return cleaned;
  });
}

function scrubExtra(extra) {
  if (!extra || typeof extra !== "object") return extra;
  const cleaned = { ...extra };
  for (const key of SENSITIVE_COOKIE_KEYS) {
    delete cleaned[key];
  }
  delete cleaned.cookies;
  delete cleaned.Cookie;
  delete cleaned.cookie;
  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === "string") cleaned[key] = scrubString(value);
  }
  return cleaned;
}

/**
 * Shared beforeSend hook: strips cookies, Authorization/Cookie headers,
 * authToken/userInfo values, and email addresses from every event. Only a
 * stable anonymous user id is ever attached (see hooks/useAuth.js /
 * StellarProvider - callers should only ever call Sentry.setUser({ id }),
 * never with email or name).
 */
export function sentryBeforeSend(event) {
  if (event.request) {
    event.request = scrubRequest(event.request);
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = scrubBreadcrumbs(event.breadcrumbs);
  }
  if (event.extra) {
    event.extra = scrubExtra(event.extra);
  }
  if (event.user) {
    // Keep only a stable anonymous identifier - never email or name.
    event.user = event.user.id ? { id: event.user.id } : undefined;
  }
  if (event.message) {
    event.message = scrubString(event.message);
  }
  if (Array.isArray(event.exception?.values)) {
    event.exception.values = event.exception.values.map((value) => ({
      ...value,
      value: scrubString(value.value),
    }));
  }

  // Drop known-noisy, non-actionable events entirely.
  const errorText =
    event.exception?.values?.[0]?.value || event.message || "";
  if (IGNORED_ERRORS.some((needle) => errorText.includes(needle))) {
    return null;
  }

  return event;
}

export function sentryBeforeSendTransaction(event) {
  if (event.request) {
    event.request = scrubRequest(event.request);
  }
  if (event.user) {
    event.user = event.user.id ? { id: event.user.id } : undefined;
  }
  return event;
}
