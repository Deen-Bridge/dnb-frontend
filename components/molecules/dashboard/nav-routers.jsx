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
} from "@/components/ui/sidebar"

const links = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard
  }, {
    name: "Courses",
    link: "/dashboard/courses",
    icon: AudioWaveform
  }, {
    name: "LIbrary",
    link: "/dashboard/library",
    icon: Book
  },
  {
    name: "Fiqh",
    link: "/dashboard/fiqh",
    icon: AudioWaveform
  }, {
    name: "Messages",
    link: "/dashboard/messages",
    icon: Inbox,
  }, {
    name: "Spaces",
    link: "/dashboard/spaces",
    icon: AudioWaveform
  }, , {
    name: "Support",
    link: "/dashboard/support",
    icon: MessageCircleQuestion
  }]

const Navrouter = () => {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-3 pt-10">
            {links.map((item, key) => (
              <SidebarMenuItem key={item.name}>
                <Button wide outlined round to={item.link} className="flex justify-start items-center pl-16">
                  <item.icon size={15} className='' />
                  <span className='pl-4'>{item.name}</span>
                </Button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default Navrouter;



