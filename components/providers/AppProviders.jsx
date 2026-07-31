"use client";

import AuthProvider from "@/components/providers/AuthProvider";
import CacheProvider from "@/components/providers/CacheProvider";
import StellarProvider from "@/components/stellar/StellarProvider";

export default function AppProviders({ children }) {
  return (
    <CacheProvider>
      <AuthProvider>
        <StellarProvider>{children}</StellarProvider>
      </AuthProvider>
    </CacheProvider>
  );
}
