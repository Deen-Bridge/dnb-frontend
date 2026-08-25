import { z } from "zod";

function warn(field, fallback) {
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
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_AI_API_URL: process.env.NEXT_PUBLIC_AI_API_URL,
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_DONATION_WALLET: process.env.NEXT_PUBLIC_DONATION_WALLET,
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
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_AI_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).optional(),
  NEXT_PUBLIC_DONATION_WALLET: z.string().optional(),
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

export const config = Object.freeze({
  get apiUrl() {
    return (
      env.NEXT_PUBLIC_API_URL ??
      (warn("NEXT_PUBLIC_API_URL", "http://localhost:5000"),
      "http://localhost:5000")
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

  get donationWallet() {
    const wallet = env.NEXT_PUBLIC_DONATION_WALLET?.trim();
    return wallet || null;
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
      apiKey:
        env.NEXT_PUBLIC_FIREBASE_API_KEY ??
        "AIzaSyC8LlmtlWXvbcbyVbdyv4r-tDsGhhukdag",
      authDomain:
        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        "deen-bridge-22195.firebaseapp.com",
      projectId:
        env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "deen-bridge-22195",
      storageBucket:
        env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
        "deen-bridge-22195.firebasestorage.app",
      messagingSenderId:
        env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "368531944242",
      appId:
        env.NEXT_PUBLIC_FIREBASE_APP_ID ??
        "1:368531944242:web:7994b11820741a69d35d2b",
      measurementId:
        env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-ZZ81THLVCC",
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
