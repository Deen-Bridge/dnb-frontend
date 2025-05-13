"use client";

import React from 'react';
import Button from '@/components/atoms/form/Button';
import {
  AudioWaveform,
  LayoutDashboard,
  Inbox,
  MessageCircleQuestion,
  Book,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Courses",
    link: "/dashboard/courses",
    icon: AudioWaveform,
  },
  {
    name: "Library",
    link: "/dashboard/library",
    icon: Book,
  },
  {
    name: "Fiqh",
    link: "/dashboard/fiqh",
    icon: AudioWaveform,
  },
  {
    name: "Messages",
    link: "/dashboard/messages",
    icon: Inbox,
  },
  {
    name: "Spaces",
    link: "/dashboard/spaces",
    icon: AudioWaveform,
  },
  {
    name: "Support",
    link: "/dashboard/support",
    icon: MessageCircleQuestion,
  },
];

const Navrouter = () => {
  const pathname = usePathname();

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
                  className={`flex justify-start items-center pl-16 ${isActive ? "bg-accent text-white" : ""
                    }`}
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

export default Navrouter;
