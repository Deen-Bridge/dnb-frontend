"use client"

import * as React from "react"
import { NavMain } from "@/components/molecules/dashboard/nav-main"
import { NavSecondary } from "@/components/molecules/dashboard/nav-secondary"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import DnbLogo from "../../molecules/dashboard/dnb-logo"
// This is sample data.
import { data } from "@/lib/data";

export function SidebarLeft({
    ...props
}) {
    return (
        <Sidebar className="border-r-0" {...props}>
            <SidebarHeader>
                <DnbLogo />
                <NavMain items={data.navMain} />
            </SidebarHeader>
            <SidebarContent>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
