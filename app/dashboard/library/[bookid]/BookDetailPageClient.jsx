"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import {
  DownloadCloud,
  Wallet,
  Star,
  Tag,
  FileText,
  BookOpen,
  User,
  MessageSquare,
} from "lucide-react";
import StarRate from "@/components/atoms/form/StarRate";
import ReviewsSection from "@/components/organisms/dashboard/ReviewsSection";
import { addBookReview } from "@/lib/actions/library/addReview";
import { getAverageRating } from "@/hooks/getAverageRating";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { useHasBook, usePurchaseBook } from "@/hooks/usePurchase";
import PaymentModal from "@/components/stellar/PaymentModal";
import { useStellar } from "@/components/stellar/StellarProvider";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

/* ── building blocks (design-system consistent) ── */

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const SectionHeading = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-5 flex items-start gap-3">
    {Icon && (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
        <Icon className="h-5 w-5 text-accent" />
      </div>
    )}
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {subtitle && (
        <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-accent/10 bg-surface px-4 py-3">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
      <Icon className="h-4 w-4 text-accent" />
    </div>
    <div className="min-w-0">
      <p
        className={cn(
          poppins_400,
          "text-[11px] uppercase tracking-wider text-ink-muted"
        )}
      >
        {label}
      </p>
      <p className={cn(poppins_600, "truncate text-sm text-ink")}>{value}</p>
    </div>
  </div>
);

export default function BookDetailPage({ book }) {
  const { user, refreshUser } = useAuth();
  const { connectedWallet } = useStellar();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const hasBook = useHasBook(book?._id);
  const [loading, setLoading] = useState(false);
  const [purchased, setPurchased] = useState(
    () => hasBook || book?.price === 0
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check if the current user has already reviewed
  const userReview = useMemo(() => {
    if (!user?._id || !book?.reviews) return null;
    return book.reviews.find(
      (r) => r.user?._id === user._id || r.user?.id === user._id
    );
  }, [user, book?.reviews]);

  useEffect(() => {
    if (hasBook) {
      setPurchased(true);
    }
  }, [hasBook]);

  const canAccessBook = useMemo(
    () =>
      Boolean(
        book?.price === 0 ||
          hasBook ||
          purchased ||
          (user?._id && user._id === book?.author?._id?.toString?.())
      ),
    [book?.author?._id, book?.price, hasBook, purchased, user?._id]
  );

  // Handle opening the payment modal
  const handlePurchaseBook = () => {
    if (!user?._id) {
      toast.error("Please sign in to purchase this book.");
      return;
    }
    setShowPaymentModal(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = async (result) => {
    setPurchased(true);
    if (user?._id) {
      await refreshUser(user._id);
    }
  };

  // Check if creator has wallet connected (for showing appropriate message)
  const creatorHasWallet = book?.author?.stellarWallet?.publicKey;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await addBookReview({
        bookId: book._id || book.id,
        rating,
        comment: review,
      });
      if (res.success) {
        setSubmitted(true);
        toast.success("Thank you for your review!");
      } else {
        setError(res.message || "Failed to submit review");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = getAverageRating(book?.reviews);
  const reviewCount = book?.reviews?.length || 0;
  const priceLabel = book?.price ? `$${book.price}` : "Free";

  return (
    <div className="min-h-screen space-y-6 bg-surface p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ── Hero: cover (left) · details + CTA (right) ── */}
        <Panel className="overflow-hidden">
          <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,340px)_1fr] lg:gap-10">
            {/* Cover */}
            <div className="mx-auto w-full max-w-[320px] md:mx-0">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-accent/10 bg-gradient-to-br from-secondary/10 to-highlight/10 shadow-lg">
                <Image
                  src={book.image || "/images/placeholder.jpg"}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <span
                className={cn(
                  poppins_500,
                  "inline-flex w-fit items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs text-accent"
                )}
              >
                <Tag className="h-3.5 w-3.5" />
                {book.category}
              </span>

              <h1
                className={cn(
                  poppins_600,
                  "mt-4 text-3xl leading-tight text-ink sm:text-4xl"
                )}
              >
                {book.title}
              </h1>

              {book.author?.name && (
                <div className="mt-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-ink-muted" />
                  {book.author?._id ? (
                    <Link
                      href={`/account/profile/${book.author._id}`}
                      className={cn(
                        poppins_500,
                        "text-sm text-accent hover:text-highlight hover:underline"
                      )}
                    >
                      {book.author.name}
                    </Link>
                  ) : (
                    <span className={cn(poppins_500, "text-sm text-ink")}>
                      {book.author.name}
                    </span>
                  )}
                </div>
              )}

              {/* Rating */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-accent/20"
                      )}
                    />
                  ))}
                </div>
                <span className={cn(poppins_600, "text-sm text-ink")}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "New"}
                </span>
                <span className={cn(poppins_400, "text-sm text-ink-muted")}>
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-2">
                <span className={cn(poppins_600, "text-3xl text-ink")}>
                  {priceLabel}
                </span>
                {book?.price ? (
                  <span className={cn(poppins_400, "text-sm text-ink-muted")}>
                    USDC
                  </span>
                ) : null}
              </div>

              {/* CTA */}
              <div className="mt-auto pt-6">
                {canAccessBook ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      wide
                      round
                      className="bg-accent text-white shadow-sm transition hover:bg-highlight"
                      to={`/dashboard/library/read/${book._id ?? book.id}`}
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> Read now
                    </Button>
                    <Button
                      outlined
                      round
                      to={book.fileUrl}
                      download
                      target="_blank"
                    >
                      <DownloadCloud className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      wide
                      round
                      className="bg-accent text-white shadow-sm transition hover:bg-highlight"
                      onClick={handlePurchaseBook}
                      loading={loading}
                    >
                      <Wallet className="mr-2 h-4 w-4" /> Buy to read
                    </Button>
                    {!creatorHasWallet && (
                      <p className={cn(poppins_400, "text-sm text-red-600")}>
                        Note: Creator has not connected their Stellar wallet yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Panel>

        {/* ── About + meta ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="p-6 lg:col-span-2">
            <SectionHeading
              icon={BookOpen}
              title="About this book"
              subtitle="What you'll find inside"
            />
            <p
              className={cn(
                poppins_400,
                "leading-relaxed text-ink-muted"
              )}
            >
              {book.description || "No description available for this book yet."}
            </p>
          </Panel>

          <Panel className="p-6">
            <SectionHeading title="Details" />
            <div className="space-y-3">
              <MetaChip icon={Tag} label="Category" value={book.category || "—"} />
              {book?.pages ? (
                <MetaChip
                  icon={FileText}
                  label="Pages"
                  value={`${book.pages} pages`}
                />
              ) : null}
              <MetaChip icon={Wallet} label="Price" value={priceLabel} />
            </div>
          </Panel>
        </div>

        {/* ── Reviews ── */}
        <Panel className="p-6">
          <SectionHeading
            icon={MessageSquare}
            title="Reviews"
            subtitle={`${reviewCount} ${
              reviewCount === 1 ? "reader has" : "readers have"
            } shared their thoughts`}
          />

          {/* Write a review */}
          {user?._id !== book?.author?._id && (
            <>
              {userReview && (
                <div
                  className={cn(
                    poppins_400,
                    "mb-6 rounded-xl border border-accent/10 bg-surface px-4 py-3 text-sm text-ink-muted"
                  )}
                >
                  You reviewed this book on{" "}
                  {new Date(userReview.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  .
                </div>
              )}
              {!submitted && !userReview && (
                <div className="mb-8 rounded-xl border border-accent/10 bg-surface p-5">
                  <h3 className={cn(poppins_600, "text-base text-ink")}>
                    Leave a Review
                  </h3>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <StarRate
                      value={rating}
                      onChange={setRating}
                      maxStars={5}
                      editable={!submitting && !submitted}
                      label={
                        rating > 0
                          ? `Your rating: ${rating} star${
                              rating > 1 ? "s" : ""
                            }`
                          : undefined
                      }
                    />
                    <Textarea
                      aria-label="Write a review"
                      placeholder="What did you think about the book?"
                      className="min-h-[120px] border-accent/15 bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      disabled={submitting || submitted}
                    />
                    {error && (
                      <div className={cn(poppins_400, "text-sm text-red-600")}>
                        {error}
                      </div>
                    )}
                    <Button
                      round
                      className="bg-accent text-white transition hover:bg-highlight"
                      type="submit"
                      disabled={
                        submitting || rating === 0 || review.trim() === ""
                      }
                      loading={submitting}
                    >
                      Submit Review
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Reviews list */}
          <ReviewsSection
            reviews={book.reviews || []}
            currentUserId={user?._id}
            loading={false}
            enableEditDelete={false}
          />
        </Panel>
      </div>

      {/* Stellar Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        item={book}
        itemType="book"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
