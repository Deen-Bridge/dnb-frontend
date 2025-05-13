import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CourseCardSkeleton = () => {
    return (
        <Card className="relative flex flex-col overflow-hidden w-[550px] rounded-2xl bg-muted/30 backdrop-blur-xl shadow-lg animate-pulse transition-all group">
            {/* Image */}
            <div className="relative h-60 w-[250px] bg-muted/40">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20">
                    <Skeleton className="h-6 w-[250px] rounded-full" />
                </div>
            </div>

            {/* Header */}
            <CardHeader className="px-5 pt-6 pb-3">
                <CardTitle className="mb-2">
                    <Skeleton className="h-5 w-[250px] rounded-md" />
                </CardTitle>
                <Skeleton className="h-4 w-[250px] rounded-md mb-1" />
                <Skeleton className="h-4 w-[250px]rounded-md" />
            </CardHeader>

            {/* Instructor */}
            <CardContent className="px-5 pt-0 pb-6">
                <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-[250px] rounded" />
                            <Skeleton className="h-4 w-[250px] rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </CardContent>

            {/* Button */}
            <div className="px-5 pb-5">
                <Skeleton className="h-10 w-full rounded-full" />
            </div>
        </Card>
    );
};

export default CourseCardSkeleton;
  