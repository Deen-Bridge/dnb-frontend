"use client";

import ThemeProvider from "@/components/providers/ThemeProvider";
import AppearanceProvider from "@/components/providers/AppearanceProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import CacheProvider from "@/components/providers/CacheProvider";
import StellarProvider from "@/components/stellar/StellarProvider";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AppearanceProvider>
        <CacheProvider>
          <AuthProvider>
            <StellarProvider>{children}</StellarProvider>
          </AuthProvider>
        </CacheProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
