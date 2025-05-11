import React from 'react';
import Button from '@/components/atoms/form/Button';
import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const links = [{
  name: "Classes",
  link: "/dashboard/classes"
}, {
  name: "LIbrary",
  link: "/dashboard/library"
},
{
  name: "Fiqh",
  link: "/dashboard/fiqh"
}]

const Navrouter = () => {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {links.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Button>
                  <a href={item.link}>
                    {/* <item.icon /> */}
                    <span>{item.title}</span>
                  </a>
                </Button>
                {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default Navrouter;

