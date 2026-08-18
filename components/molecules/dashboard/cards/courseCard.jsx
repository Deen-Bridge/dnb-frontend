import { Progress } from "@/components/ui/progress";
import Button from "@/components/atoms/form/Button";
import Link from "next/link";
import { Ellipsis, CheckCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBookmark } from "@/hooks/useBookmark";
import BookmarkButton from "@/components/atoms/BookmarkButton";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

const CourseCard = ({ course, onBookmarkChange, initialIsBookmarked, progress }) => {
  const { user } = useAuth();
  const { isBookmarked, loading, toggle } = useBookmark(
    course._id,
    onBookmarkChange,
    initialIsBookmarked
  );

  const hasPurchased = user?.purchasedCourses?.some(
    (c) =>
      c.courseId?.toString?.() === course._id?.toString?.() ||
      c._id?.toString?.() === course._id?.toString?.()
  ) || user?.enrolledCourses?.some(
    (c) => c?.toString?.() === course._id?.toString?.()
  );

  const showProgress = hasPurchased && progress && progress.percent > 0;
  const isCompleted = progress?.completed || false;

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle();
  };
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/10 bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/30 hover:shadow-md">
      {/* Image */}
      <div className="relative h-60 w-full">
        <Image
          src={course.thumbnail || "/images/dnb.png"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Category  */}
        <div className="absolute left-3 right-3 top-3 z-20 flex justify-between">
          <span
            className={cn(
              poppins_600,
              "rounded-full border border-accent/15 bg-surface-raised/90 px-3 py-1 text-xs uppercase tracking-wider text-ink shadow"
            )}
          >
            {course.category || "General"}
          </span>
          {user?._id === course?.createdBy?._id ? (
            <span
              className={cn(
                poppins_600,
                "flex items-center rounded-full border border-accent/15 bg-surface-raised/90 px-2 py-1 uppercase tracking-wider text-ink shadow"
              )}
            >
              <Ellipsis className="size-6" />
            </span>
          ) : null}
        </div>

        {/* Progress badge on owned courses */}
        {showProgress && (
          <div className="absolute bottom-3 left-3 right-3 z-20">
            {isCompleted ? (
              <div
                className={cn(
                  poppins_600,
                  "flex w-fit items-center gap-1 rounded-full bg-secondary/90 px-3 py-1 text-xs text-white shadow"
                )}
              >
                <CheckCircle className="h-3 w-3" />
                Completed
              </div>
            ) : (
              <div
                className={cn(
                  poppins_500,
                  "w-fit rounded-full bg-black/60 px-3 py-1 text-xs text-white shadow backdrop-blur-sm"
                )}
              >
                {progress.percent}% watched
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="space-y-1.5 p-6 pb-3">
        <h3 className={cn(poppins_600, "line-clamp-1 text-lg text-ink")}>
          {course.title}
        </h3>
        <p className={cn(poppins_400, "line-clamp-2 text-sm text-ink-muted")}>
          {course.description}
        </p>
      </div>

      {/* Instructor */}
      <div className="px-6 pb-4">
        {showProgress && (
          <div className="mb-3">
            <Progress value={progress.percent} className="h-1.5" />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/educators/${course.createdBy?._id}`}
            className="flex items-center gap-2"
          >
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage
                src={course.createdBy?.avatar || "/images/placeholder.jpg"}
                alt=""
              />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className={cn(poppins_500, "text-ink")}>
                {course.createdBy?.name || "Ali Jamal"}
              </p>
              <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                Instructor
              </p>
            </div>
          </Link>
          <div className="flex items-center justify-between gap-4">
            {!hasPurchased && (
              <div
                className={cn(
                  poppins_600,
                  "rounded-full bg-gradient-to-r from-highlight to-accent px-3 py-1 text-xs text-white shadow"
                )}
              >
                {course.price ? `$${course.price}` : "Free"}
              </div>
            )}
            <BookmarkButton
              isBookmarked={isBookmarked}
              loading={loading}
              onClick={handleBookmark}
              variant="course"
            />
          </div>
        </div>
      </div>

      {/* Full-width Button */}
      <div className="px-5 pb-5">
        <Button
          wide
          round
          className={cn(
            poppins_600,
            "w-full bg-accent text-sm text-white hover:bg-accent/90"
          )}
          to={`/dashboard/courses/${course._id}`}
        >
          {isCompleted ? "Review Course" : showProgress ? "Continue Learning" : "View Course"}
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
