"use client";
import React from "react";
import SpaceCard from "@/components/molecules/dashboard/cards/spaceCard";
import CourseCardSkeleton from "@/components/atoms/skeletons/CourseCardSkeleton";
const spaces = [
  {
    id: "space001",
    title: "Fiqh of Ramadan: Deep Dive",
    description: "Join us for a detailed session on fasting rules & rewards.",
    thumbnail: "/images/img-3.jpg",
    category: "Fiqh",
    status: "live",
    startTime: "2025-05-23T18:00:00Z",
    duration: 60,
    host: {
      name: "Ustadh Ali Mukhtar",
      image: "/images/img-2.jpeg",
    },
  },
  {
    id: "space002",
    title: "Understanding Zakat: Spiritual & Social Impact",
    description: "Explore how Zakat purifies wealth and supports communities.",
    thumbnail: "/images/img-3.jpg",
    category: "Fiqh",
    status: "upcoming",
    startTime: "2025-05-24T16:00:00Z",
    duration: 45,
    host: {
      name: "Ustadh Maryam Usman",
      image: "/images/img-3.jpg",
    },
  },
  {
    id: "space003",
    title: "Hadith Circle: Sahih Bukhari Selections",
    description: "Reflect on hadiths and their meanings in today's world.",
    thumbnail: "/images/mosque.png",
    category: "Hadith",
    status: "live",
    startTime: "2025-05-25T20:00:00Z",
    duration: 50,
    host: {
      name: "Ustadh Ahmad Bello",
      image: "/images/book1.jpg",
    },
  },
];

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
