import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryBookSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-md w-full max-w-md mx-auto animate-pulse">
            {/* Image skeleton */}
            <div className="relative w-full h-64">
                <Skeleton className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary via-highlight to-secondary animate-gradient-x" />
                <div className="absolute bottom-0 left-0 w-full px-4 py-3 space-y-1">
                    <Skeleton className="h-5 w-1/2 rounded bg-white/30" />
                    <div className="flex justify-between items-center text-xs">
                        <Skeleton className="h-4 w-20 rounded bg-white/20" />
                        <Skeleton className="h-4 w-12 rounded bg-white/20" />
                    </div>
                </div>
            </div>
            {/* Author, Reads, Rating */}
            <div className="px-4 py-4 flex flex-col gap-3 text-sm">
                {/* Author */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex flex-col pt-2 gap-1">
                        <Skeleton className="h-4 w-24 rounded bg-secondary" />
                        <Skeleton className="h-3 w-16 rounded bg-secondary" />
                    </div>
                </div>
                {/* Reads & Rating */}
                <div className="flex justify-between items-center text-xs">
                    <Skeleton className="h-4 w-16 rounded bg-secondary" />
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-4 rounded-full bg-yellow-100" />
                        ))}
                        <Skeleton className="h-4 w-8 rounded bg-secondary ml-1" />
                    </div>
                </div>
            </div>
            {/* Button */}
            <div className="px-4 py-3">
                <Skeleton className="h-9 w-full rounded-lg bg-accent/30" />
            </div>
        </div>
    );
}