import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SearchCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md border-0 w-full animate-pulse h-full min-h-[320px]">
      {/* Image Skeleton */}
      <div className="relative h-44 w-full">
        <Skeleton className="absolute inset-0 w-full h-full bg-gradient-to-r from-secondary via-highlight to-secondary animate-gradient-x" />
      </div>
      
      {/* Title Skeleton */}
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 rounded bg-secondary" />
      </CardHeader>
      
      {/* Content Skeleton */}
      <CardContent>
        {/* Description lines */}
        <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full rounded bg-highlight" />
            <Skeleton className="h-4 w-5/6 rounded bg-highlight" />
        </div>
        
        {/* Chips/Tags Skeleton */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
            <Skeleton className="h-6 w-16 rounded-full bg-secondary" />
            <Skeleton className="h-6 w-20 rounded-full bg-secondary" />
        </div>
        
        {/* Button Skeleton */}
        <div className="mt-auto pt-2">
            <Skeleton className="h-9 w-full rounded-full bg-accent/30" />
        </div>
      </CardContent>
    </Card>
  );
}
