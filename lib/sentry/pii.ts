const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_REGEX = /(?<!\d)\+?\d[\d .()\-]{8,}\d(?!\d)/g;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
const JWT_REGEX = /\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;
const REDACTED = "[redacted]";

export const SENTRY_REDACTION_SCHEMA = Object.freeze({
  sensitiveKeys: [
    "accessToken", "apiKey", "authorization", "authToken", "cookie", "cookies",
    "csrfToken", "idToken", "jwt", "password", "privateKey", "query",
    "query_string", "refreshToken", "secret", "seed", "session", "setCookie",
    "token", "userInfo", "accountNumber", "bankAccount", "cardNumber", "iban",
    "paymentId", "routingNumber", "walletAddress", "walletPublicKey", "answer",
    "assessment", "courseContent", "lessonContent", "learningData", "prompt",
    "question", "quizAnswer", "studentAnswer", "url", "href", "path",
  ],
  maxDepth: 8,
  maxEntries: 500,
});

const SENSITIVE_KEY_PATTERNS = [
  /(?:^|_)(?:access|api|auth|csrf|id|refresh)[_-]?(?:key|token)$/,
  /(?:^|_)(?:authorization|cookie|password|passphrase|private[_-]?key|secret|seed|session|token)$/,
  /(?:account|bank|card|iban|payment|routing|wallet)[_-]?(?:id|number|key|address|identifier)?$/,
  /(?:answer|assessment|course[_-]?content|lesson[_-]?content|learning|prompt|question|quiz|student)/,
];

type ScrubState = { entries: number; seen: WeakMap<object, unknown> };

function normalizedKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizedKey(key);
  return SENTRY_REDACTION_SCHEMA.sensitiveKeys.some((entry) => normalizedKey(entry) === normalized)
    || SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(normalized));
}

function scrubString(value: string): string {
  let scrubbed = value
    .replace(BEARER_REGEX, "Bearer [redacted-token]")
    .replace(JWT_REGEX, "[redacted-token]")
    .replace(EMAIL_REGEX, "[redacted-email]")
    .replace(PHONE_REGEX, "[redacted-phone]")
    .replace(URL_REGEX, "[redacted-url]");

  scrubbed = scrubbed.replace(
    /([?&](?:access[_-]?token|api[_-]?key|auth(?:orization)?|cookie|email|password|phone|refresh[_-]?token|secret|session|token|user[_-]?id|wallet[_-]?address)=)[^&#\s]+/gi,
    "$1[redacted]",
  );

  try {
    const parsed: unknown = JSON.parse(scrubbed);
    if (parsed && typeof parsed === "object") {
      const scrubbedJson = scrubValue(parsed, { entries: 0, seen: new WeakMap() }, 0);
      return JSON.stringify(scrubbedJson);
    }
  } catch {
    // Most telemetry strings are not JSON; the regex policy above still applies.
  }
  return scrubbed;
}

function scrubValue(value: unknown, state: ScrubState, depth: number): unknown {
  if (typeof value === "string") return scrubString(value);
  if (!value || typeof value !== "object") return value;
  if (depth >= SENTRY_REDACTION_SCHEMA.maxDepth || state.entries >= SENTRY_REDACTION_SCHEMA.maxEntries) return REDACTED;

  const previous = state.seen.get(value);
  if (previous) return previous;

  if (Array.isArray(value)) {
    const result: unknown[] = [];
    state.seen.set(value, result);
    for (const item of value) {
      state.entries += 1;
      result.push(scrubValue(item, state, depth + 1));
      if (state.entries >= SENTRY_REDACTION_SCHEMA.maxEntries) break;
    }
    return result;
  }

  const result: Record<string, unknown> = {};
  state.seen.set(value, result);
  for (const [key, entry] of Object.entries(value)) {
    state.entries += 1;
    result[key] = isSensitiveKey(key) ? REDACTED : scrubValue(entry, state, depth + 1);
    if (state.entries >= SENTRY_REDACTION_SCHEMA.maxEntries) break;
  }
  return result;
}

export function scrubSentryEvent(event: unknown): unknown {
  if (!event || typeof event !== "object") return event;
  const scrubbed = scrubValue(
    event,
    { entries: 0, seen: new WeakMap() },
    0
  ) as Record<string, unknown>;

  if (Array.isArray(scrubbed.breadcrumbs)) {
    scrubbed.breadcrumbs = scrubbed.breadcrumbs.map((crumb) => {
      if (!crumb || typeof crumb !== "object") return crumb;
      const { data } = crumb as Record<string, unknown>;
      return data && typeof data === "object" ? { data } : {};
    });
  }

  if (scrubbed.exception && typeof scrubbed.exception === "object") {
    const exception = scrubbed.exception as Record<string, unknown>;
    if (Array.isArray(exception.values)) {
      exception.values = exception.values.map((value) => ({
        type:
          value &&
          typeof value === "object" &&
          typeof (value as Record<string, unknown>).type === "string"
            ? (value as Record<string, unknown>).type
            : "Error",
      }));
    }
  }

  if (scrubbed.user && typeof scrubbed.user === "object") {
    const user = scrubbed.user as Record<string, unknown>;
    scrubbed.user = user.id != null ? { id: user.id } : {};
  }

  delete scrubbed.message;
  delete scrubbed.request;

  return scrubbed;
}
