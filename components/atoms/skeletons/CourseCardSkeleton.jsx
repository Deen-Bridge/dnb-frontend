import { Skeleton } from "@/components/ui/skeleton";

export default function CourseCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-4 rounded-2xl shadow-md bg-gradient-to-br from-green-50 via-white to-green-100 animate-pulse w-full h-full min-h-[260px] max-w-md mx-auto">
            {/* Image skeleton with shimmer */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Skeleton className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary via-highlight to-secondary animate-gradient-x" />
            </div>
            {/* Title skeleton */}
            <Skeleton className="h-5 w-3/4 rounded bg-secondary" />
            {/* Subtitle skeleton */}
            <Skeleton className="h-4 w-1/2 rounded bg-highlight" />
            {/* Chips/Tags skeleton */}
            <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-16 rounded-full bg-highlight" />
                <Skeleton className="h-6 w-12 rounded-full bg-highlight" />
            </div>
            {/* Button skeleton */}
            <div className="flex justify-end mt-auto w-full">
                <Skeleton className="h-8 rounded-lg bg-secondary w-full" />
            </div>
        </div>
    );
}
