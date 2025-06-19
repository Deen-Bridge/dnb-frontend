"use client"
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

const stats = [
    { label: "Courses Enrolled", value: 8 },
    { label: "Books Read", value: 5 },
    { label: "Upcoming Sessions", value: 2 },
    { label: "Messages Unread", value: 3 },
    { label: "Total Uptime", value: "3643hrs" }, // Non-numeric value
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
                    <p className="text-sm flex justify-start font-stretch-125% bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">{stat.label}</p>
                    <h3 className="text-2xl font-bold flex justify-start text-accent">
                        {inView && typeof stat.value === 'number' ? (
                            <CountUp end={stat.value} duration={2} />
                        ) : (
                            <span>{stat.value}</span> // Display non-numeric value directly
                        )}
                    </h3>
                </div>
            ))}
        </div>
    );
}
