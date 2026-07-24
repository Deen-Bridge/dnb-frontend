"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import { DownloadCloud, Wallet } from "lucide-react";
import StarRate from "@/components/atoms/form/StarRate";
import ReviewsSection from "@/components/organisms/dashboard/ReviewsSection";
import { addBookReview } from "@/lib/actions/library/addReview";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { CustomSidebar } from "@/components/organisms/dashboard/CustomSidebar";
import BookStatsInfo from "@/components/molecules/dashboard/BookStats&Info";
import { useHasBook, usePurchaseBook } from "@/hooks/usePurchase";
import PaymentModal from "@/components/stellar/PaymentModal";
import { useStellar } from "@/components/stellar/StellarProvider";

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

  return (
    <div className="min-h-screen py-12 px-4 md:px-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
        {/* Book Showcase and Main Content */}
        <div className="md:col-span-8 space-y-12">
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md bg-white/5">
            <Image
              src={book.image || "/images/placeholder.jpg"}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
          {/* Title & Category */}
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight">{book.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-accent ">{book.category}</Badge>
              <Badge variant="accent" className="bg-white/10 text-highlight">
                {book.price ? `$${book.price}` : "Free"}
              </Badge>
            </div>
            <p className="text-md /80 leading-relaxed">{book.description}</p>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {canAccessBook ? (
              <>
                <Button
                  wide
                  className="bg-accent hover:highlight text-white font-bold shadow-lg transition"
                  round
                  to={`/dashboard/library/read/${book._id ?? book.id}`}
                >
                  Start Reading
                </Button>
                <Button
                  outlined
                  round
                  to={book.fileUrl}
                  download
                  target="_blank"
                >
                  <DownloadCloud className="w-4 h-4 mr-2" /> Download
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  wide
                  className="bg-accent hover:bg-highlight text-white font-bold shadow-lg transition"
                  round
                  onClick={handlePurchaseBook}
                  loading={loading}
                >
                  <Wallet className="w-4 h-4 mr-2" /> Pay with Stellar
                </Button>
                {!creatorHasWallet && (
                  <p className="text-sm text-orange-500">
                    Note: Creator has not connected their Stellar wallet yet
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Review Section */}
          {user?._id !== book.author._id && (
            <div className="pt-10 space-y-5 border-t border-white/10">
              {userReview && (
                <div className="text-sm text-muted-foreground">
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
                <>
                  <h2 className="text-3xl font-semibold">Leave a Review</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      placeholder="What did you think about the book?"
                      className="bg-white/10 min-h-[120px] border-accent focus:outline-none"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      disabled={submitting || submitted}
                    />
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <Button
                      wide
                      round
                      className="bg-accent hover:bg-highlight font-semibold mt-2 transition"
                      type="submit"
                      disabled={
                        submitting || rating === 0 || review.trim() === ""
                      }
                      loading={submitting}
                    >
                      Submit Review
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
          {/* Reviews List */}
          <div className="pt-8">
            <h2 className="text-3xl font-semibold mb-6">Reviews</h2>
            <ReviewsSection
              reviews={book.reviews || []}
              currentUserId={user?._id}
              loading={false}
              enableEditDelete={false}
            />
          </div>
        </div>
        {/* Sidebar for desktop/tablet */}
        <div className="md:col-span-4 hidden md:block space-y-8 sticky top-20 self-start">
          <CustomSidebar book={book} side="right" collapsible="none" />
        </div>
        {/* BookStatsInfo for mobile only */}
        <div className="block md:hidden mt-8">
          <BookStatsInfo book={book} />
        </div>
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
