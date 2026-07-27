"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { searchQuery } from "@/hooks/useSearch";
import {
  LaptopMinimal,
  Book,
  User,
  AudioWaveform,
  Play,
  LayoutDashboard,
  Bookmark,
  Inbox,
  HeartHandshake,
  ShoppingBag,
  DollarSign,
  PlusCircle,
  Wallet,
  Clock,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const RECENT_SEARCHES_KEY = "dnb_recent_searches";
const MAX_RECENT_SEARCHES = 6;

const typeLabels = {
  course: "Course",
  book: "Book",
  user: "Educator",
  space: "Space",
  reel: "Reel",
};

const typeLinks = {
  course: (id) => `/dashboard/courses/${id}`,
  book: (id) => `/dashboard/library/${id}`,
  user: (id) => `/account/profile/${id}`,
  space: (id) => `/dashboard/spaces/${id}`,
  reel: (id) => `/dashboard/reels/${id}`,
};

const getTypeIcon = (type) => {
  switch (type) {
    case "course":
      return <LaptopMinimal className="h-4 w-4 text-accent" />;
    case "book":
      return <Book className="h-4 w-4 text-blue-500" />;
    case "user":
      return <User className="h-4 w-4 text-emerald-500" />;
    case "space":
      return <AudioWaveform className="h-4 w-4 text-purple-500" />;
    case "reel":
      return <Play className="h-4 w-4 text-pink-500" />;
    default:
      return <Search className="h-4 w-4 text-muted-foreground" />;
  }
};

const primaryDestinations = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/dashboard/courses", icon: LaptopMinimal },
  { name: "Library", href: "/dashboard/library", icon: Book },
  { name: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { name: "Spaces", href: "/dashboard/spaces", icon: AudioWaveform },
  { name: "Reels", href: "/dashboard/reels", icon: Play },
  { name: "Messages", href: "/dashboard/messages", icon: Inbox },
  { name: "Sadaqah", href: "/dashboard/sadaqah", icon: HeartHandshake },
  { name: "My Purchases", href: "/dashboard/purchases", icon: ShoppingBag },
  { name: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
];

const quickActions = [
  { name: "Create Course", href: "/dashboard/courses/create", icon: PlusCircle },
  { name: "Open Wallet", href: "/dashboard/earnings", icon: Wallet },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const lastActiveElementRef = React.useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const restoreFocus = useCallback(() => {
    setTimeout(() => {
      if (
        lastActiveElementRef.current &&
        typeof lastActiveElementRef.current.focus === "function"
      ) {
        lastActiveElementRef.current.focus();
      } else {
        const btn = document.getElementById("global-search-trigger");
        if (btn) btn.focus();
      }
    }, 50);
  }, []);

  // Sync keyboard shortcut ⌘K / Ctrl+K and open-command-palette event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            if (typeof document !== "undefined") {
              lastActiveElementRef.current = document.activeElement;
            }
            return true;
          } else {
            restoreFocus();
            return false;
          }
        });
      }
    };

    const handleOpenEvent = () => {
      if (typeof document !== "undefined") {
        lastActiveElementRef.current = document.activeElement;
      }
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, [restoreFocus]);

  // Save term to recent searches
  const addRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== cleanTerm.toLowerCase()
      );
      const updated = [cleanTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback((e) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);

    const timer = setTimeout(() => {
      searchQuery(query.trim())
        .then((data) => {
          setResults(Array.isArray(data) ? data : []);
          setError(false);
        })
        .catch(() => {
          setResults([]);
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Navigate and close dialog
  const handleSelect = useCallback(
    (href, searchTerm) => {
      if (searchTerm) {
        addRecentSearch(searchTerm);
      }
      setOpen(false);
      setQuery("");
      restoreFocus();
      router.push(href);
    },
    [router, addRecentSearch, restoreFocus]
  );

  // Group results by type
  const groupedResults = React.useMemo(() => {
    const groups = {
      course: [],
      book: [],
      user: [],
      space: [],
      reel: [],
      other: [],
    };
    results.forEach((item) => {
      if (groups[item.type]) {
        groups[item.type].push(item);
      } else {
        groups.other.push(item);
      }
    });
    return groups;
  }, [results]);

  const hasSearchTerm = query.trim().length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setQuery("");
          restoreFocus();
        }
      }}
      title="Global Search & Commands"
      description="Search across courses, books, educators, and spaces, or trigger quick actions."
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Type a command or search courses, books, educators..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span>Searching...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load search results. Please try again.</span>
          </div>
        )}

        {/* Empty state when query produces 0 results */}
        {!loading && !error && hasSearchTerm && results.length === 0 && (
          <CommandEmpty>No results found for &quot;{query}&quot;</CommandEmpty>
        )}

        {/* Search Results (Grouped by type) */}
        {!loading && !error && hasSearchTerm && results.length > 0 && (
          <>
            {/* Courses */}
            {groupedResults.course.length > 0 && (
              <CommandGroup heading="Courses">
                {groupedResults.course.map((item) => {
                  const href = typeLinks.course(item.id);
                  const title = item.title || item.name || "Untitled Course";
                  return (
                    <CommandItem
                      key={`course-${item.id}`}
                      value={`course-${item.id}-${title}`}
                      onSelect={() => handleSelect(href, title)}
                      className="cursor-pointer"
                    >
                      {getTypeIcon("course")}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{title}</span>
                        {item.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.price !== undefined && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.price ? `$${item.price}` : "Free"}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Books */}
            {groupedResults.book.length > 0 && (
              <CommandGroup heading="Books">
                {groupedResults.book.map((item) => {
                  const href = typeLinks.book(item.id);
                  const title = item.title || item.name || "Untitled Book";
                  return (
                    <CommandItem
                      key={`book-${item.id}`}
                      value={`book-${item.id}-${title}`}
                      onSelect={() => handleSelect(href, title)}
                      className="cursor-pointer"
                    >
                      {getTypeIcon("book")}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{title}</span>
                        {item.author && (
                          <span className="truncate text-xs text-muted-foreground">
                            By {typeof item.author === "object" ? item.author.name : item.author}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Educators / Users */}
            {groupedResults.user.length > 0 && (
              <CommandGroup heading="Educators">
                {groupedResults.user.map((item) => {
                  const href = typeLinks.user(item.id);
                  const title = item.name || item.title || "Educator";
                  return (
                    <CommandItem
                      key={`user-${item.id}`}
                      value={`user-${item.id}-${title}`}
                      onSelect={() => handleSelect(href, title)}
                      className="cursor-pointer"
                    >
                      {getTypeIcon("user")}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{title}</span>
                        {item.role && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.role}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Spaces */}
            {groupedResults.space.length > 0 && (
              <CommandGroup heading="Spaces">
                {groupedResults.space.map((item) => {
                  const href = typeLinks.space(item.id);
                  const title = item.title || item.name || "Untitled Space";
                  return (
                    <CommandItem
                      key={`space-${item.id}`}
                      value={`space-${item.id}-${title}`}
                      onSelect={() => handleSelect(href, title)}
                      className="cursor-pointer"
                    >
                      {getTypeIcon("space")}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{title}</span>
                        {item.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </>
        )}

        {/* See all results fallback when typing */}
        {!loading && hasSearchTerm && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem
                value={`see-all-${query}`}
                onSelect={() =>
                  handleSelect(
                    `/dashboard/search/${encodeURIComponent(query.trim())}`,
                    query.trim()
                  )
                }
                className="cursor-pointer text-accent font-medium"
              >
                <Search className="h-4 w-4 mr-2" />
                <span>See all results for &quot;{query}&quot;</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {/* Content shown when input is empty */}
        {!hasSearchTerm && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <CommandGroup
                heading={
                  <div className="flex items-center justify-between w-full pr-2">
                    <span>Recent Searches</span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 font-normal"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear all
                    </button>
                  </div>
                }
              >
                {recentSearches.map((term, idx) => (
                  <CommandItem
                    key={`recent-${idx}-${term}`}
                    value={`recent-${term}`}
                    onSelect={() => {
                      setQuery(term);
                    }}
                    className="cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{term}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentSearches.length > 0 && <CommandSeparator />}

            {/* Go To Navigation Links */}
            <CommandGroup heading="Go to">
              {primaryDestinations.map((dest) => (
                <CommandItem
                  key={dest.name}
                  value={`goto-${dest.name}`}
                  onSelect={() => handleSelect(dest.href)}
                  className="cursor-pointer"
                >
                  <dest.icon className="h-4 w-4 text-accent" />
                  <span>{dest.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Quick Actions */}
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.name}
                  value={`action-${action.name}`}
                  onSelect={() => handleSelect(action.href)}
                  className="cursor-pointer"
                >
                  <action.icon className="h-4 w-4 text-accent" />
                  <span>{action.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;
