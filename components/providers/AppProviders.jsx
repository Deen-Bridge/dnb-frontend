"use client";

import ThemeProvider from "@/components/providers/ThemeProvider";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import CacheProvider from "@/components/providers/CacheProvider";
import FeatureFlagProvider from "@/components/providers/FeatureFlagProvider";
import StellarProvider from "@/components/stellar/StellarProvider";
import AdminIdleGuard from "@/components/auth/AdminIdleGuard";
import MaintenanceGate from "@/components/maintenance/MaintenanceGate";
import EmergencyBroadcastBanner from "@/components/broadcast/EmergencyBroadcastBanner";
import AdminShortcutsProvider from "@/components/admin/AdminShortcutsProvider";

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
                {/*
                 * Mounted inside AuthProvider so the gate sees the decoded
                 * client-side user; it wraps the whole app so maintenance mode
                 * applies platform-wide on every render/navigation (#303).
                 */}
                {/*
                 * Learner-side red alert banner for the emergency-broadcast
                 * quick-action (#307). Renders nothing when no incident is
                 * active; shown app-wide to every visitor when one is. Mounted
                 * alongside the maintenance gate so both surfaces read their
                 * public state and stay in sync within a session.
                 */}
                <EmergencyBroadcastBanner />
                <MaintenanceGate>{children}</MaintenanceGate>
                {/* Idle-timeout auto-logout for admin sessions (#337).
                    Self-noops for non-admins and non-admin routes. */}
                <AdminIdleGuard />
                {/* Power-admin keyboard shortcut layer (#336). Chord shortcuts
                    (g→key) + `?` cheatsheet; self-noops off admin routes and
                    for non-admins, and defers ⌘K to the CommandPalette. */}
                <AdminShortcutsProvider />
                {children}
              </StellarProvider>
            </FeatureFlagProvider>
          </AuthProvider>
        </CacheProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
