"use client";
import * as React from "react";
import { LogOut } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth"; // Corrected import
export function SidebarRight({ ...props }) {
    const { user, logout } = useAuth(); // Destructure logout function

    return (
        <Sidebar
            collapsible="none"
            className="sticky hidden lg:flex top-0 h-svh border-l"
            {...props}
        >
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser user={user} /> {/* Ensure NavUser handles null/undefined user */}
            </SidebarHeader>
            <SidebarContent>
                {/* Add any additional content here */}
                <SidebarSeparator className="mx-0" />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout}> 

                            <LogOut />
                            <span>Log Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}