"use client";

/**
 * Admin Reels Moderation & Creator-Level Controls (#263)
 *
 * Provides per-creator and platform-wide reels management:
 * - Filter reels by creator
 * - Bulk pause/resume all reels by creator with affected count confirmation
 * - Cross-link seamlessly between User Detail and Reel Controls
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Film,
  PauseCircle,
  PlayCircle,
  Search,
  ExternalLink,
  User,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { CreatorReelsControlDialog } from "@/components/admin/CreatorReelsControlDialog";
import { cn } from "@/lib/utils";

const SEED_CREATORS = [
  { id: "usr-1", name: "Amina Yusuf", email: "amina@deenbridge.org", isPaused: false },
  { id: "usr-2", name: "Dr. Bilal Philips", email: "bilal@deenbridge.org", isPaused: false },
  { id: "usr-3", name: "Zaid Shakir", email: "zaid@deenbridge.org", isPaused: true },
];

const SEED_REELS = [
  {
    id: "reel-101",
    creatorId: "usr-1",
    creatorName: "Amina Yusuf",
    title: "Surah Al-Mulk: Verse 1 Pronunciation",
    duration: "0:45",
    views: 4520,
    flagsCount: 0,
    status: "active", // 'active' | 'paused'
    createdAt: "2026-02-18T10:00:00Z",
  },
  {
    id: "reel-102",
    creatorId: "usr-1",
    creatorName: "Amina Yusuf",
    title: "Makharij al-Huroof Quick Guide",
    duration: "0:58",
    views: 8900,
    flagsCount: 1,
    status: "active",
    createdAt: "2026-02-20T12:30:00Z",
  },
  {
    id: "reel-103",
    creatorId: "usr-1",
    creatorName: "Amina Yusuf",
    title: "Tajweed Noon Sakinah Rules",
    duration: "0:52",
    views: 3100,
    flagsCount: 0,
    status: "active",
    createdAt: "2026-02-22T08:15:00Z",
  },
  {
    id: "reel-201",
    creatorId: "usr-2",
    creatorName: "Dr. Bilal Philips",
    title: "Fundamentals of Islamic Monotheism",
    duration: "1:00",
    views: 12400,
    flagsCount: 0,
    status: "active",
    createdAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "reel-301",
    creatorId: "usr-3",
    creatorName: "Zaid Shakir",
    title: "Community Ethics & Social Harmony",
    duration: "0:50",
    views: 1200,
    flagsCount: 4,
    status: "paused",
    createdAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "reel-302",
    creatorId: "usr-3",
    creatorName: "Zaid Shakir",
    title: "Reflections on Islamic Governance",
    duration: "0:40",
    views: 950,
    flagsCount: 6,
    status: "paused",
    createdAt: "2026-02-12T16:20:00Z",
  },
];

export default function AdminReelsManagementPage() {
  const searchParams = useSearchParams();
  const creatorQuery = searchParams.get("creator");

  const [creators, setCreators] = useState(SEED_CREATORS);
  const [reels, setReels] = useState(SEED_REELS);
  const [selectedCreatorId, setSelectedCreatorId] = useState(creatorQuery || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (creatorQuery) {
      setSelectedCreatorId(creatorQuery);
    }
  }, [creatorQuery]);

  const activeCreator = useMemo(() => {
    if (selectedCreatorId === "all") return null;
    return creators.find((c) => c.id === selectedCreatorId || c._id === selectedCreatorId);
  }, [creators, selectedCreatorId]);

  const creatorReelsCount = useMemo(() => {
    if (!activeCreator) return 0;
    return reels.filter(
      (r) => r.creatorId === activeCreator.id || r.creatorId === activeCreator._id
    ).length;
  }, [activeCreator, reels]);

  const handleBulkCreatorAction = async ({ creatorId, action, reason }) => {
    const isPausing = action === "pause";

    // Update creator pause status
    setCreators((prev) =>
      prev.map((c) =>
        c.id === creatorId || c._id === creatorId
          ? { ...c, isPaused: isPausing }
          : c
      )
    );

    // Update all reels belonging to creator
    setReels((prev) =>
      prev.map((r) =>
        r.creatorId === creatorId
          ? { ...r, status: isPausing ? "paused" : "active" }
          : r
      )
    );

    const affected = reels.filter((r) => r.creatorId === creatorId).length;
    setNotification({
      type: "success",
      message: isPausing
        ? `Successfully paused all ${affected} reels by ${activeCreator?.name || "creator"}. New uploads blocked.`
        : `Successfully resumed all ${affected} reels by ${activeCreator?.name || "creator"}.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredReels = useMemo(() => {
    return reels.filter((r) => {
      if (selectedCreatorId !== "all" && r.creatorId !== selectedCreatorId) {
        return false;
      }
      if (
        searchQuery &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [reels, selectedCreatorId, searchQuery]);

  return (
    <PageShell>
      <PageHeader
        title="Creator Reel Controls & Moderation"
        description="Monitor short-form video content and apply creator-level moderation controls across all published reels."
        icon={Film}
      />

      {notification && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Creator Focus Banner when filtered */}
      {activeCreator && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {activeCreator.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground text-base">
                    {activeCreator.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={
                      activeCreator.isPaused
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {activeCreator.isPaused ? "Reels Paused" : "Reels Active"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {creatorReelsCount} total published reels &bull; {activeCreator.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/users/${activeCreator.id || activeCreator._id}`}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                View User Detail
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </Link>
              <Button
                size="sm"
                variant={activeCreator.isPaused ? "default" : "destructive"}
                onClick={() => setDialogOpen(true)}
                className="gap-1.5"
              >
                {activeCreator.isPaused ? (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Resume Creator's Reels
                  </>
                ) : (
                  <>
                    <PauseCircle className="h-4 w-4" />
                    Pause All Reels by Creator
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reels by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedCreatorId}
                onChange={(e) => setSelectedCreatorId(e.target.value)}
                className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Creators</option>
                {creators.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} {c.isPaused ? "(Paused)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Published Reels ({filteredReels.length})
          </CardTitle>
          <CardDescription>
            Live video catalog. Pausing a creator sets all their reels to paused and prevents new uploads.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reel Details</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Reports / Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No reels found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReels.map((reel) => (
                  <TableRow key={reel.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{reel.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          Duration: {reel.duration}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${reel.creatorId}`}
                        className="font-medium text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        {reel.creatorName}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {reel.views.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {reel.flagsCount > 0 ? (
                        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {reel.flagsCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {reel.status === "active" ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Paused / Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCreatorId(reel.creatorId);
                          setDialogOpen(true);
                        }}
                        className="text-xs"
                      >
                        Creator Controls
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Creator Controls Dialog */}
      <CreatorReelsControlDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        creator={activeCreator}
        reelsCount={creatorReelsCount}
        isCurrentlyPaused={activeCreator?.isPaused || false}
        onConfirm={handleBulkCreatorAction}
      />
    </PageShell>
  );
}
