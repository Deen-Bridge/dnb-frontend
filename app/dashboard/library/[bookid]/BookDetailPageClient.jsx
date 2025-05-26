"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/atoms/form/Button";
import { Textarea } from "@/components/ui/textarea";
import { DownloadCloud } from "lucide-react";
import StarRate from "@/components/atoms/form/StarRate";
import { addBookReview } from "@/lib/actions/library/addReveiw";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { CustomSidebar } from "@/components/organisms/dashboard/CustomSidebar";
import BookStatsInfo from "@/components/molecules/dashboard/BookStats&Info";

export default function BookDetailPage({ book }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

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
                        <Button
                            wide
                            className=" bg-accent hover:highlight text-white font-bold shadow-lg transition"
                            round
                            to={`/dashboard/library/read/${book.id}`}
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
                    </div>

                    
                    {/* Review Section */}
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
        </div>
    );
}
