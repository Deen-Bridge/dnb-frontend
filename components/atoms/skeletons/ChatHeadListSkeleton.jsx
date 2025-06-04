import { Fragment } from "react";

export const ChatHeadListSkeleton = () => {
    const chatHeadSkeletons = Array.from(Array(2).keys());

    return (
        <div className="chat-head-list-skeleton">
            {chatHeadSkeletons.map((index) => (
                <Fragment key={index}>
                    <div className="mt-4 min-h-[80px] border-wmt-dash-line-gray border-b-2 p-4 animate-pulse w-full">
                        <div className="flex gap-4 items-center">
                            {/* Shimmer loader for the avatar */}
                            <div className="h-12 w-12 bg-gray-300 rounded-full" />
                            <div className="w-full">
                                {/* Shimmer loader for the name */}
                                <div className="h-4 bg-gray-300 w-2/3 rounded" />
                                {/* Shimmer loader for the timestamp */}
                                <div className="h-3 bg-gray-300 w-1/3 mt-1 rounded" />
                            </div>
                        </div>
                        <div className="mt-2">
                            {/* Shimmer loader for the last message */}
                            <div className="h-4 bg-gray-300 w-4/5 rounded" />
                        </div>
                    </div>
                </Fragment>
            ))}
        </div>
    );
};
