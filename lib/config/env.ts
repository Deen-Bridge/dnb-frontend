import { z } from "zod";

function warn(field: string, fallback: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `\u26a0\ufe0f  ${field} is not set. Using "${fallback}" as fallback.`
    );
  }
}

const dangerous = Object.keys(process.env).filter(
  (k) => /^NEXT_PUBLIC_.*SECRET/.test(k) && k !== "NEXT_PUBLIC_CLOUDINARY_API_SECRET"
);

if (dangerous.length > 0) {
  throw new Error(
    `\u274c Dangerous environment variable(s) detected: ${dangerous.join(", ")}.\n` +
      `Variables prefixed with NEXT_PUBLIC_ are exposed to the browser bundle and must never contain secrets.\n` +
      `Rename the variable(s) to remove the NEXT_PUBLIC_ prefix.`
  );
}

const raw = {
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_AI_API_URL: process.env.NEXT_PUBLIC_AI_API_URL,
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_DONATION_WALLET: process.env.NEXT_PUBLIC_DONATION_WALLET,
  // "Continue with Google" OAuth client ID. Public by design (Google Identity
  // Services expects it client-side); must match the backend's GOOGLE_CLIENT_ID.
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  // Public VAPID key used to subscribe the browser to Web Push (issue #197).
  // Only the *public* half lives client-side; the private key stays on the
  // backend, so exposing this via NEXT_PUBLIC_ is safe.
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_JITSI_DOMAIN: process.env.NEXT_PUBLIC_JITSI_DOMAIN,
  NEXT_PUBLIC_JITSI_REQUIRE_JWT: process.env.NEXT_PUBLIC_JITSI_REQUIRE_JWT,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_USDC_ISSUER: process.env.NEXT_PUBLIC_USDC_ISSUER,
  // ─── Liveness / Face-Verification ──────────────────────────────────────────
  // Identifies which provider adapter to load: "mock" | "persona" | "onfido"
  // No secrets here — API keys/tokens live server-side only.
  NEXT_PUBLIC_LIVENESS_PROVIDER: process.env.NEXT_PUBLIC_LIVENESS_PROVIDER,
  // Consent policy version shown in the disclosure screen.
  // Bump this string whenever the consent text changes so existing records
  // can be distinguished from new ones.
  NEXT_PUBLIC_LIVENESS_CONSENT_VERSION:
    process.env.NEXT_PUBLIC_LIVENESS_CONSENT_VERSION,
  // Maximum seconds a single capture attempt may run before timing out.
  NEXT_PUBLIC_LIVENESS_TIMEOUT_SECONDS:
    process.env.NEXT_PUBLIC_LIVENESS_TIMEOUT_SECONDS,
};

const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_AI_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).optional(),
  NEXT_PUBLIC_DONATION_WALLET: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_JITSI_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_JITSI_REQUIRE_JWT: z.enum(["true", "false"]).optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_USDC_ISSUER: z.string().optional(),
  // Liveness
  NEXT_PUBLIC_LIVENESS_PROVIDER: z
    .enum(["mock", "persona", "onfido"])
    .optional(),
  NEXT_PUBLIC_LIVENESS_CONSENT_VERSION: z.string().optional(),
  NEXT_PUBLIC_LIVENESS_TIMEOUT_SECONDS: z
    .string()
    .regex(/^\d+$/, "Must be a positive integer string")
    .optional(),
});

const parsed = envSchema.safeParse(raw);

if (!parsed.success) {
  const issues = parsed.error.errors.map((e) => {
    const path = e.path.join(".");
    return `  - ${path}: ${e.message}`;
  });
  throw new Error(
    `\u274c Environment configuration is invalid:\n${issues.join("\n")}\n\nPlease check your .env.local file.`
  );
}

const env = parsed.data;

const runtimeProfile =
  env.NEXT_PUBLIC_APP_ENV ??
  (process.env.NODE_ENV === "production" ? "production" : "development");
const strictProfile = runtimeProfile !== "development" || process.env.NODE_ENV === "production";

function isUnsafeEndpoint(value: string | undefined): boolean {
  if (!value) return true;

  try {
    const url = new URL(value);
    return (
      url.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(url.hostname) ||
      url.hostname.endsWith(".local")
    );
  } catch {
    return true;
  }
}

function missing(...values: Array<string | undefined>): boolean {
  return values.some((value) => !value?.trim());
}

function strictConfigurationIssues(): string[] {
  const issues: string[] = [];

  if (isUnsafeEndpoint(env.NEXT_PUBLIC_API_URL)) {
    issues.push("NEXT_PUBLIC_API_URL must be a configured HTTPS endpoint");
  }
  if (isUnsafeEndpoint(env.NEXT_PUBLIC_AI_API_URL)) {
    issues.push("NEXT_PUBLIC_AI_API_URL must be a configured HTTPS endpoint");
  }
  if (env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet") {
    issues.push("NEXT_PUBLIC_STELLAR_NETWORK must be mainnet");
  }
  if (missing(env.NEXT_PUBLIC_DONATION_WALLET, env.NEXT_PUBLIC_USDC_ISSUER)) {
    issues.push("NEXT_PUBLIC_DONATION_WALLET and NEXT_PUBLIC_USDC_ISSUER are required");
  }
  if (missing(env.NEXT_PUBLIC_JITSI_DOMAIN)) {
    issues.push("NEXT_PUBLIC_JITSI_DOMAIN is required");
  }
  if (env.NEXT_PUBLIC_JITSI_REQUIRE_JWT !== "true") {
    issues.push("NEXT_PUBLIC_JITSI_REQUIRE_JWT must be true");
  }
  if (missing(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)) {
    issues.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required");
  }
  if (env.NEXT_PUBLIC_LIVENESS_PROVIDER === "mock" || missing(env.NEXT_PUBLIC_LIVENESS_PROVIDER)) {
    issues.push("NEXT_PUBLIC_LIVENESS_PROVIDER must select a configured production provider");
  }
  if (
    missing(
      env.NEXT_PUBLIC_FIREBASE_API_KEY,
      env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      env.NEXT_PUBLIC_FIREBASE_APP_ID,
      env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    )
  ) {
    issues.push("Firebase configuration and NEXT_PUBLIC_GOOGLE_CLIENT_ID are required");
  }

  return issues;
}

const configurationIssues = strictProfile ? strictConfigurationIssues() : [];
if (configurationIssues.length > 0) {
  throw new Error(
    `❌ ${runtimeProfile} runtime configuration is unsafe or incomplete:\n` +
      configurationIssues.map((issue) => `  - ${issue}`).join("\n") +
      "\n\nSet the required deployment variables before building or starting this profile."
  );
}

export const config = Object.freeze({
  get runtimeProfile() {
    return runtimeProfile;
  },

  get diagnostics() {
    return {
      profile: runtimeProfile,
      strict: strictProfile,
      configured: {
        api: Boolean(env.NEXT_PUBLIC_API_URL),
        ai: Boolean(env.NEXT_PUBLIC_AI_API_URL),
        stellar: Boolean(env.NEXT_PUBLIC_STELLAR_NETWORK && env.NEXT_PUBLIC_USDC_ISSUER),
        video: Boolean(env.NEXT_PUBLIC_JITSI_DOMAIN && env.NEXT_PUBLIC_JITSI_REQUIRE_JWT === "true"),
        identity: Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      },
    };
  },

  get apiUrl() {
    return (
      env.NEXT_PUBLIC_API_URL ??
      (warn("NEXT_PUBLIC_API_URL", "http://localhost:5001"),
      "http://localhost:5001")
    );
  },

  get aiApiUrl() {
    return (
      env.NEXT_PUBLIC_AI_API_URL ??
      (warn("NEXT_PUBLIC_AI_API_URL", "http://localhost:8000"),
      "http://localhost:8000")
    );
  },

  get stellarNetwork() {
    return env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet";
  },

  get usdcIssuer() {
    return env.NEXT_PUBLIC_USDC_ISSUER?.trim() || null;
  },

  get donationWallet() {
    const wallet = env.NEXT_PUBLIC_DONATION_WALLET?.trim();
    return wallet || null;
  },

  get vapidPublicKey() {
    const key = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    return key || null;
  },

  // null when unset so callers can hide/disable the Google button instead of
  // rendering it broken — mirrors donationWallet/vapidPublicKey above.
  get googleClientId() {
    const id = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    return id || null;
  },

  get cloudinaryCloudName() {
    if (!env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      warn("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "(none)");
    }
    return env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  },

  get jitsiDomain() {
    return env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si";
  },

  get jitsiRequireJwt() {
    return env.NEXT_PUBLIC_JITSI_REQUIRE_JWT === "true";
  },

  get firebase() {
    return {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
  },

  // ─── Liveness / Face-Verification ──────────────────────────────────────────

  /**
   * Which provider adapter to load.
   * "mock"    — deterministic fake, safe for local dev and tests
   * "persona" — Persona Verification (requires server-side API key)
   * "onfido"  — Onfido (requires server-side API key)
   * Defaults to "mock" so the dev environment works out of the box.
   */
  get livenessProvider() {
    return env.NEXT_PUBLIC_LIVENESS_PROVIDER ?? "mock";
  },

  /**
   * Consent policy version string.  Bump when the disclosure text changes.
   * Stored alongside every consent record so auditors can tell which policy
   * the user agreed to.
   */
  get livenessConsentVersion() {
    return env.NEXT_PUBLIC_LIVENESS_CONSENT_VERSION ?? "1.0.0";
  },

  /**
   * Seconds before a capture attempt is considered timed-out.
   * The adapter is expected to resolve/reject within this window.
   */
  get livenessTimeoutSeconds() {
    const raw = env.NEXT_PUBLIC_LIVENESS_TIMEOUT_SECONDS;
    const parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
  },
});
