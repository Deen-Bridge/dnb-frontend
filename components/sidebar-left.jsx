"use client"

import * as React from "react"
import {
    AudioWaveform,
    Blocks,
    Calendar,
    Command,
    Home,
    Inbox,
    MessageCircleQuestion,
    Search,
    Settings2,
    Sparkles,
    Trash2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import DnbLogo from "./molecules/dashboard/dnb-logo"
// This is sample data.
const data = {
  
    navMain: [
        {
            title: "Search",
            url: "#",
            icon: Search,
        },
        {
            title: "Ask AI",
            url: "#",
            icon: Sparkles,
        },
        {
            title: "Home",
            url: "#",
            icon: Home,
            isActive: true,
        },
        {
            title: "Inbox",
            url: "#",
            icon: Inbox,
            badge: "10",
        },
    ],
    navSecondary: [
        {
            title: "Calendar",
            url: "#",
            icon: Calendar,
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
        },
        {
            title: "Templates",
            url: "#",
            icon: Blocks,
        },
        {
            title: "Trash",
            url: "#",
            icon: Trash2,
        },
        {
            title: "Help",
            url: "#",
            icon: MessageCircleQuestion,
        },
    ]
}

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
          
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
