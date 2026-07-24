"use client";
import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { getAverageRating } from "@/hooks/getAverageRating";
import StarRate from "@/components/atoms/form/StarRate";

const REVIEWS_PER_PAGE = 5;

export default function ReviewsSection({
  reviews = [],
  currentUserId,
  loading = false,
  onEditReview,
  onDeleteReview,
  enableEditDelete = false,
}) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [expanded, setExpanded] = useState(false);

  const averageRating = getAverageRating(reviews);
  const totalReviews = reviews.length;

  const distribution = Array.from({ length: 5 }, (_, i) => {
    const star = 5 - i;
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const displayedReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < totalReviews;

  const handleShowMore = () => {
    setVisibleCount((p) => p + REVIEWS_PER_PAGE);
    setExpanded(true);
  };

  const handleShowLess = () => {
    setVisibleCount(REVIEWS_PER_PAGE);
    setExpanded(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">
            {totalReviews > 0 ? averageRating.toFixed(1) : "—"}
          </span>
          <div>
            <StarRate
              value={averageRating}
              maxStars={5}
              editable={false}
            />
            <span className="text-sm text-muted-foreground">
              {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution Bars */}
      {totalReviews > 0 && (
        <div className="space-y-1.5 max-w-sm">
          {distribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-right text-muted-foreground">
                {star}
              </span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-6 text-right text-muted-foreground tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Review List */}
      {totalReviews === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet — be the first!
        </p>
      ) : (
        <div className="space-y-6">
          {displayedReviews.map((review) => {
            const isOwner =
              enableEditDelete &&
              currentUserId &&
              (review.user?._id === currentUserId ||
                review.user?.id === currentUserId);

            return (
              <div key={review._id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <Link
                    href={`/account/profile/${review.user?._id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user?.avatar} />
                      <AvatarFallback>
                        {review.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm group-hover:underline">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : ""}
                      </p>
                    </div>
                  </Link>

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditReview?.(review)}
                        className="text-xs text-muted-foreground hover:text-accent px-2 py-1 rounded hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteReview?.(review._id)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i <= review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            );
          })}

          {/* Show More / Show Less */}
          {totalReviews > REVIEWS_PER_PAGE && (
            <div className="text-center pt-2">
              {hasMore ? (
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-medium"
                >
                  Show more
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : expanded ? (
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-medium"
                >
                  Show less
                  <ChevronUp className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
