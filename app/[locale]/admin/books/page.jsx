"use client";

/**
 * Admin Books Management (#253)
 *
 * Lists all books with take-down / restore controls.
 * - Table view with status badges
 * - Take-down action opens a reason-category confirmation dialog
 * - Restore action returns the book to its prior active state
 * - Status changes reflected immediately in the list
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  MoreVertical,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Ban,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500 } from "@/lib/config/font.config";
import TakeDownBookDialog from "@/components/admin/TakeDownBookDialog";
import RestoreBookDialog from "@/components/admin/RestoreBookDialog";
import BlurImage from "@/components/ui/blur-image";
import MediaBlurToggle from "@/components/admin/MediaBlurToggle";

// Mock books data — replace with real API call
const generateMockBooks = () => [
  {
    _id: "bk_001",
    title: "Introduction to Fiqh",
    author: { _id: "a1", name: "Sheikh Ahmad", avatar: null, role: "Educator" },
    category: "Fiqh",
    price: 0,
    image: "/images/placeholder.jpg",
    readCount: 342,
    status: "active",
    takenDownReason: null,
  },
  {
    _id: "bk_002",
    title: "Understanding Hadith Sciences",
    author: { _id: "a2", name: "Dr. Fatima", avatar: null, role: "Scholar" },
    category: "Hadith",
    price: 12.99,
    image: "/images/placeholder.jpg",
    readCount: 518,
    status: "active",
    takenDownReason: null,
  },
  {
    _id: "bk_003",
    title: "Seerah of the Prophet ﷺ",
    author: { _id: "a3", name: "Sheikh Omar", avatar: null, role: "Educator" },
    category: "Seerah",
    price: 0,
    image: "/images/placeholder.jpg",
    readCount: 891,
    status: "taken-down",
    takenDownReason: "content-violation",
  },
  {
    _id: "bk_004",
    title: "Tajweed Made Simple",
    author: { _id: "a4", name: "Ustadh Ibrahim", avatar: null, role: "Teacher" },
    category: "Quran",
    price: 5.0,
    image: "/images/placeholder.jpg",
    readCount: 127,
    status: "active",
    takenDownReason: null,
  },
  {
    _id: "bk_005",
    title: "Aqeedah Fundamentals",
    author: { _id: "a5", name: "Dr. Yusuf", avatar: null, role: "Scholar" },
    category: "Aqeedah",
    price: 0,
    image: "/images/placeholder.jpg",
    readCount: 204,
    status: "taken-down",
    takenDownReason: "dmca",
  },
  {
    _id: "bk_006",
    title: "Islamic Ethics & Character",
    author: { _id: "a6", name: "Sister Maryam", avatar: null, role: "Educator" },
    category: "Ethics",
    price: 7.5,
    image: "/images/placeholder.jpg",
    readCount: 67,
    status: "active",
    takenDownReason: null,
  },
];

const STATUS_TABS = [
  { value: "all", label: "All Books", icon: BookOpen },
  { value: "active", label: "Active", icon: CheckCircle },
  { value: "taken-down", label: "Taken Down", icon: Ban },
];

const REASON_LABELS = {
  "content-violation": "Content Violation",
  dmca: "DMCA",
  "quality-issues": "Quality Issues",
  other: "Other",
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [takedownDialogOpen, setTakedownDialogOpen] = useState(false);
  const [takedownTarget, setTakedownTarget] = useState(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setBooks(generateMockBooks());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author?.name?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [books, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts = { all: books.length, active: 0, "taken-down": 0 };
    books.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });
    return counts;
  }, [books]);

  const handleTakenDown = (bookId, { reason }) => {
    setBooks((prev) =>
      prev.map((b) =>
        b._id === bookId
          ? { ...b, status: "taken-down", takenDownReason: reason }
          : b
      )
    );
  };

  const handleRestored = (bookId) => {
    setBooks((prev) =>
      prev.map((b) =>
        b._id === bookId
          ? { ...b, status: "active", takenDownReason: null }
          : b
      )
    );
  };

  return (
    <PageShell>
      <PageHeader
        icon={BookOpen}
        title="Book Management"
        subtitle="Manage catalog visibility with take-down and restore controls"
        actions={
          <div className="flex items-center gap-3">
            <MediaBlurToggle className="hidden lg:flex" />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBooks}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Status Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                {STATUS_TABS.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger key={value} value={value} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                    <Badge variant="secondary" className="ml-1">
                      {statusCounts[value] ?? 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search books…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background w-56"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {STATUS_TABS.find((t) => t.value === statusFilter)?.label ?? "All"}{" "}
            Books
          </CardTitle>
          <CardDescription>
            {filteredBooks.length} book{filteredBooks.length !== 1 && "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Book</TableHead>
                  <TableHead className="w-[140px]">Author</TableHead>
                  <TableHead className="w-[100px]">Category</TableHead>
                  <TableHead className="w-[80px]">Reads</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2
                        className="h-6 w-6 animate-spin mx-auto"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Loading books</span>
                    </TableCell>
                  </TableRow>
                ) : filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No books found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-8 rounded overflow-hidden flex-shrink-0">
                            <BlurImage forceBlur>
                              <Image
                                src={book.image || "/images/placeholder.jpg"}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </BlurImage>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {book.title}
                            </p>
                            {book.takenDownReason && (
                              <p className="text-xs text-destructive">
                                Reason:{" "}
                                {REASON_LABELS[book.takenDownReason] ??
                                  book.takenDownReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={book.author?.avatar} />
                            <AvatarFallback className="text-xs">
                              {book.author?.name?.charAt(0) ?? "A"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{book.author?.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {book.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {book.readCount.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        {book.status === "active" ? (
                          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Taken Down
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`Actions for ${book.title}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {book.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setTakedownTarget(book);
                                  setTakedownDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Take Down
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setRestoreTarget(book);
                                  setRestoreDialogOpen(true);
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {takedownTarget && (
        <TakeDownBookDialog
          open={takedownDialogOpen}
          onOpenChange={(open) => {
            setTakedownDialogOpen(open);
            if (!open) setTakedownTarget(null);
          }}
          book={takedownTarget}
          onTakenDown={handleTakenDown}
        />
      )}

      {restoreTarget && (
        <RestoreBookDialog
          open={restoreDialogOpen}
          onOpenChange={(open) => {
            setRestoreDialogOpen(open);
            if (!open) setRestoreTarget(null);
          }}
          book={restoreTarget}
          onRestored={handleRestored}
        />
      )}
    </PageShell>
  );
}
