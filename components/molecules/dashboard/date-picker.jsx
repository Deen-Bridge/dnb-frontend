import { Calendar } from "@/components/ui/calendar"
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/**
 * Calendar in a sidebar group. Extra props (mode, selected, onSelect,
 * numberOfMonths, ...) are forwarded to the underlying Calendar, so it can be
 * used as a controlled range picker (see components/admin/DateRangeFilter).
 */
export function DatePicker({ className, ...calendarProps }) {
    return (
        <SidebarGroup className="px-0">
            <SidebarGroupContent>
                <Calendar
                    className={cn("[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]", className)}
                    {...calendarProps}
                />
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
