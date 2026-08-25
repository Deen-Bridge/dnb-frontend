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
import { CATEGORY_GROUPS } from "@/lib/categories";

export default function CategoryCombobox({ category, setCategory, id }) {
  const [open, setOpen] = React.useState(false);

  return (

    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select category"
          className="w-full justify-between text-muted-foreground hover:bg-transparent"
        >
          {category || "Select category..."}
          <ChevronsUpDown className="opacity-50 h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
<CommandInput placeholder="Search category..." aria-label="Search categories" className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            {CATEGORY_GROUPS.map((group) => (
              <CommandGroup key={group.id} heading={group.label}>
                {group.categories.map((subcategory) => (
                  <CommandItem
                    key={subcategory.label}
                    value={subcategory.label}
                    onSelect={(currentValue) => {
                      setCategory(currentValue === category ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {subcategory.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        category === subcategory.label
                          ? "opacity-100"
                          : "opacity-0"
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
