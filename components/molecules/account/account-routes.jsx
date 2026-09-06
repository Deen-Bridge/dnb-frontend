"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { normalizeRole, ROLES } from '@/lib/auth/roles';
import { poppins_500 } from '@/lib/config/font.config';
import {
    LayoutDashboard,
    Settings2Icon,
    User2Icon,
    MessageCircleQuestion,
    BellDotIcon,
    ShieldCheck,
    HelpCircle,
    BadgeCheck,
} from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from "@/hooks/useAuth";

const AccountRouter = () => {
    const pathname = usePathname();
    const { isMobile, setOpenMobile } = useSidebar();
    const currentUser = useAuth()?.user || null; // ✅ Now inside the component

    const links = [
        {
            name: "Dashboard",
            link: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Settings",
            link: "/account/settings",
            icon: Settings2Icon,
        },
        {
            name: "Profile",
            link: `/account/profile/${currentUser?._id}`,
            icon: User2Icon
        },
        {
            name: "Security",
            link: "/account/security",
            icon: ShieldCheck
        },
        {
            name: "Notifications",
            link: "/account/notifications",
            icon: BellDotIcon
        },
        // Only shown for educators — the page itself handles non-educator states gracefully
        ...(normalizeRole(currentUser?.role) === ROLES.EDUCATOR
            ? [{
                name: "Verification",
                link: "/account/verification",
                icon: BadgeCheck,
            }]
            : []),
        {
            name: "Support",
            link: "/account/support",
            icon: HelpCircle,
        },
    ];

    const handleNavClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu className="space-y-3 pt-4">
                    {links.map((item) => {
                        const isActive =
                            item.link === "/account"
                                ? pathname === item.link
                                : pathname.startsWith(item.link);

                        return (
                            <SidebarMenuItem key={item.name}>
                                <Link
                                    href={item.link}
                                    onClick={handleNavClick}
                                    className={cn(
                                        poppins_500,
                                        "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                                        isActive
                                            ? "bg-accent text-white shadow-sm"
                                            : "text-ink hover:bg-secondary/10 hover:text-accent"
                                    )}
                                >
                                    <item.icon size={18} className="shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default AccountRouter;