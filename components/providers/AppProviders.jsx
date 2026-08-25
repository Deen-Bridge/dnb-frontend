"use client";

import ThemeProvider from "@/components/providers/ThemeProvider";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import CacheProvider from "@/components/providers/CacheProvider";
import FeatureFlagProvider from "@/components/providers/FeatureFlagProvider";
import StellarProvider from "@/components/stellar/StellarProvider";
import AdminIdleGuard from "@/components/auth/AdminIdleGuard";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AppearanceProvider>
        <CacheProvider>
          <AuthProvider>
            <FeatureFlagProvider>
              <StellarProvider>
                {/* Idle-timeout auto-logout for admin sessions (#337).
                    Self-noops for non-admins and non-admin routes. */}
                <AdminIdleGuard />
                {children}
              </StellarProvider>
            </FeatureFlagProvider>
          </AuthProvider>
        </CacheProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
