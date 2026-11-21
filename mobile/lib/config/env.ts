export type MobileBuildProfile = "development" | "preview" | "production";

export interface MobileRuntimeConfig {
  profile: MobileBuildProfile;
  apiBaseUrl: string;
  aiApiBaseUrl: string;
  stellarNetwork: string;
  stellarIssuer: string;
  firebase: { apiKey: string; authDomain: string; projectId: string; storageBucket: string; messagingSenderId: string; appId: string };
  cloudinaryCloudName: string;
  jitsiDomain: string;
  jitsiRequireJwt: boolean;
}

const localhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i;
const placeholder = /^(?:your[_-]|change[_-]?me|example|placeholder|test)/i;

function profileOf(env: NodeJS.ProcessEnv): MobileBuildProfile {
  const value = env.EXPO_PUBLIC_BUILD_PROFILE ?? env.EAS_BUILD_PROFILE ?? "development";
  if (value === "development" || value === "preview" || value === "production") return value;
  throw new Error("EXPO_PUBLIC_BUILD_PROFILE must be development, preview, or production");
}

function required(name: string, value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || placeholder.test(trimmed)) throw new Error(`${name} is required for release builds`);
  return trimmed;
}

function releaseValue(name: string, value: string | undefined, release: boolean): string {
  return release ? required(name, value) : value?.trim() ?? "";
}

function releaseUrl(name: string, value: string | undefined, release: boolean): string {
  const url = releaseValue(name, value, release);
  if (release && (!/^https:\/\//i.test(url) || localhost.test(url))) throw new Error(`${name} must be a non-local HTTPS URL for release builds`);
  return url;
}

export function resolveMobileConfig(env: NodeJS.ProcessEnv = process.env): MobileRuntimeConfig {
  const profile = profileOf(env);
  const release = profile !== "development";
  const apiBaseUrl = releaseUrl("EXPO_PUBLIC_API_URL", env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000", release);
  const aiApiBaseUrl = releaseUrl("EXPO_PUBLIC_AI_API_URL", env.EXPO_PUBLIC_AI_API_URL ?? "http://localhost:8000", release);
  const stellarNetwork = (env.EXPO_PUBLIC_STELLAR_NETWORK ?? "testnet").trim().toLowerCase();
  if (release && stellarNetwork !== "mainnet") throw new Error("EXPO_PUBLIC_STELLAR_NETWORK must be mainnet for release builds");
  const jitsiDomain = releaseValue("EXPO_PUBLIC_JITSI_DOMAIN", env.EXPO_PUBLIC_JITSI_DOMAIN ?? "https://meet.jit.si", release);
  if (release && (localhost.test(jitsiDomain) || /meet\.jit\.si/i.test(jitsiDomain))) throw new Error("EXPO_PUBLIC_JITSI_DOMAIN must be private for release builds");
  const jitsiRequireJwt = (env.EXPO_PUBLIC_JITSI_REQUIRE_JWT ?? "false").toLowerCase() === "true";
  if (release && !jitsiRequireJwt) throw new Error("EXPO_PUBLIC_JITSI_REQUIRE_JWT must be true for release builds");
  return {
    profile, apiBaseUrl, aiApiBaseUrl, stellarNetwork,
    stellarIssuer: releaseValue("EXPO_PUBLIC_USDC_ISSUER", env.EXPO_PUBLIC_USDC_ISSUER, release),
    firebase: {
      apiKey: releaseValue("EXPO_PUBLIC_FIREBASE_API_KEY", env.EXPO_PUBLIC_FIREBASE_API_KEY, release),
      authDomain: releaseValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, release),
      projectId: releaseValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID", env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, release),
      storageBucket: releaseValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET, release),
      messagingSenderId: releaseValue("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, release),
      appId: releaseValue("EXPO_PUBLIC_FIREBASE_APP_ID", env.EXPO_PUBLIC_FIREBASE_APP_ID, release),
    },
    cloudinaryCloudName: env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "", jitsiDomain, jitsiRequireJwt,
  };
}

export const mobileConfig = resolveMobileConfig();
export const API_BASE_URL = mobileConfig.apiBaseUrl;
export const AI_API_BASE_URL = mobileConfig.aiApiBaseUrl;
export const STELLAR_NETWORK = mobileConfig.stellarNetwork;
export const STELLAR_ISSUER = mobileConfig.stellarIssuer;
export const FIREBASE_CONFIG = mobileConfig.firebase;
export const CLOUDINARY_CLOUD_NAME = mobileConfig.cloudinaryCloudName;
export const JITSI_DOMAIN = mobileConfig.jitsiDomain;
export const JITSI_REQUIRE_JWT = mobileConfig.jitsiRequireJwt;
