"use client";

import React from 'react';
import Button from '@/components/atoms/form/Button';
import {
  AudioWaveform,
  LayoutDashboard,
  Inbox,
  Book,
  Play,
  LaptopMinimal,
  HeartHandshake
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useSidebar } from '@/components/ui/sidebar';
import { useTranslations } from "next-intl";
const links = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Courses",
    link: "/dashboard/courses",
    icon: LaptopMinimal,
  },
  {
    name: "Library",
    link: "/dashboard/library",
    icon: Book,
  },
  {
    name: "Spaces",
    link: "/dashboard/spaces",
    icon: AudioWaveform,
  },
  {
    name: "Reels",
    link: "/dashboard/reels",
    icon: Play,
  },

  {
    name: "Messages",
    link: "/dashboard/messages",
    icon: Inbox,
  },

  {
    name: "Sadaqah",
    link: "/dashboard/sadaqah",
    icon: HeartHandshake,
  },

];

const Navrouter = () => {
  const t = useTranslations("dashboard.sidebar");
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar(); // ⬅️ use the context

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false); // ⬅️ close sidebar if mobile
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-3 pt-10">
          {links.map((item) => {
            const isActive =
              item.link === "/dashboard"
                ? pathname === item.link
                : pathname.startsWith(item.link);

            return (
              <SidebarMenuItem key={item.name}>
                <Button
                  wide
                  outlined
                  round
                  to={item.link}
                  onClick={handleNavClick} // ⬅️ close sidebar on click
                  className={`flex justify-start items-center ps-16 ${isActive ? "bg-accent text-white" : ""
                    }`}
                >
                  <item.icon size={15} className="me-4" />
                  <span>{t(item.name.toLowerCase())}</span>
                </Button>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default Navrouter;
