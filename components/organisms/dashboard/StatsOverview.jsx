"use client"
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { DollarSign } from "lucide-react"
import { Book } from 'lucide-react';
import { TimerIcon } from 'lucide-react';
import { AudioWaveform } from 'lucide-react';

const stats = [
    { label: "Courses Enrolled", icon: <DollarSign className="h-4 w-4 text-accent" />, value: 8 },
    { label: "Books Read", icon: <Book className="h-4 w-4 text-accent" />, value: 5 },
    { label: "Upcoming Sessions", icon: <AudioWaveform className="h-4 w-4 text-accent" />, value: 2 },
    { label: "Messages Unread", value: 3 },
    { label: "Total Uptime", icon: <TimerIcon className="h-4 w-4 text-accent" />, value: "3643" }, // Non-numeric value
];

export default function StatsOverview() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    return (
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-5 gap-4 text-nowrap">
            {stats.map((stat, i) => (
                <div key={i} className="rounded-xl p-2 sm:p-4 space-y-4 text-center shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
                    <div className='flex justify-between items-center'>
                        <p className="text-sm flex justify-start font-stretch-125% bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">{stat.label}</p>

                    <span>{stat?.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold flex justify-start text-accent">
                        {inView && typeof stat.value === 'number' ? (
                            <CountUp end={stat.value} duration={2} />
                        ) : (
                            <span>{stat.value}<span className='text-base p-0 m-0'>hrs</span></span> // Display non-numeric value directly
                        )}
                    </h3>
                </div>
            ))}
        </div>
    );
} 




