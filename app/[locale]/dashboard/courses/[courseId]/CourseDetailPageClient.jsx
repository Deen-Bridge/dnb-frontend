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
  Wallet, RotateCcw, Play, Star, BookOpen, Tag, Users, MessageSquare, Lock,
  CheckCircle2, GraduationCap, Clock, BarChart3, AlertTriangle
} from "lucide-react";
import PaymentModal from "@/components/stellar/PaymentModal";
import { useStellar } from "@/components/stellar/StellarProvider";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

const VidPlayerBox = dynamic(() => import("@/components/atoms/dashboard/vid-player-box"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center rounded-xl bg-basic/90">
      <div className="w-8 h-8 border-2 border-ink-inverse/30 border-t-ink-inverse rounded-full animate-spin" />
    </div>
  ),
});

const Panel = ({ className, children }) => (
  <div className={cn("rounded-2xl border border-accent/10 bg-surface-raised shadow-sm", className)}>
    {children}
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const hasCourse = useHasCourse(course?._id);
  const [purchased, setPurchased] = useState(false);

  const { progress, reportProgress, resetProgress, resumeTime } = useCourseProgress(course?._id);
  const [useResume, setUseResume] = useState(false);

  const isCreator = user?._id === course?.createdBy?._id;
  const flagCount = course?.flagCount || 0;

  const handlePurchaseCourse = () => {
    if (!user?._id) {
      toast.error("Please sign in to purchase this course.");
      return;
    }
    setShowPaymentModal(true);
  };

  if (!course) return null;

  return (
    <div className="min-h-screen bg-surface px-3 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Panel className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-surface-raised to-highlight/10 p-5 sm:p-7">
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {flagCount > 0 && (
                <Link
                  href={`/admin/reports?type=course&id=${course._id}`}
                  className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-600 transition hover:bg-red-500/20"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {flagCount} {flagCount === 1 ? "flag" : "flags"}
                </Link>
              )}
              <span className={cn(poppins_500, "inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs capitalize text-accent")}>
                <Tag className="h-3.5 w-3.5" />
                {course.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-ink">{course.title}</h1>
          </div>
        </Panel>
        {/* ... remainder of content remains unchanged ... */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          course={course}
        />
      </div>
    </div>
  );
}