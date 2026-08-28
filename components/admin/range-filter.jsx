"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Shared date-range filter used across admin analytics surfaces.
 *
 * Wraps the Popover + Calendar (mode="range") pattern so callers get a
 * consistent "select range / clear" control without re-implementing it.
 *
 * @param {Object} props
 * @param {{ from: Date|null, to: Date|null }} props.value
 * @param {(range: { from: Date|null, to: Date|null }) => void} props.onChange
 */
function RangeFilter({ value, onChange, className }) {
  const range = value || { from: null, to: null };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !range.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {range.from ? (
            range.to ? (
              <>
                {format(range.from, "LLL dd, y")} - {format(range.to, "LLL dd, y")}
              </>
            ) : (
              format(range.from, "LLL dd, y")
            )
          ) : (
            "Select date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(next) =>
            onChange({ from: next?.from || null, to: next?.to || null })
          }
          numberOfMonths={2}
        />
        <div className="border-t p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ from: null, to: null })}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { RangeFilter };
