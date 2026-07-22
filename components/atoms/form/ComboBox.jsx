"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getGroupedCategories } from "@/lib/categories";

/**
 * CategoryCombobox — controlled component.
 *
 * Props:
 *   category   {string}  — current value (label string); controlled by parent
 *   setCategory {Function} — called with the newly selected label string
 */
export default function CategoryCombobox({ category, setCategory }) {
  const [open, setOpen] = React.useState(false);

  // `category` is the source of truth — no internal value state.
  const displayLabel = category || "Select category...";

  const groups = getGroupedCategories();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground hover:bg-transparent"
        >
          {displayLabel}
          <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            {groups.map(({ group, categories }) => (
              <CommandGroup key={group} heading={group}>
                {categories.map((cat) => (
                  <CommandItem
                    key={cat.slug}
                    value={cat.label}
                    onSelect={(currentValue) => {
                      // Toggle off if same value is selected again
                      setCategory(currentValue === category ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        category === cat.label ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
