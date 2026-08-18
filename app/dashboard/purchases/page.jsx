"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  ExternalLink,
  Receipt,
  Wallet,
  Library,
  CircleAlert,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import usePurchases from "@/hooks/usePurchases";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const statusColors = {
  confirmed: "bg-secondary/10 text-secondary",
  pending: "bg-amber-100 text-amber-600",
  submitted: "bg-sky-100 text-accent",
  failed: "bg-red-100 text-red-600",
  expired: "bg-accent/10 text-ink-muted",
};

function truncateAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

function ReceiptModal({ open, onClose, item, receipt, itemType }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border border-accent/10 bg-surface-raised sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(poppins_600.className, "flex items-center gap-2 text-ink")}
          >
            <Receipt className="h-5 w-5 text-accent" />
            Payment Receipt
          </DialogTitle>
          <DialogDescription className={cn(poppins_400.className, "text-ink-muted")}>
            Transaction details for your purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 rounded-xl border border-accent/10 bg-surface p-4">
            <div className="flex items-center gap-2">
              {itemType === "book" ? (
                <BookOpen className="h-4 w-4 text-ink-muted" />
              ) : (
                <GraduationCap className="h-4 w-4 text-ink-muted" />
              )}
              <h4 className={cn(poppins_600.className, "text-ink")}>{item?.title}</h4>
            </div>
            <span
              className={cn(
                poppins_500.className,
                "inline-flex items-center rounded-full border border-accent/15 bg-surface-raised px-3 py-0.5 text-xs capitalize text-accent"
              )}
            >
              {itemType}
            </span>
          </div>

          {receipt ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/5 p-3">
                <span className={cn(poppins_500.className, "text-sm text-secondary")}>
                  Amount Paid
                </span>
                <span className={cn(poppins_600.className, "text-xl text-secondary")}>
                  ${receipt.amount?.toFixed(2)} USDC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-accent/10 p-3">
                  <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                    Status
                  </p>
                  <span
                    className={cn(
                      poppins_500.className,
                      "mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs capitalize",
                      statusColors[receipt.status] || statusColors.expired
                    )}
                  >
                    {receipt.status}
                  </span>
                </div>
                <div className="rounded-xl border border-accent/10 p-3">
                  <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                    Date
                  </p>
                  <p className={cn(poppins_500.className, "mt-1 text-sm text-ink")}>
                    {dayjs(receipt.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-accent/10 p-3">
                <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                  Paid To (Creator)
                </p>
                <p className={cn(poppins_500.className, "mt-1 text-sm text-ink")}>
                  {receipt.creatorName || "Creator"}
                </p>
                {receipt.creatorWallet && (
                  <p
                    className={cn(
                      poppins_400.className,
                      "mt-0.5 font-mono text-xs text-ink-muted"
                    )}
                  >
                    {truncateAddress(receipt.creatorWallet)}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-accent/10 p-3">
                <p className={cn(poppins_400.className, "text-xs text-ink-muted")}>
                  Your Wallet
                </p>
                {receipt.buyerWallet && (
                  <p className={cn(poppins_500.className, "mt-1 font-mono text-sm text-ink")}>
                    {truncateAddress(receipt.buyerWallet)}
                  </p>
                )}
              </div>

              {receipt.explorerUrl && (
                <a
                  href={receipt.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    poppins_500.className,
                    "inline-flex items-center gap-1 text-sm text-secondary hover:text-highlight"
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Stellar Explorer
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-accent/15 bg-secondary/5 p-4 text-center">
              <p className={cn(poppins_500.className, "text-sm text-accent")}>
                Free Enrollment
              </p>
              <p className={cn(poppins_400.className, "mt-1 text-xs text-ink-muted")}>
                This item was free or enrolled without a Stellar payment. No
                on-chain transaction receipt is available.
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
      <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute left-3 top-3">
            <span
              className={cn(
                poppins_600.className,
                "inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs uppercase tracking-wider text-ink shadow"
              )}
            >
              {item.category || itemType}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span
              className={cn(
                poppins_500.className,
                "inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs text-white"
              )}
            >
              {item.price > 0 ? `$${item.price} USDC` : "Free"}
            </span>
            {receipt ? (
              <span
                className={cn(
                  poppins_500.className,
                  "inline-flex items-center rounded-full bg-secondary/80 px-3 py-1 text-xs text-white"
                )}
              >
                Paid
              </span>
            ) : (
              <span
                className={cn(
                  poppins_500.className,
                  "inline-flex items-center rounded-full bg-accent/80 px-3 py-1 text-xs text-white"
                )}
              >
                Enrolled
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-2 pt-4">
          <h3 className={cn(poppins_600.className, "line-clamp-1 text-base text-ink")}>
            {title}
          </h3>
          <p className={cn(poppins_400.className, "line-clamp-2 text-xs text-ink-muted")}>
            {item.description || item.author?.name || ""}
          </p>
        </div>

        <div className="space-y-3 px-6 pb-6 pt-0">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-surface">
              <Image
                src={authorAvatar}
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-xs">
              <p className={cn(poppins_500.className, "text-ink")}>{authorName}</p>
              <p className={cn(poppins_400.className, "text-ink-muted")}>
                {itemType === "course" ? "Instructor" : "Author"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 rounded-full bg-accent text-white hover:bg-accent/90"
              asChild
            >
              <Link href={actionHref}>
                {itemType === "course" ? (
                  <GraduationCap className="mr-1 h-4 w-4" />
                ) : (
                  <BookOpen className="mr-1 h-4 w-4" />
                )}
                {actionLabel}
              </Link>
            </Button>
            {receipt && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setReceiptOpen(true)}
                aria-label={`View receipt for ${item?.title || "item"}`}
              >
                <Receipt className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

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
    <CardGrid>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="px-6 pb-2 pt-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
          <div className="space-y-3 px-6 pb-6 pt-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </CardGrid>
  );
}

export default function PurchasesPage() {
  const { courses, books, isLoading, error, getReceipt, isEmpty } = usePurchases();
  const [tab, setTab] = useState("courses");

  if (error) {
    return (
      <PageShell>
        <PageHeader
          icon={Library}
          title="My Purchases"
          subtitle="Your owned courses and books"
        />
        <EmptyState
          icon={CircleAlert}
          iconContainerClassName="bg-red-50"
          title="Failed to Load"
          description={error}
          action={
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        icon={Library}
        title="My Purchases"
        subtitle="All your courses and books in one place"
      />

      {isLoading ? (
        <LoadingGrid />
      ) : isEmpty ? (
        <EmptyState
          icon={Wallet}
          title="No Purchases Yet"
          description="You haven't purchased any courses or books yet. Browse our library and enroll to get started."
          action={
            <>
              <Button
                className="rounded-full bg-accent text-white hover:bg-accent/90"
                asChild
              >
                <Link href="/dashboard/courses">Browse Courses</Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/dashboard/library">Browse Books</Link>
              </Button>
            </>
          }
        />
      ) : (
        <>
          {/* Tab Toggle */}
          <div className="flex gap-2">
            <Button
              variant={tab === "courses" ? "default" : "outline"}
              className={cn(
                "rounded-full",
                tab === "courses" && "bg-accent text-white hover:bg-accent/90"
              )}
              onClick={() => setTab("courses")}
            >
              Courses ({courses.length})
            </Button>
            <Button
              variant={tab === "books" ? "default" : "outline"}
              className={cn(
                "rounded-full",
                tab === "books" && "bg-accent text-white hover:bg-accent/90"
              )}
              onClick={() => setTab("books")}
            >
              Books ({books.length})
            </Button>
          </div>

          {tab === "courses" ? (
            courses.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                description="No courses purchased yet"
                action={
                  <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/dashboard/courses">Browse Courses</Link>
                  </Button>
                }
              />
            ) : (
              <CardGrid>
                {courses.map((course) => (
                  <PurchaseCard
                    key={course._id}
                    item={course}
                    itemType="course"
                    getReceipt={getReceipt}
                  />
                ))}
              </CardGrid>
            )
          ) : books.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              description="No books purchased yet"
              action={
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/dashboard/library">Browse Books</Link>
                </Button>
              }
            />
          ) : (
            <CardGrid>
              {books.map((book) => (
                <PurchaseCard
                  key={book._id}
                  item={book}
                  itemType="book"
                  getReceipt={getReceipt}
                />
              ))}
            </CardGrid>
          )}
        </>
      )}
    </PageShell>
  );
}
