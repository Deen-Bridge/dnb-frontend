"use client"
import VidPlayerBox from "@/components/atoms/dashboard/vid-player-box";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import React, { useState } from "react";
import Button from "@/components/atoms/form/Button";
import StarRate from "@/components/atoms/form/StarRate";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import { addCourseReview } from "@/lib/actions/courses/addReview";
import { useHasCourse, usePurchaseCourse } from "@/hooks/usePurchase";
import { toast } from "sonner";

export default function CourseDetailClient({ course }) {
    const { user, refreshUser } = useAuth();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Check if user already owns the course
    const hasCourse = useHasCourse(course?._id);
    // Local state to hide button after purchase
    const [purchased, setPurchased] = useState(false);

    const handlePurchaseCourse = async () => {
        setLoading(true);
        try {
            await usePurchaseCourse(course._id);
            await refreshUser(user._id);
            setPurchased(true); // Hide button immediately after purchase
            toast.success("Course purchased successfully!");
        } catch (error) {
            toast.error("Failed to purchase course.");
        } finally {
            setLoading(false);
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

    return (
        <div className="max-w-full px-2 sm:px-4 py-4">
            <h2 className="text-3xl font-extrabold mb-6">Watch Course</h2>
            <div className="w-full min-h-[460px] lg:min-h-[480px] mb-8">
                <VidPlayerBox data={course} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 sm:px-10">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-4xl font-semibold">{course.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                    <Link href={`/account/profile/${course.createdBy?._id}`} className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage src={course.createdBy?.avatar || "/images/img1.jpeg"} />
                            <AvatarFallback>{course.createdBy?.name?.charAt(0) || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex  justify-between   pt-2">
                                <span className="font-medium text-black">{course.createdBy?.name || "Unknown creator"}</span>
                                <span className="text-sm text-muted">{course.createdBy?.role || "Unknown creator"}</span>
                            </div>
                            <div className="border-t pt-4 text-gray-600 text-sm space-y-2">
                                <p><strong>Duration:</strong> {course.duration || "N/A"}</p>
                                <p><strong>Level:</strong> {course.level || "Beginner"}</p>
                            </div>
                        </div>
                    </Link>
                    {user?._id !== course.createdBy?._id && (
                        <div className="pt-10 space-y-5 border-t border-white/10">
                            {!submitted && (
                                <>
                                    <h2 className="text-3xl font-semibold">Leave a Review</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <StarRate
                                            value={rating}
                                            onChange={setRating}
                                            maxStars={5}
                                            editable={!submitting && !submitted}
                                            label={rating > 0 ? `Your rating: ${rating} star${rating > 1 ? "s" : ""}` : undefined}
                                        />
                                        <Textarea
                                            placeholder="What did you think about the book?"
                                            className="bg-white/10 min-h-[120px] border-accent focus:outline-none"
                                            value={review}
                                            onChange={e => setReview(e.target.value)}
                                            disabled={submitting || submitted}
                                        />
                                        {error && <div className="text-red-500 text-sm">{error}</div>}
                                        <Button
                                            wide
                                            round
                                            className="bg-accent hover:bg-highlight font-semibold mt-2 transition"
                                            type="submit"
                                            disabled={submitting || rating === 0 || review.trim() === ""}
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
                {/* Right Column: Pricing & category */}
                <aside className="border rounded-md p-6 h-fit shadow-sm bg-white space-y-4">
                    <h3 className="text-xl font-semibold">{course.title}</h3>
                    <div className="flex items-center justify-between mb-4">
                        <span className="inline-block mb-4 px-3 py-1 rounded bg-gray-100 text-accent font-semibold capitalize">
                            {course.category}
                        </span>
                        <p className="text-2xl font-bold mb-3">${course.price}</p>
                    </div>
                    {/* Show Buy button only if not purchased */}
                    {(!hasCourse && !purchased) && (
                        <Button
                            wide
                            round
                            onClick={handlePurchaseCourse}
                            loading={loading}
                            className="bg-accent hover:bg-accent/90 text-white"
                        >
                            Buy Course
                        </Button>
                    )}
                </aside>
            </div>
        </div>
    );
}
