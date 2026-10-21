"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/molecules/dashboard/date-picker";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  DATE_FORMAT,
  DATE_PRESETS,
  activePresetId,
  parseDateRange,
  presetRange,
  serializeDateRange,
} from "@/lib/admin/date-range";

/**
 * Read/write the shared analytics date range in the URL query string.
 *
 * @returns {{ range: {from: string, to: string}, setRange: (r: {from: string, to: string}) => void }}
 *   `range` is always valid (defaults to the last 30 days). `setRange` replaces
 *   the history entry and keeps any other query params.
 */
export function useDateRangeParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const range = useMemo(() => parseDateRange(searchParams), [searchParams]);
  const setRange = useCallback(
    (next) => {
      const qs = serializeDateRange(next, searchParams).toString();
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );
  return { range, setRange };
}

/**
 * Shared date-range filter bar: presets (7 / 30 days) + custom range.
 * State lives in the URL (?from=YYYY-MM-DD&to=YYYY-MM-DD), so charts just call
 * `useDateRangeParams()` (client) or `parseDateRange(searchParams)` (server).
 * Needs no props; wrap in <Suspense> when used in a statically rendered page.
 */
export function DateRangeFilter({ className }) {
  const { range, setRange } = useDateRangeParams();
  const [open, setOpen] = useState(false);
  const active = activePresetId(range);

  const selected = { from: dayjs(range.from).toDate(), to: dayjs(range.to).toDate() };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {DATE_PRESETS.map((p) => (
        <Button
          key={p.id}
          size="sm"
          variant={active === p.id ? "default" : "outline"}
          onClick={() => setRange(presetRange(p.days))}
        >
          {p.label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant={active === "custom" ? "default" : "outline"}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {active === "custom" ? `${range.from} - ${range.to}` : "Custom range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <DatePicker
            mode="range"
            numberOfMonths={2}
            defaultMonth={selected.from}
            selected={selected}
            onSelect={(next) => {
              if (next?.from && next?.to) {
                setRange({
                  from: dayjs(next.from).format(DATE_FORMAT),
                  to: dayjs(next.to).format(DATE_FORMAT),
                });
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
