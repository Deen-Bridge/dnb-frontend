"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Button from "@/components/atoms/form/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Radix SelectItem rejects an empty string value, so the "no filter" state
// needs a sentinel that cannot collide with a real category name.
export const ALL = "__all__";

const PRICE_OPTIONS = [
  { value: ALL, label: "All prices" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

const LibraryToolbar = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  price,
  onPriceChange,
  sort,
  onSortChange,
  onClear,
  isFiltered,
  resultCount,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by title or author"
            aria-label="Search books by title or author"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={price} onValueChange={onPriceChange}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by price">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[190px]" aria-label="Sort books">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {resultCount} {resultCount === 1 ? "book" : "books"}
        </p>
        {isFiltered && (
          <Button round outlined onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default LibraryToolbar;