"use client";
import * as React from "react";
import { LucideLogOut } from "lucide-react";
import { NavUser } from "@/components/molecules/dashboard/nav-user";

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
import { NavSecondary } from "../../molecules/dashboard/nav-secondary";
import { useAuth } from "@/hooks/useAuth";

import { data } from "@/lib/data";
import { links } from "@/lib/data";

export function SidebarRight({ ...props }) {
    const { logout, user } = useAuth();

    return (
        <Sidebar
            collapsible="none"
            className="sticky hidden lg:flex top-0 h-svh border-l"
            {...props}
        >
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <NavUser user={user} />
            </SidebarHeader>
            <SidebarContent>
                <SidebarSeparator className="mx-0" />
            </SidebarContent>
            <SidebarFooter>
                <NavSecondary links={links} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}