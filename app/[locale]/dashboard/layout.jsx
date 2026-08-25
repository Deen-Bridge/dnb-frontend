"use client";
import NextTopLoader from "nextjs-toploader";
import ProtectedRoute from "@/hooks/protected-route";
import { SidebarLeft } from "@/components/organisms/dashboard/sidebar-left";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NavHeader from "@/components/molecules/dashboard/nav-header";
import PresenceProvider from "@/components/providers/PresenceProvider";
import { CommandPalette } from "@/components/organisms/dashboard/CommandPalette";
import PushNotificationPrompt from "@/components/pwa/PushNotificationPrompt";

export default function Layout({ children }) {
  return (
    <>
      <NextTopLoader
        color="#009900"
        initialPosition={0.09}
        crawlSpeed={100}
        height={3}
        crawl={false}
        showSpinner={false}
        easing="ease"
        speed={100}
        shadow="0 0 10px #009900,0 0 5px #009900"
      />
      <ProtectedRoute>
        <PresenceProvider>
        <SidebarProvider>
          <SidebarLeft />
          <SidebarInset>
            <NavHeader />
            <PushNotificationPrompt />
            {children}
          </SidebarInset>
          <CommandPalette />
        </SidebarProvider>
        </PresenceProvider>
      </ProtectedRoute>
    </>
  );
}
