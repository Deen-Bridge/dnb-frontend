"use client"

import { useTranslations } from "next-intl"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
    items,
}) {
    const t = useTranslations("dashboard.sidebar.main")
    return (
        <SidebarMenu>
            {items.map((item) => {
                // `key` maps to the message catalog; `title` stays as an English
                // fallback for any item that hasn't been keyed yet.
                const label = item.key ? t(item.key) : item.title
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                            <a href={item.url}>
                                <item.icon />
                                <span>{label}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            })}
        </SidebarMenu>
    )
}
