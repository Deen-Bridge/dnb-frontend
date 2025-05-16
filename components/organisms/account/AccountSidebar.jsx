"use client"

import * as React from "react"
import Navrouter from "@/components/molecules/dashboard/nav-routers"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar"
import AccountMain from "@/components/molecules/account/account-main"
import DnbLogo from "../../molecules/dashboard/dnb-logo"
import { useAuth } from "@/hooks/useAuth";
import { NavUser } from "@/components/molecules/dashboard/nav-user"
import AccountRouter from "@/components/molecules/account/account-routes"
export default  function SidebarLeft({
    ...props
}) {
    const { user } = useAuth();
    return (
        <Sidebar className="border-r-0" {...props}>
            <SidebarHeader>
                <DnbLogo />
                <AccountMain />
            </SidebarHeader>
            {/* account pages route */}
            <SidebarContent>
                <AccountRouter/>
            </SidebarContent>
            {/* // user info components */}
            <SidebarFooter>
                <NavUser user={user} />            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
