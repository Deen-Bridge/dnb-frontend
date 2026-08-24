"use client";

import ThemeProvider from "@/components/providers/ThemeProvider";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import CacheProvider from "@/components/providers/CacheProvider";
import FeatureFlagProvider from "@/components/providers/FeatureFlagProvider";
import StellarProvider from "@/components/stellar/StellarProvider";
import MaintenanceGate from "@/components/maintenance/MaintenanceGate";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AppearanceProvider>
        <CacheProvider>
          <AuthProvider>
            <FeatureFlagProvider>
              <StellarProvider>
                {/*
                 * Mounted inside AuthProvider so the gate sees the decoded
                 * client-side user; it wraps the whole app so maintenance mode
                 * applies platform-wide on every render/navigation (#303).
                 */}
                <MaintenanceGate>{children}</MaintenanceGate>
              </StellarProvider>
            </FeatureFlagProvider>
          </AuthProvider>
        </CacheProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
