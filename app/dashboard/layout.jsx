"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarLeft } from "@/components/organisms/dashboard/sidebar-left";
import NavHeader from "@/components/molecules/dashboard/nav-header";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <NavHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
