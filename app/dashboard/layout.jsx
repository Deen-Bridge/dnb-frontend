"use client";
import NextTopLoader from "nextjs-toploader";
import ProtectedRoute from "@/hooks/protected-route";
import { SidebarLeft } from "@/components/organisms/dashboard/sidebar-left"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import NavHeader from "@/components/molecules/dashboard/nav-header";


export default function Layout({ children }) {
    return (
        <>
            <NextTopLoader
                color="#34AD5D"
                initialPosition={0.09}
                crawlSpeed={100}
                height={3}
                crawl={false}
                showSpinner={false}
                easing="ease"
                speed={100}
                shadow="0 0 10px #34AD5D,0 0 5px #34AD5D"
            />
            <ProtectedRoute>
                <SidebarProvider>
                    <SidebarLeft />
                    <SidebarInset>
                        <NavHeader/>
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </ProtectedRoute>
        </>
    );
}