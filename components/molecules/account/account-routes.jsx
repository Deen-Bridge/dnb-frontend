"use client";

import React from 'react';
import Button from '@/components/atoms/form/Button';
import {
    LayoutDashboard,
    Settings2Icon,
    User2Icon,
    MessageCircleQuestion,
    BellDotIcon,
    ShieldCheck,
    HelpCircle
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
                                <Button
                                    wide
                                    outlined
                                    round
                                    to={item.link}
                                    onClick={handleNavClick}
                                    className={`flex justify-start items-center pl-16 ${isActive ? "bg-accent text-white" : ""}`}
                                >
                                    <item.icon size={15} className="mr-4" />
                                    <span>{item.name}</span>
                                </Button>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default AccountRouter;