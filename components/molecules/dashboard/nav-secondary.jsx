import React from "react"
import { LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

    
export function NavSecondary({
    links,
    ...props
}) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {links.map((link) => (
                        <SidebarMenuItem key={link.title}>
                            <SidebarMenuButton asChild>
                                <a href={link.url}>
                                    <link.icon />
                                    <span>{link.title}</span>
                                </a>
                            </SidebarMenuButton>
                            {link.badge && <SidebarMenuBadge>{link.badge}</SidebarMenuBadge>}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
