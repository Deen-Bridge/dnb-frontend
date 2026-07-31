"use client";
import VidPlayerBox from "@/components/atoms/dashboard/vid-player-box";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import React, { useState, useMemo, useCallback } from "react";
import Button from "@/components/atoms/form/Button";
import StarRate from "@/components/atoms/form/StarRate";
import ReviewsSection from "@/components/organisms/dashboard/ReviewsSection";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { addCourseReview } from "@/lib/actions/courses/addReview";
import { useHasCourse, usePurchaseCourse } from "@/hooks/usePurchase";
import { useCourseProgress, formatTime } from "@/hooks/useCourseProgress";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Wallet, RotateCcw, Play } from "lucide-react";
import PaymentModal from "@/components/stellar/PaymentModal";
import { useStellar } from "@/components/stellar/StellarProvider";

export default function CourseDetailClient({ course }) {
  const { user, refreshUser } = useAuth();
  const { connectedWallet } = useStellar();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const hasCourse = useHasCourse(course?._id);
  const [purchased, setPurchased] = useState(false);

  const {
    progress,
    reportProgress,
    resetProgress,
    resumeTime,
    resumeLabel,
  } = useCourseProgress(course?._id);

  const [useResume, setUseResume] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const effectiveStartTime = useResume && resumeTime ? resumeTime : 0;

  const handleTimeUpdate = useCallback(
    (currentTime, duration) => {
      reportProgress(currentTime, duration);
    },
    [reportProgress]
  );

  const handleEnded = useCallback(() => {
    if (course?._id) {
      reportProgress(progress.durationSeconds || 0, progress.durationSeconds || 0);
    }
  }, [reportProgress, progress.durationSeconds, course?._id]);

  const handleResume = () => {
    setUseResume(true);
  };

  const handleStartOver = () => {
    resetProgress();
    setUseResume(false);
    setPlayerKey((k) => k + 1);
  };

  const userReview = useMemo(() => {
    if (!user?._id || !course?.reviews) return null;
    return course.reviews.find(
      (r) => r.user?._id === user._id || r.user?.id === user._id
    );
  }, [user, course?.reviews]);

  const creatorHasWallet = course?.createdBy?.stellarWallet?.publicKey;

  const handlePurchaseCourse = () => {
    if (!user?._id) {
      toast.error("Please sign in to purchase this course.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (result) => {
    setPurchased(true);
    if (user?._id) {
      await refreshUser(user._id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await addCourseReview({
        courseId: course._id || course.id,
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

  if (!course) {
    return null;
  }

  const canAccess =
    hasCourse || purchased || user?._id === course.createdBy?._id;

  return (
    <div className="max-w-full px-2 sm:px-4 py-4">
      <h2 className="text-3xl font-extrabold mb-6">
        {canAccess ? "Watch Course" : "Course Preview"}
      </h2>

      {canAccess ? (
        <div className="w-full mb-8 rounded-xl">
          {progress.percent > 0 && !progress.completed && resumeLabel && !useResume && (
            <div className="mb-4 p-4 bg-accent/10 border border-accent/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-semibold text-sm">{resumeLabel}</p>
                  <Progress value={progress.percent} className="w-48 h-1.5 mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  round
                  className="bg-accent hover:bg-accent/90 text-white text-sm font-semibold px-4"
                  onClick={handleResume}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
                <Button
                  round
                  outlined
                  className="text-sm px-4"
                  onClick={handleStartOver}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {progress.completed && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <span className="text-green-600 font-semibold text-sm">
                ✅ Course Completed
              </span>
              <Button
                round
                outlined
                className="text-xs ml-auto px-3 py-1"
                onClick={handleStartOver}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Watch Again
              </Button>
            </div>
          )}

          <div className="w-full aspect-video rounded-xl overflow-hidden">
            <VidPlayerBox
              key={playerKey}
              data={course}
              startTime={effectiveStartTime}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
          </div>

          {progress.percent > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{progress.percent}% complete</span>
                <span>{formatTime(progress.positionSeconds)} / {formatTime(progress.durationSeconds)}</span>
              </div>
              <Progress value={progress.percent} className="h-1.5" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-video mb-8 relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-highlight/20 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center space-y-4 p-8 bg-background/90 rounded-xl shadow-2xl">
              <h3 className="text-2xl font-bold">🔒 Course Locked</h3>
              <p className="text-muted-foreground">
                Purchase this course to unlock full access
              </p>
              <div className="text-4xl font-bold text-brand-text">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>
            </div>
          </div>
          <img
            src={course.thumbnail || "/images/dnb.png"}
            alt={course.title}
            className="w-full h-full object-cover blur-sm"
          />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 sm:px-10">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-4xl font-semibold">{course.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          <Link
            href={`/account/profile/${course.createdBy?._id}`}
            className="flex items-center gap-2"
          >
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage
                src={course.createdBy?.avatar || "/images/img1.jpeg"}
              />
              <AvatarFallback>
                {course.createdBy?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-row justify-between items-center">
              <div className="flex  justify-between   pt-2">
                <span className="font-medium text-foreground">
                  {course.createdBy?.name || "Unknown creator"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {course.createdBy?.role || "Unknown creator"}
                </span>
              </div>
              <div className="border-t pt-4 text-muted-foreground text-sm space-y-2">
                <p>
                  <strong>Duration:</strong> {course.duration || "N/A"}
                </p>
                <p>
                  <strong>Level:</strong> {course.level || "Beginner"}
                </p>
              </div>
            </div>
          </Link>
          {user?._id !== course.createdBy?._id && canAccess && (
            <div className="pt-10 space-y-5 border-t border-border">
              {userReview && (
                <div className="text-sm text-muted-foreground">
                  You reviewed this course on{" "}
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
                      placeholder="What did you think about the course?"
                      className="bg-muted/50 min-h-[120px] border-accent focus:outline-none"
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
        </div>
        <aside className="space-y-4">
          <div className="border rounded-xl p-6 shadow-lg bg-card space-y-6 sticky top-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Course Price</p>
              <div className="text-5xl font-bold text-brand-text">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>
            </div>

            {!hasCourse && !purchased && user?._id !== course.createdBy?._id ? (
              <div className="space-y-2">
                <Button
                  wide
                  round
                  onClick={handlePurchaseCourse}
                  loading={loading}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-6 text-lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {course.price === 0
                    ? "Enroll Now - Free!"
                    : `Pay $${course.price} with Stellar`}
                </Button>
                {!creatorHasWallet && course.price > 0 && (
                  <p className="text-sm text-orange-500 text-center">
                    Note: Creator has not connected their Stellar wallet yet
                  </p>
                )}
              </div>
            ) : canAccess ? (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-200 font-semibold">
                  ✅ You have access to this course
                </p>
              </div>
            ) : null}

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Students Enrolled
                </span>
                <span className="font-semibold">
                  {course.enrolledUsers?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviews</span>
                <span className="font-semibold">
                  {course.reviews?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-semibold text-brand-text capitalize">
                  {course.category}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="px-2 sm:px-10 mt-12">
        <h2 className="text-3xl font-semibold mb-6">Reviews</h2>
        <ReviewsSection
          reviews={course.reviews || []}
          currentUserId={user?._id}
          loading={false}
          enableEditDelete={false}
        />
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        item={course}
        itemType="course"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
