"use client"
import { useState } from "react";
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { Book, MessageCircle, Calendar, TimerIcon, Blocks } from "lucide-react"
import useStats from "@/hooks/useStats";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/atoms/form/Button";

const statConfig = [
    { label: "Courses Enrolled", icon: Blocks, key: "coursesEnrolled", suffix: "" },
    { label: "Books Read", icon: Book, key: "booksRead", suffix: "" },
    { label: "Upcoming Sessions", icon: Calendar, key: "upcomingSessions", suffix: "" },
    { label: "Messages Unread", icon: MessageCircle, key: "messagesUnread", suffix: "" },
    { label: "Total Uptime", icon: TimerIcon, key: "totalUptime", suffix: "hrs" },
];

function StatTile({ stat, value, inView }) {
    const Icon = stat.icon;
    return (
        <div className="rounded-xl p-2 sm:p-4 space-y-4 text-center shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
            <div className='flex justify-between items-center'>
                <p className="text-sm flex justify-start font-stretch-125% bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">{stat.label}</p>
                <span><Icon className="h-4 w-4 text-accent" /></span>
            </div>
            <h3 className="text-2xl font-bold flex justify-start text-accent">
                {inView && typeof value === 'number' && !stat.suffix ? (
                    <CountUp end={value} duration={2} />
                ) : (
                    <span>{value}{stat.suffix ? <span className='text-base p-0 m-0'>{stat.suffix}</span> : ''}</span>
                )}
            </h3>
        </div>
    );
}

function SkeletonTile() {
    return (
        <div className="rounded-xl p-2 sm:p-4 space-y-4 text-center shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
            <div className='flex justify-between items-center'>
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="flex justify-start">
                <Skeleton className="h-8 w-16 rounded" />
            </div>
        </div>
    );
}

export default function StatsOverview() {
    const { coursesEnrolled, booksRead, upcomingSessions, messagesUnread, totalUptime, loading, error } = useStats();
    const [retryKey, setRetryKey] = useState(0);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    if (loading) {
        return (
            <div ref={ref} className="grid grid-cols-2 md:grid-cols-5 gap-4 text-nowrap">
                {statConfig.map((_, i) => <SkeletonTile key={i} />)}
            </div>
        );
    }

    if (error) {
        return (
            <div ref={ref} className="rounded-xl p-6 text-center shadow-sm bg-gradient-to-br from-red-50 via-white to-red-100/80 backdrop-blur-xl">
                <p className="text-sm text-red-600 mb-3">Failed to load stats. Please try again.</p>
                <Button round className="bg-accent text-white text-sm" onClick={() => setRetryKey(k => k + 1)}>
                    Retry
                </Button>
            </div>
        );
    }

    const values = { coursesEnrolled, booksRead, upcomingSessions, messagesUnread, totalUptime };

    return (
        <div key={retryKey} ref={ref} className="grid grid-cols-2 md:grid-cols-5 gap-4 text-nowrap">
            {statConfig.map((stat, i) => (
                <StatTile key={i} stat={stat} value={values[stat.key]} inView={inView} />
            ))}
        </div>
    );
}
