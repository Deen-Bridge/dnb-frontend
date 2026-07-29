"use client";
import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  GraduationCap,
  ExternalLink,
  Receipt,
  Wallet,
  Library,
  CircleAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/atoms/form/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import usePurchases from "@/hooks/usePurchases";
import dayjs from "dayjs";

const statusColors = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  submitted: "bg-info/10 text-info",
  failed: "bg-error/10 text-error",
  expired: "bg-muted text-muted-foreground",
};

function truncateAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

function ReceiptModal({ open, onClose, item, receipt, itemType }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Receipt
          </DialogTitle>
          <DialogDescription>
            Transaction details for your purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              {itemType === "book" ? (
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              )}
              <h4 className="font-semibold">{item?.title}</h4>
            </div>
            <Badge variant="outline" className="capitalize">
              {itemType}
            </Badge>
          </div>

          {receipt ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-success/5 border border-success/20 rounded-lg">
                <span className="text-sm text-success font-medium">Amount Paid</span>
                <span className="text-xl font-bold text-success">
                  ${receipt.amount?.toFixed(2)} USDC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={`mt-1 ${statusColors[receipt.status]}`}>
                    {receipt.status}
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium mt-1">
                    {dayjs(receipt.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Paid To (Creator)</p>
                <p className="text-sm font-medium mt-1">
                  {receipt.creatorName || "Creator"}
                </p>
                {receipt.creatorWallet && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {truncateAddress(receipt.creatorWallet)}
                  </p>
                )}
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Your Wallet</p>
                {receipt.buyerWallet && (
                  <p className="text-sm font-mono mt-1">
                    {truncateAddress(receipt.buyerWallet)}
                  </p>
                )}
              </div>

              {receipt.explorerUrl && (
                <a
                  href={receipt.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Stellar Explorer
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 border border-info/20 bg-info/5 rounded-lg text-center">
              <p className="text-sm text-info font-medium">
                Free Enrollment
              </p>
              <p className="text-xs text-info/70 mt-1">
                This item was free or enrolled without a Stellar payment. No on-chain
                transaction receipt is available.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PurchaseCard({ item, itemType, getReceipt }) {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const receipt = getReceipt(item._id, itemType, item.title);
  const thumbnail = item.thumbnail || item.image || "/images/dnb.png";
  const title = item.title || "Untitled";
  const authorName = item.createdBy?.name || item.author?.name || "Unknown";
  const authorAvatar = item.createdBy?.avatar || item.author?.avatar || "/images/placeholder.jpg";
  const actionHref =
    itemType === "course"
      ? `/dashboard/courses/${item._id}`
      : `/dashboard/library/read/${item._id}`;
  const actionLabel = itemType === "course" ? "Watch Course" : "Read Book";

  return (
    <>
      <Card className="relative flex flex-col overflow-hidden rounded-2xl bg-muted/30 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:scale-[1.015] transition-all group">
        <div className="relative h-48 w-full">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/80 text-brand-text font-bold px-3 py-1 rounded-full shadow border-0 text-xs uppercase tracking-wider">
              {item.category || itemType}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="secondary" className="bg-black/60 text-white border-0">
              {item.price > 0 ? `$${item.price} USDC` : "Free"}
            </Badge>
            {receipt ? (
              <Badge variant="secondary" className="bg-success/80 text-white border-0">
                Paid
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-info/80 text-white border-0">
                Enrolled
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold line-clamp-1">{title}</CardTitle>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description || item.author?.name || ""}
          </p>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden relative">
              <Image
                src={authorAvatar}
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-xs">
              <p className="font-medium">{authorName}</p>
              <p className="text-muted-foreground">{itemType === "course" ? "Instructor" : "Author"}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              round
              to={actionHref}
              className="flex-1"
            >
              {itemType === "course" ? (
                <GraduationCap className="h-4 w-4 mr-1" />
              ) : (
                <BookOpen className="h-4 w-4 mr-1" />
              )}
              {actionLabel}
            </Button>
            {receipt && (
              <Button
                round
                outlined
                onClick={() => setReceiptOpen(true)}
              >
                <Receipt className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        item={item}
        receipt={receipt}
        itemType={itemType}
      />
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full rounded-none" />
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PurchasesPage() {
  const { courses, books, isLoading, error, getReceipt, isEmpty } = usePurchases();
  const [tab, setTab] = useState("courses");

  if (error) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6 text-brand-text" />
            My Purchases
          </h1>
          <p className="text-muted-foreground text-sm">Your owned courses and books</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <CircleAlert className="h-12 w-12 text-error" />
            <div>
              <h3 className="font-semibold text-lg">Failed to Load</h3>
              <p className="text-muted-foreground text-sm mt-1">{error}</p>
            </div>
            <Button round outlined onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="h-6 w-6 text-brand-text" />
            My Purchases
          </h1>
          <p className="text-muted-foreground text-sm">
            All your courses and books in one place
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingGrid />
      ) : isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Wallet className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">No Purchases Yet</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">
                You haven&apos;t purchased any courses or books yet. Browse our
                library and enroll to get started.
              </p>
            </div>
            <div className="flex gap-3">
              <Button round to="/dashboard/courses">
                Browse Courses
              </Button>
              <Button round outlined to="/dashboard/library">
                Browse Books
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tab Toggle */}
          <div className="flex gap-2">
            <Button
              round
              outlined={tab !== "courses"}
              className={tab === "courses" ? "bg-accent text-white" : ""}
              onClick={() => setTab("courses")}
            >
              Courses ({courses.length})
            </Button>
            <Button
              round
              outlined={tab !== "books"}
              className={tab === "books" ? "bg-accent text-white" : ""}
              onClick={() => setTab("books")}
            >
              Books ({books.length})
            </Button>
          </div>

          {tab === "courses" ? (
            courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No courses purchased yet</p>
                  <Button round outlined to="/dashboard/courses">
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <PurchaseCard
                    key={course._id}
                    item={course}
                    itemType="course"
                    getReceipt={getReceipt}
                  />
                ))}
              </div>
            )
          ) : books.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No books purchased yet</p>
                <Button round outlined to="/dashboard/library">
                  Browse Books
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <PurchaseCard
                  key={book._id}
                  item={book}
                  itemType="book"
                  getReceipt={getReceipt}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
