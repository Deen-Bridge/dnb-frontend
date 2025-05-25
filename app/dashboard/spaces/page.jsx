"use client";
import React from "react";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
import { spaces } from "@/lib/data";

const Page = () => {
    const loading = false;
  return (
    <div className="bg-muted min-h-screen pt-10 px-4">
      <h1 className="text-2xl sm:text-3xl font-accent font-bold text-center mb-6">
        Interactive Learning Spaces
      </h1>

                <div className="flex flex-1 flex-col gap-4 mt-10 p-4 pt-0">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
                        {loading ? (
                            [...Array(6)].map((_, idx) => <CourseCardSkeleton key={idx} />)
                        ) : (
                            spaces.map((space, index) => (
                                <SpaceCard key={space.id || index} space={space} />
                            ))
                        )}
                    </div>
                </div>
    </div>
  );
};

export default Page;
