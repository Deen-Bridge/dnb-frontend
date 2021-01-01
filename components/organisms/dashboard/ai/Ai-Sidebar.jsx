"use client"

import * as React from "react"
import { NavMain } from "@/components/molecules/dashboard/nav-main"
import Navrouter from "@/components/molecules/dashboard/nav-routers"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar"
import DnbLogo from "@/components/molecules/dashboard/dnb-logo"

export function AiSidebar({
    ...props
}) {
    return (
        <Sidebar className="border-r-0" {...props} side="right">
            <SidebarHeader>
                {/* <DnbLogo /> */}
            </SidebarHeader>
            {/* dashboard pages route */}
            <SidebarContent>
            <div
        className="relative hidden flex-col items-start gap-8 md:flex h-full"
        x-chunk="dashboard-03-chunk-0"
      >
        <div className="grid w-full items-start gap-6 h-full">
          <fieldset className="grid gap-6 rounded-lg border p-4 h-full overflow-y-auto">
            <legend className="-ml-1 px-1 text-md font-medium">History</legend>
            <fieldset className="grid gap-6 rounded-lg border p-4 h-full overflow-y-auto">
              <legend className="-ml-1 px-1 text-md font-medium">Today</legend>
              {/* {messages
                                .filter((msg) => msg.role === "user")
                                .map((msg, index) => (
                                  <div key={index} className="grid gap-3">
                                    <span className="text-sm">{msg.content}</span>
                                  </div>
                                ))} */}
              <span className="text-8xl">hi</span>
            </fieldset>
          </fieldset>
        </div>
      </div>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
