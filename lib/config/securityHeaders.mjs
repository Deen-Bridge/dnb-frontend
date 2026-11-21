const DEFAULT_API_ORIGIN = "https://api.example.com";
const DEFAULT_JITSI_ORIGIN = "https://meet.jit.si";

function origin(value, fallback) {
  try {
    return new URL(value || fallback).origin;
  } catch {
    return fallback;
  }
}

function source(value, fallback) {
  return origin(value, fallback);
}

export function buildContentSecurityPolicy({
  environment = process.env.NODE_ENV || "production",
  apiOrigin = process.env.NEXT_PUBLIC_API_URL,
  aiOrigin = process.env.NEXT_PUBLIC_AI_API_URL,
  jitsiOrigin = process.env.NEXT_PUBLIC_JITSI_DOMAIN,
  reportUri = "/api/csp-report",
} = {}) {
  const api = source(apiOrigin, DEFAULT_API_ORIGIN);
  const ai = source(aiOrigin, "http://localhost:8000");
  const jitsi = source(jitsiOrigin, DEFAULT_JITSI_ORIGIN);
  const jitsiHost = new URL(jitsi).host;
  const connectSources = [
    "'self'",
    api,
    ai,
    "https://api.cloudinary.com",
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://*.sentry.io",
    "https://horizon-testnet.stellar.org",
    "https://horizon.stellar.org",
    jitsi,
    `wss://${jitsiHost}`,
  ];

  if (environment === "development") {
    connectSources.push("ws://localhost:3000", "ws://localhost:3123");
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' https://accounts.google.com https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://cloudinary-marketing-res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com https://i.ibb.co https://cdn.pixabay.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${[...new Set(connectSources)].join(" ")}`,
    `frame-src 'self' https://accounts.google.com https://*.firebaseapp.com ${jitsi}`,
    `media-src 'self' blob: ${jitsi}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    `report-uri ${reportUri}`,
  ];

  if (environment === "production") {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function buildSecurityHeaders(options = {}) {
  const environment = options.environment || process.env.NODE_ENV || "production";
  const headers = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy({ ...options, environment }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=()" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ];

  if (environment === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  return headers;
}

export const REQUIRED_SECURITY_HEADERS = [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];
