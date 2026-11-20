import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ChatHeadListSkeleton = ({ rows = 2 }) => {
    const chatHeadSkeletons = Array.from(Array(rows).keys());

    return (
        <div className="chat-head-list-skeleton">
            {chatHeadSkeletons.map((index) => (
                <Fragment key={index}>
                    <div className="mt-4 min-h-[80px] border-wmt-dash-line-gray border-b-2 p-4 w-full">
                        <div className="flex gap-4 items-center">
                            {/* Shimmer loader for the avatar */}
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="w-full">
                                {/* Shimmer loader for the name */}
                                <Skeleton className="h-4 w-2/3 rounded" />
                                {/* Shimmer loader for the timestamp */}
                                <Skeleton className="h-3 w-1/3 mt-1 rounded" />
                            </div>
                        </div>
                        <div className="mt-2">
                            {/* Shimmer loader for the last message */}
                            <Skeleton className="h-4 w-4/5 rounded" />
                        </div>
                    </div>
                </Fragment>
            ))}
        </div>
    );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    const rowSkeletons = Array.from(Array(rows).keys());
    const columnSkeletons = Array.from(Array(columns).keys());

    return (
        <div className="w-full motion-reduce:animate-none" role="status" aria-label="Loading table data">
            <div className="flex items-center gap-4 border-b-2 border-wmt-dash-line-gray p-4">
                {columnSkeletons.map((col) => (
                    <Skeleton key={col} className="h-4 flex-1 rounded" />
                ))}
            </div>
            {rowSkeletons.map((row) => (
                <div
                    key={row}
                    className={cn("flex items-center gap-4 border-b-2 border-wmt-dash-line-gray p-4")}
                >
                    {columnSkeletons.map((col) => (
                        <Skeleton key={col} className="h-4 flex-1 rounded" />
                    ))}
                </div>
            ))}
        </div>
    );
};
