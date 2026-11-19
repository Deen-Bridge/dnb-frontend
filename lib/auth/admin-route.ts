import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeRole, ROLES } from "@/lib/auth/roles";

const ADMIN_PATH = "/admin";

function isExpiredJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    const claims = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    return typeof claims.exp === "number" && claims.exp <= Date.now() / 1000;
  } catch {
    // Opaque tokens are validated by the backend. Only reject malformed JWT
    // payloads when they explicitly look like JWTs; do not reject opaque ones.
    return false;
  }
}

function localePath(locale: string, path: string): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

export type AdminRouteDecision = "allow" | "login" | "forbidden";

/**
 * Decide access from the same session cookies used by AuthProvider.
 *
 * This is a render boundary, not a replacement for backend authorization:
 * admin API endpoints must still validate the bearer session. Keeping this
 * check server-side prevents protected route content from being rendered or
 * prefetched before the client guard has mounted.
 */
export function getAdminRouteDecision(
  authToken: string | undefined,
  userInfo: string | undefined,
): AdminRouteDecision {
  if (!authToken || isExpiredJwt(authToken)) return "login";

  if (!userInfo) return "login";

  try {
    const user = JSON.parse(userInfo);
    return normalizeRole(user?.role) === ROLES.ADMIN ? "allow" : "forbidden";
  } catch {
    // A broken session cannot establish authorization. Fail closed and ask the
    // user to sign in again so the client can replace both session cookies.
    return "login";
  }
}

export function adminRedirectUrl(locale: string, decision: Exclude<AdminRouteDecision, "allow">): string {
  if (decision === "forbidden") {
    return localePath(locale, "/dashboard/unauthorized");
  }

  const returnTo = encodeURIComponent(localePath(locale, ADMIN_PATH));
  return `${localePath(locale, "/login")}?returnTo=${returnTo}`;
}

/** Enforce the localized admin layout before its children are rendered. */
export async function requireAdminRoute(locale: string): Promise<void> {
  const cookieStore = await cookies();
  const decision = getAdminRouteDecision(
    cookieStore.get("authToken")?.value,
    cookieStore.get("userInfo")?.value,
  );

  if (decision !== "allow") {
    redirect(adminRedirectUrl(locale, decision));
  }
}
