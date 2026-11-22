import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { scrubDiagnosticValue, scrubRoute } from "./privacy";

const CONSENT_KEY = "mobile_diagnostics_consent";
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

function releaseContext() {
  const version = Constants.expoConfig?.version ?? "unknown";
  const build = Platform.OS === "ios" ? Constants.expoConfig?.ios?.buildNumber : Constants.expoConfig?.android?.versionCode;
  return { appVersion: version, build: String(build ?? "unknown"), platform: Platform.OS, runtime: Constants.expoConfig?.runtimeVersion ?? version };
}

export async function setDiagnosticsConsent(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(CONSENT_KEY, enabled ? "granted" : "denied");
  Sentry.setEnabled(enabled && Boolean(DSN));
  if (!enabled) await Sentry.close(1000);
}

export async function initializeMobileDiagnostics(): Promise<void> {
  if (!DSN || (await SecureStore.getItemAsync(CONSENT_KEY)) !== "granted") return;
  const context = releaseContext();
  Sentry.init({
    dsn: DSN, enabled: true, sendDefaultPii: false, enableNative: true, enableNativeCrashHandling: true,
    maxBreadcrumbs: 20, maxCacheItems: 20, release: `deenbridge@${context.appVersion}+${context.build}`, dist: context.build,
    environment: process.env.EXPO_PUBLIC_ENVIRONMENT ?? "production",
    beforeSend(event) {
      event.user = undefined;
      event.request = undefined;
      event.breadcrumbs = undefined;
      event.extra = scrubDiagnosticValue(event.extra) as Record<string, unknown>;
      event.tags = { ...event.tags, ...context };
      if (event.message) event.message = String(scrubDiagnosticValue(event.message));
      return event;
    },
  });
  Sentry.setTag("route", "unknown");
}

export function setDiagnosticRoute(route: string | undefined): void { Sentry.setTag("route", scrubRoute(route)); }

export function captureMobileException(error: unknown, route?: string): void {
  Sentry.withScope((scope) => { scope.setTag("route", scrubRoute(route)); scope.setContext("release", releaseContext()); Sentry.captureException(error); });
}

export { scrubDiagnosticValue, scrubRoute } from "./privacy";
