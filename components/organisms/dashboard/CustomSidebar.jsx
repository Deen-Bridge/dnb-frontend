"use client"
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import BookStatsInfo from "@/components/molecules/dashboard/BookStats&Info"
export function CustomSidebar({ book, navMain, ...props }) {
  return (
    <SidebarProvider  style={{
    "--sidebar-width": "20rem",
    "--sidebar-width-mobile": "20rem",
  }}>
    <Sidebar {...props}>
      <SidebarContent className="bg-transparent  w-full mx-6">
     <BookStatsInfo book={book} />
      </SidebarContent>
    </Sidebar>
    </SidebarProvider>
  );
};
