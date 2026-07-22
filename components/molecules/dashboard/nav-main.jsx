"use client"

import { LucideIcon } from "lucide-react"

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"

export function NavMain({
    items,
}) {
    const t = useTranslations("dashboard.sidebar")
    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                        <a href={item.url}>
                            <item.icon />
                            <span>{t(item.title === "Ask AI" ? "askAi" : item.title.toLowerCase())}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}
