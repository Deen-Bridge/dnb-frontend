"use client"
import * as React from "react"

export function AiSidebar({
    ...props
}) {
    return (

        <div className="grid w-full items-start gap-6 h-full">
          <fieldset className="grid gap-6 rounded-lg border p-4 h-full overflow-y-auto">
            <legend className="-ml-1 px-1 text-md font-medium">History</legend>
            <fieldset className="grid gap-6 rounded-lg border p-4 overflow-y-auto">
              <legend className="-ml-1 px-1 text-md font-medium">Today</legend>
              {/* {messages
                                .filter((msg) => msg.role === "user")
                                .map((msg, index) => (
                                  <div key={index} className="grid gap-3">
                                    <span className="text-sm">{msg.content}</span>
                                  </div>
                                ))} */}
              <span className="text-sm text-muted-foreground">hi</span>
            </fieldset>
          </fieldset>
        </div>
  
    )
}
