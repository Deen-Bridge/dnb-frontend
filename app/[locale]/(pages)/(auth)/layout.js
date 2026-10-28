import { GoogleOAuthProvider } from "@react-oauth/google";
import { config } from "@/lib/config/env";

/**
 * Scoped to login/signup only — Google Identity Services' script is loaded
 * by this provider, so there's no reason to pull it in site-wide. When
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset, children render unwrapped and the
 * "Continue with Google" button hides itself (see useGoogleAuth.ts).
 */
export default function AuthLayout({ children }) {
  const clientId = config.googleClientId;

  if (!clientId) {
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
