"use client";
import dynamic from "next/dynamic";
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
import {
  Wallet,
  RotateCcw,
  Play,
  Star,
  BookOpen,
  Tag,
  Users,
  MessageSquare,
  Lock,
  CheckCircle2,
  GraduationCap,
  Clock,
  BarChart3,
} from "lucide-react";
import PaymentModal from "@/components/stellar/PaymentModal";
import { useStellar } from "@/components/stellar/StellarProvider";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

// Vidstack (@vidstack/react) is a large dependency only needed once a
// learner actually opens the player, so it's kept out of the initial
// course-page bundle and loaded on demand instead.
const VidPlayerBox = dynamic(
  () => import("@/components/atoms/dashboard/vid-player-box"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center rounded-xl bg-black/90">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    ),
  }
);

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
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
      <Icon className="h-5 w-5 text-accent" />
    </div>
    <div className="pt-0.5">
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {subtitle && (
        <p className={cn(poppins_400, "mt-0.5 text-sm text-ink-muted")}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

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

  const isCreator = user?._id === course.createdBy?._id;
  const reviewCount = course.reviews?.length || 0;
  const avgRating = reviewCount
    ? course.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
    : 0;
  const priceLabel = course.price === 0 ? "Free" : `$${course.price}`;

  return (
    <div className="min-h-screen bg-surface px-3 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ── Course header ── */}
        <Panel className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-surface-raised to-highlight/10 p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && (
                <span
                  className={cn(
                    poppins_500,
                    "inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs capitalize text-accent"
                  )}
                >
                  <Tag className="h-3.5 w-3.5" />
                  {course.category}
                </span>
              )}
              <span
                className={cn(
                  poppins_500,
                  "inline-flex items-center gap-1.5 rounded-full border border-accent/10 bg-surface px-3 py-1 text-xs text-ink-muted"
                )}
              >
                <BarChart3 className="h-3.5 w-3.5 text-accent" />
                {course.level || "Beginner"}
              </span>
              {course.duration && (
                <span
                  className={cn(
                    poppins_500,
                    "inline-flex items-center gap-1.5 rounded-full border border-accent/10 bg-surface px-3 py-1 text-xs text-ink-muted"
                  )}
                >
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  {course.duration}
                </span>
              )}
            </div>

            <h1 className={cn(poppins_600, "text-2xl leading-tight text-ink sm:text-3xl")}>
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={`/account/profile/${course.createdBy?._id}`}
                className="group flex items-center gap-2.5"
              >
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage
                    src={course.createdBy?.avatar || "/images/img1.jpeg"}
                    alt=""
                  />
                  <AvatarFallback>
                    {course.createdBy?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className={cn(poppins_500, "text-sm text-ink group-hover:text-secondary")}>
                    {course.createdBy?.name || "Unknown creator"}
                  </p>
                  <p className={cn(poppins_400, "text-xs capitalize text-ink-muted")}>
                    {course.createdBy?.role || "Educator"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "h-4 w-4",
                        s <= Math.round(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-ink-muted/30"
                      )}
                    />
                  ))}
                </div>
                <span className={cn(poppins_600, "text-sm text-ink")}>
                  {avgRating > 0 ? avgRating.toFixed(1) : "New"}
                </span>
                <span className={cn(poppins_400, "text-xs text-ink-muted")}>
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>
          </div>
        </Panel>

        {/* ── Main + sidebar ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Player / preview */}
            {canAccess ? (
              <div className="space-y-4">
                <Panel className="overflow-hidden p-2 sm:p-3">
                  <div className="w-full aspect-video overflow-hidden rounded-xl">
                    <VidPlayerBox
                      key={playerKey}
                      data={course}
                      startTime={effectiveStartTime}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleEnded}
                    />
                  </div>
                </Panel>

                {progress.percent > 0 &&
                  !progress.completed &&
                  resumeLabel &&
                  !useResume && (
                    <Panel className="flex flex-col items-center justify-between gap-3 border-accent/20 bg-accent/5 p-4 sm:flex-row">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                          <Play className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className={cn(poppins_500, "text-sm text-ink")}>
                            {resumeLabel}
                          </p>
                          <Progress
                            value={progress.percent}
                            className="mt-1.5 h-1.5 w-48"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          round
                          className="bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90"
                          onClick={handleResume}
                        >
                          <Play className="mr-1 h-4 w-4" />
                          Resume
                        </Button>
                        <Button
                          round
                          outlined
                          className="px-4 text-sm"
                          onClick={handleStartOver}
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Start Over
                        </Button>
                      </div>
                    </Panel>
                  )}

                {progress.completed && (
                  <Panel className="flex items-center gap-2 border-secondary/20 bg-secondary/5 p-4">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className={cn(poppins_500, "text-sm text-ink")}>
                      Course Completed
                    </span>
                    <Button
                      round
                      outlined
                      className="ml-auto px-3 py-1 text-xs"
                      onClick={handleStartOver}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Watch Again
                    </Button>
                  </Panel>
                )}

                {progress.percent > 0 && (
                  <Panel className="p-4">
                    <div
                      className={cn(
                        poppins_500,
                        "mb-1.5 flex justify-between text-xs text-ink-muted"
                      )}
                    >
                      <span className="text-ink">{progress.percent}% complete</span>
                      <span>
                        {formatTime(progress.positionSeconds)} /{" "}
                        {formatTime(progress.durationSeconds)}
                      </span>
                    </div>
                    <Progress value={progress.percent} className="h-1.5" />
                  </Panel>
                )}
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-accent/10 shadow-sm">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-accent/20 to-highlight/20 backdrop-blur-sm">
                  <div className="space-y-4 rounded-2xl border border-accent/10 bg-surface-raised/95 p-8 text-center shadow-xl">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                      <Lock className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className={cn(poppins_600, "text-xl text-ink")}>
                      Course Locked
                    </h3>
                    <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                      Purchase this course to unlock full access
                    </p>
                    <div className={cn(poppins_600, "text-3xl text-accent")}>
                      {priceLabel}
                    </div>
                  </div>
                </div>
                <img
                  src={course.thumbnail || "/images/dnb.png"}
                  alt={course.title}
                  className="h-full w-full object-cover blur-sm"
                />
              </div>
            )}

            {/* About this course */}
            <Panel className="p-5 sm:p-6">
              <SectionHeading
                icon={BookOpen}
                title="About this course"
                subtitle="What you'll be learning"
              />
              <p className={cn(poppins_400, "leading-relaxed text-ink-muted")}>
                {course.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-accent/10 pt-5 sm:grid-cols-3">
                <div>
                  <p className={cn(poppins_400, "text-xs text-ink-muted")}>Duration</p>
                  <p className={cn(poppins_500, "text-sm text-ink")}>
                    {course.duration || "N/A"}
                  </p>
                </div>
                <div>
                  <p className={cn(poppins_400, "text-xs text-ink-muted")}>Level</p>
                  <p className={cn(poppins_500, "text-sm capitalize text-ink")}>
                    {course.level || "Beginner"}
                  </p>
                </div>
                <div>
                  <p className={cn(poppins_400, "text-xs text-ink-muted")}>Category</p>
                  <p className={cn(poppins_500, "text-sm capitalize text-ink")}>
                    {course.category || "General"}
                  </p>
                </div>
              </div>
            </Panel>

            {/* Reviews */}
            <Panel className="p-5 sm:p-6">
              <SectionHeading
                icon={MessageSquare}
                title="Reviews"
                subtitle={`${reviewCount} learner ${
                  reviewCount === 1 ? "review" : "reviews"
                }`}
              />

              {!isCreator && canAccess && (
                <div className="mb-6 space-y-5">
                  {userReview && (
                    <div
                      className={cn(
                        poppins_400,
                        "rounded-xl border border-accent/10 bg-surface p-4 text-sm text-ink-muted"
                      )}
                    >
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
                    <div className="rounded-xl border border-accent/10 bg-surface p-4 sm:p-5">
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
                          placeholder="What did you think about the course?"
                          className="min-h-[120px] border-accent/20 bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
                          wide
                          round
                          className="mt-1 bg-accent font-semibold text-white transition hover:bg-highlight"
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
                </div>
              )}

              <ReviewsSection
                reviews={course.reviews || []}
                currentUserId={user?._id}
                loading={false}
                enableEditDelete={false}
              />
            </Panel>
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-1">
            <Panel className="sticky top-4 space-y-5 p-6">
              {canAccess && !isCreator && (
                <div className="flex items-center gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2">
                  <GraduationCap className="h-4 w-4 text-secondary" />
                  <span className={cn(poppins_500, "text-xs text-ink")}>
                    Enrolled
                  </span>
                </div>
              )}

              <div className="text-center">
                <p className={cn(poppins_400, "text-xs uppercase tracking-wider text-ink-muted")}>
                  Course Price
                </p>
                <div className={cn(poppins_600, "mt-1 text-4xl text-accent")}>
                  {priceLabel}
                </div>
              </div>

              {!hasCourse && !purchased && !isCreator ? (
                <div className="space-y-2">
                  <Button
                    wide
                    round
                    onClick={handlePurchaseCourse}
                    loading={loading}
                    className="w-full bg-accent py-6 text-lg font-semibold text-white hover:bg-accent/90"
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    {course.price === 0
                      ? "Enroll Now - Free!"
                      : `Pay $${course.price} with Stellar`}
                  </Button>
                  {!creatorHasWallet && course.price > 0 && (
                    <p className={cn(poppins_400, "text-center text-xs text-ink-muted")}>
                      Note: Creator has not connected their Stellar wallet yet
                    </p>
                  )}
                </div>
              ) : canAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-secondary/20 bg-secondary/5 p-4 text-center">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <p className={cn(poppins_500, "text-sm text-ink")}>
                      You own this course
                    </p>
                  </div>
                  {progress.percent > 0 && (
                    <div className="rounded-xl border border-accent/10 bg-surface p-4">
                      <div
                        className={cn(
                          poppins_500,
                          "mb-1.5 flex items-center justify-between text-xs"
                        )}
                      >
                        <span className="text-ink-muted">Your progress</span>
                        <span className="text-accent">{progress.percent}%</span>
                      </div>
                      <Progress value={progress.percent} className="h-1.5" />
                    </div>
                  )}
                </div>
              ) : null}

              <div className="space-y-3 border-t border-accent/10 pt-5">
                <div className="flex items-center justify-between">
                  <span className={cn(poppins_400, "flex items-center gap-2 text-sm text-ink-muted")}>
                    <Users className="h-4 w-4 text-accent" />
                    Students Enrolled
                  </span>
                  <span className={cn(poppins_600, "text-sm text-ink")}>
                    {course.enrolledUsers?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(poppins_400, "flex items-center gap-2 text-sm text-ink-muted")}>
                    <MessageSquare className="h-4 w-4 text-accent" />
                    Reviews
                  </span>
                  <span className={cn(poppins_600, "text-sm text-ink")}>
                    {reviewCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn(poppins_400, "flex items-center gap-2 text-sm text-ink-muted")}>
                    <Tag className="h-4 w-4 text-accent" />
                    Category
                  </span>
                  <span className={cn(poppins_600, "text-sm capitalize text-ink")}>
                    {course.category}
                  </span>
                </div>
              </div>
            </Panel>
          </aside>
        </div>
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
