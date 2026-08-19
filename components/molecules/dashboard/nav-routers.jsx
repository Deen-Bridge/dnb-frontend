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
  HeartHandshake,
  ShoppingBag,
  DollarSign,
  Bookmark,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSidebar } from '@/components/ui/sidebar';
// `key` maps to the `dashboard.sidebar.routes` message catalog.
const links = [
  {
    key: "dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "courses",
    link: "/dashboard/courses",
    icon: LaptopMinimal,
  },
  {
    key: "library",
    link: "/dashboard/library",
    icon: Book,
  },
  {
    key: "saved",
    link: "/dashboard/saved",
    icon: Bookmark,
  },
  {
    key: "spaces",
    link: "/dashboard/spaces",
    icon: AudioWaveform,
  },
  {
    key: "reels",
    link: "/dashboard/reels",
    icon: Play,
  },

  {
    key: "messages",
    link: "/dashboard/messages",
    icon: Inbox,
  },

  {
    key: "sadaqah",
    link: "/dashboard/sadaqah",
    icon: HeartHandshake,
  },
  {
    key: "purchases",
    link: "/dashboard/purchases",
    icon: ShoppingBag,
  },
  {
    key: "earnings",
    link: "/dashboard/earnings",
    icon: DollarSign,
  },

];

const Navrouter = () => {
  const t = useTranslations("dashboard.sidebar.routes");
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
              <SidebarMenuItem key={item.key}>
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
                  <span>{t(item.key)}</span>
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
