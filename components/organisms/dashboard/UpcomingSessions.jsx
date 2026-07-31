"use client"
import { useState, useEffect } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/atoms/form/Button";
import { getSpaces } from "@/lib/actions/spaces/get-spaces";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

const UpcomingSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                const data = await getSpaces();
                if (!mounted) return;
                const upcoming = (data || []).filter(s => s.status === "upcoming");
                setSessions(upcoming);
            } catch {
                if (mounted) setSessions([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
            {loading ? (
                <ul className="space-y-2 text-sm">
                    {[1, 2, 3].map(i => (
                        <li key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-3 w-16" />
                        </li>
                    ))}
                </ul>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                    <Calendar className="h-8 w-8" />
                    <p className="text-sm">No upcoming sessions</p>
                </div>
            ) : (
                <ul className="space-y-2 text-sm">
                    {sessions.map(s => (
                        <li key={s._id} className="flex justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-10 w-10 rounded-lg shrink-0">
                                    <AvatarImage src={s.host?.avatar || "/images/img1.jpeg"} alt={s.host?.name || "Instructor"} />
                                    <AvatarFallback className="rounded-lg">{(s.host?.name || "IN").slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-stretch-125% font-medium text-md truncate">{s.title}</span>
                            </div>
                            <div className="flex flex-col items-end text-muted-foreground text-xs shrink-0">
                                <span>{s.eventDate ? format(new Date(s.eventDate), "MMM d") : ""}</span>
                                <span>{s.eventDate ? format(new Date(s.eventDate), "h:mm a") : ""}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <Button wide round className="mt-4 bg-accent text-white py-2 text-sm font-stretch-125%" to="/dashboard/spaces">View Upcomings</Button>
        </div>
    );
};

export default UpcomingSessions;
