"use client"

import * as React from "react"
import { NavMain } from "@/components/molecules/dashboard/nav-main"
import Navrouter from "@/components/molecules/dashboard/nav-routers"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar"
import DnbLogo from "../../molecules/dashboard/dnb-logo"
import { data } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { NavUser } from "@/components/molecules/dashboard/nav-user"

export function SidebarLeft({
    ...props
}) {
    const { user } = useAuth();
    return (
        <Sidebar className="border-r-0" {...props}>
            <SidebarHeader>
                <DnbLogo />
                <NavMain items={data.navMain} />
            </SidebarHeader>
            {/* dashboard pages route */}
            <SidebarContent>
                <Navrouter />
            </SidebarContent>
            {/* // user info components */}
            <SidebarFooter>
                <NavUser user={user} />            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
