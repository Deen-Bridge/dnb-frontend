"use client";

/**
 * Admin Reels Moderation (#269)
 *
 * Bulk moderation of reels with:
 * - Multi-select with checkboxes
 * - Bulk hide / unhide with shared reason
 * - Sequential fan-out pattern with progress toasts
 * - Typed confirmation for operations affecting 20+ items
 * - Keyboard shortcuts: j/k navigate, x toggle select, h hide
 * - Help popover documenting keyboard shortcuts
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Video,
  Eye,
  EyeOff,
  MoreVertical,
  RefreshCw,
  Search,
  Keyboard,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";
import { formatDistanceToNow } from "date-fns";
import useBulkReels from "@/hooks/useBulkReels";
import { toast } from "sonner";

// ─── Mock data ────────────────────────────────────────────────────────

const CATEGORIES = [
  "Quran",
  "Hadith",
  "Fiqh",
  "Seerah",
  "Tafsir",
  "Youth",
  "General",
];

function generateMockReels(count = 60) {
  const reels = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(
      now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );
    reels.push({
      id: `rl_${i.toString().padStart(4, "0")}`,
      title: `Reel ${i + 1}: ${["Dua Tip", "Quran Recitation", "Hadith Reminder", "Fiqh Minute", "Seerah Story", "Youth Talk"][i % 6]}`,
      description: `A short video sharing an Islamic ${CATEGORIES[i % CATEGORIES.length].toLowerCase()} insight for the community.`,
      category: CATEGORIES[i % CATEGORIES.length],
      author: {
        id: `usr_${(i % 15).toString().padStart(3, "0")}`,
        name: ["Sheikh Ahmad", "Ustadh Ibrahim", "Dr. Fatima", "Sister Amina", "Brother Yusuf", "Ustadha Maryam"][i % 6],
      },
      status: Math.random() > 0.2 ? "active" : "flagged",
      hidden: Math.random() > 0.85,
      views: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 100),
      createdAt: createdAt.toISOString(),
    });
  }

  return reels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─── Mock API ─────────────────────────────────────────────────────────

async function mockModerateReel(_reelId, _action, _reason) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));
  // Simulate occasional failure (5%)
  if (Math.random() < 0.05) {
    return { ok: false, error: "Server error — please try again" };
  }
  return { ok: true };
}

// ─── Keyboard Shortcuts Help ──────────────────────────────────────────

const SHORTCUTS = [
  { keys: ["j"], description: "Move selection down" },
  { keys: ["k"], description: "Move selection up" },
  { keys: ["x"], description: "Toggle select highlighted reel" },
  { keys: ["h"], description: "Bulk hide selected reels" },
  { keys: ["H"], description: "Bulk unhide selected reels" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["Escape"], description: "Clear selection / close dialogs" },
];

function KeyboardShortcutsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-2">
          <p className={cn(poppins_500.className, "text-sm font-medium")}>
            Keyboard Shortcuts
          </p>
          <div className="space-y-1.5">
            {SHORTCUTS.map(({ keys, description }) => (
              <div
                key={description}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">{description}</span>
                <div className="flex gap-1">
                  {keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 bg-background border rounded text-[10px] font-mono"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Bulk Actions Bar ─────────────────────────────────────────────────

function BulkActionsBar({
  selectedCount,
  needsConfirmation,
  confirmed,
  setConfirmed,
  onBulkHide,
  onBulkUnhide,
  onClearSelection,
  processing,
}) {
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null); // "hide" | "unhide"
  const [confirmInput, setConfirmInput] = useState("");

  const handleAction = (type) => {
    if (needsConfirmation && !confirmed) {
      setActionType(type);
      setConfirmInput("");
      return;
    }
    if (type === "hide") {
      onBulkHide(reason);
    } else {
      onBulkUnhide(reason);
    }
    setReason("");
  };

  const handleConfirmSubmit = () => {
    if (confirmInput !== "CONFIRM") return;
    setConfirmed(true);
    if (actionType === "hide") {
      onBulkHide(reason);
    } else {
      onBulkUnhide(reason);
    }
    setReason("");
    setActionType(null);
    setConfirmInput("");
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Badge variant="secondary" className="text-xs">
                {selectedCount} selected
              </Badge>
              <div className="flex-1 max-w-xs">
                <Input
                  placeholder="Shared reason (optional)…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-8 text-xs"
                  disabled={processing}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkUnhide}
                disabled={processing}
                className="gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Unhide
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction("hide")}
                disabled={processing}
                className="gap-1.5"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hide
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={processing}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typed confirmation dialog for 20+ items */}
      <Dialog
        open={!!actionType && needsConfirmation && !confirmed}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null);
            setConfirmInput("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Bulk {actionType === "hide" ? "Hide" : "Unhide"}
            </DialogTitle>
            <DialogDescription>
              You are about to {actionType} {selectedCount} reels. This is a
              large batch operation. Please type <strong>CONFIRM</strong> to
              proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-input" className="text-xs">
              Type CONFIRM to proceed
            </Label>
            <Input
              id="confirm-input"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="CONFIRM"
              className="font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmSubmit();
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionType(null);
                setConfirmInput("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmSubmit}
              disabled={confirmInput !== "CONFIRM" || processing}
            >
              {processing && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
              {actionType === "hide" ? "Hide" : "Unhide"} {selectedCount} Reels
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Reel Row ─────────────────────────────────────────────────────────

function ReelRow({
  reel,
  isSelected,
  isHighlighted,
  onToggleSelect,
  onSelect,
  onAction,
}) {
  return (
    <tr
      className={cn(
        "cursor-pointer transition-colors",
        isHighlighted && "bg-muted/50 ring-2 ring-primary ring-inset",
        isSelected && "bg-primary/5",
      )}
      onClick={() => onSelect()}
    >
      <td className="w-[50px] px-3 py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect()}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select reel ${reel.title}`}
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
            <Video className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[200px]">
              {reel.title}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
              {reel.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 hidden md:table-cell">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{reel.author.name}</span>
        </div>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell">
        <Badge variant="outline" className="text-[10px]">
          {reel.category}
        </Badge>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground font-mono">
          {reel.views.toLocaleString()}
        </span>
      </td>
      <td className="px-3 py-2 hidden md:table-cell">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true })}
        </div>
      </td>
      <td className="px-3 py-2">
        {reel.hidden ? (
          <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Hidden
          </Badge>
        ) : reel.status === "flagged" ? (
          <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Flagged
          </Badge>
        ) : (
          <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        )}
      </td>
      <td className="w-[50px] px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Actions for ${reel.title}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction("hide")}>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("unhide")}>
              <Eye className="h-4 w-4 mr-2" />
              Unhide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function AdminReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchRef = useRef(null);
  const pageSize = 15;

  // Bulk operations hook
  const bulk = useBulkReels({
    reels,
    setReels,
    mutateReel: (reel, changes) => ({ ...reel, ...changes }),
    apiAction: mockModerateReel,
  });

  // Filtered reels
  const filteredReels = useMemo(() => {
    let result = [...reels];

    if (statusFilter === "hidden") {
      result = result.filter((r) => r.hidden);
    } else if (statusFilter === "active") {
      result = result.filter((r) => !r.hidden && r.status === "active");
    } else if (statusFilter === "flagged") {
      result = result.filter((r) => r.status === "flagged");
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.author.name.toLowerCase().includes(term) ||
          r.category.toLowerCase().includes(term),
      );
    }

    return result;
  }, [reels, statusFilter, search]);

  const totalPages = Math.ceil(filteredReels.length / pageSize);
  const paginatedReels = filteredReels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const statusCounts = useMemo(() => {
    const counts = { all: reels.length, active: 0, flagged: 0, hidden: 0 };
    reels.forEach((r) => {
      if (r.hidden) counts.hidden++;
      else if (r.status === "flagged") counts.flagged++;
      else counts.active++;
    });
    return counts;
  }, [reels]);

  // Fetch reels
  const fetchReels = useCallback(async (isRefetch = false) => {
    if (isRefetch) setIsRefetching(true);
    else setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setReels(generateMockReels());
    } catch {
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip when typing in an input
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        if (e.key === "Escape") {
          e.target.blur();
        }
        return;
      }

      switch (e.key) {
        case "j":
          e.preventDefault();
          bulk.moveHighlight(1);
          break;
        case "k":
          e.preventDefault();
          bulk.moveHighlight(-1);
          break;
        case "x":
          e.preventDefault();
          if (paginatedReels[bulk.highlightedIndex]) {
            bulk.toggleSelect(paginatedReels[bulk.highlightedIndex].id);
          }
          break;
        case "h":
          e.preventDefault();
          if (bulk.selectedCount > 0) {
            bulk.bulkHide("");
          }
          break;
        case "H":
          e.preventDefault();
          if (bulk.selectedCount > 0) {
            bulk.bulkUnhide("");
          }
          break;
        case "/":
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case "Escape":
          e.preventDefault();
          bulk.clearSelection();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bulk, paginatedReels]);

  // Sync highlighted index when page changes
  useEffect(() => {
    bulk.setHighlightedIndex(0);
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => fetchReels(true);

  return (
    <PageShell>
      <PageHeader
        icon={Video}
        title="Reels Moderation"
        subtitle="Bulk moderate reels with multi-select and keyboard shortcuts"
        actions={
          <div className="flex items-center gap-2">
            <KeyboardShortcutsPopover />
            <kbd className="hidden lg:inline-flex px-2 py-1 text-xs font-mono bg-muted rounded">
              j/k · x · h
            </kbd>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4 sm:mr-2", loading && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Status Tabs + Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  All
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.active}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="flagged" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Flagged
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.flagged}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="hidden" className="gap-2">
                  <EyeOff className="h-4 w-4" />
                  Hidden
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.hidden}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search reels…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background w-56"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={bulk.selectedCount}
        needsConfirmation={bulk.needsConfirmation}
        confirmed={bulk.confirmed}
        setConfirmed={bulk.setConfirmed}
        onBulkHide={bulk.bulkHide}
        onBulkUnhide={bulk.bulkUnhide}
        onClearSelection={bulk.clearSelection}
        processing={bulk.processing}
      />

      {/* Progress indicator */}
      {bulk.progress && (
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${(bulk.progress.completed / bulk.progress.total) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Reels Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Reels ({filteredReels.length})
              </CardTitle>
              <CardDescription>
                {bulk.selectedCount > 0
                  ? `${bulk.selectedCount} selected`
                  : `Page ${currentPage} of ${totalPages || 1}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  paginatedReels.length > 0 &&
                  paginatedReels.every((r) => bulk.isSelected(r.id))
                }
                onCheckedChange={bulk.toggleSelectAll}
                aria-label="Select all visible reels"
              />
              <span className="text-xs text-muted-foreground">Select all</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-[50px] px-3 py-2"></th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Reel
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Author
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Views
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Age
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="w-[50px] px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <Loader2
                        className="h-6 w-6 animate-spin mx-auto"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Loading reels</span>
                    </td>
                  </tr>
                ) : paginatedReels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <Video className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No reels found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedReels.map((reel, index) => (
                    <ReelRow
                      key={reel.id}
                      reel={reel}
                      isSelected={bulk.isSelected(reel.id)}
                      isHighlighted={index === bulk.highlightedIndex}
                      onToggleSelect={() => bulk.toggleSelect(reel.id)}
                      onSelect={() => bulk.setHighlightedIndex(index)}
                      onAction={(action) => {
                        if (action === "hide") {
                          mockModerateReel(reel.id, "hide").then((res) => {
                            if (res.ok) {
                              setReels((prev) =>
                                prev.map((r) =>
                                  r.id === reel.id
                                    ? { ...r, hidden: true }
                                    : r,
                                ),
                              );
                              toast.success("Reel hidden");
                            }
                          });
                        } else {
                          mockModerateReel(reel.id, "unhide").then((res) => {
                            if (res.ok) {
                              setReels((prev) =>
                                prev.map((r) =>
                                  r.id === reel.id
                                    ? { ...r, hidden: false }
                                    : r,
                                ),
                              );
                              toast.success("Reel unhidden");
                            }
                          });
                        }
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p
                className={cn(
                  poppins_400.className,
                  "text-sm text-muted-foreground",
                )}
              >
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
