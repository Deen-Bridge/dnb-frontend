import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DownloadCloud, Eye, Star, BarChart3 } from "lucide-react";
import { getSpaceById } from "@/lib/actions/spaces/doGetSpacesById";
import JaasMeetingClientButtons from "@/components/organisms/dashboard/JaasMeetingClientSection";
import { joinSpaceWaitlist } from "@/lib/actions/spaces/joinSpaceWaitlist";
import { cn } from "@/lib/utils";
import {
    poppins_400,
    poppins_500,
    poppins_600,
} from "@/lib/config/font.config";

export default async function Page({ params }) {
    const { spacesid } = await params;
    let space = null;
    try {
        space = await getSpaceById(spacesid);
    } catch (err) {
        console.log("Error fetching space:", err);
        return notFound();
    }
    if (!space) return notFound();

    return (
        <div className="min-h-screen bg-surface py-12 px-4 md:px-12">
            <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
                {/* space Showcase */}
                <div className="md:col-span-8 space-y-12">
                    <div className="relative h-[500px] rounded-2xl overflow-hidden border border-accent/10 bg-surface-raised shadow-sm">
                        <Image
                            src={space.thumbnail || "/images/placeholder.jpg"}
                            alt={space.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-4">
                        <h1
                            className={cn(
                                poppins_600,
                                "text-4xl sm:text-5xl tracking-tight text-ink"
                            )}
                        >
                            {space.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={cn(
                                    poppins_500,
                                    "inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs capitalize text-white"
                                )}
                            >
                                {space.category}
                            </span>
                            <span
                                className={cn(
                                    poppins_500,
                                    "inline-flex items-center rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs text-secondary"
                                )}
                            >
                                {space.price ? `$${space.price}` : "Free"}
                            </span>
                            <span
                                className={cn(
                                    poppins_500,
                                    "inline-flex items-center rounded-full border border-accent/15 bg-surface-raised px-3 py-1 text-xs text-accent"
                                )}
                            >
                                {space.status.toUpperCase()}
                            </span>
                        </div>
                        <p
                            className={cn(
                                poppins_400,
                                "text-base leading-relaxed text-ink-muted"
                            )}
                        >
                            {space.description}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <JaasMeetingClientButtons space={space} JitsiMeetRoomName={space.title} />
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="md:col-span-4 space-y-8 sticky top-20 self-start">

                    {/* Host Card */}
                    <div className="flex items-center gap-4 mt-10 rounded-2xl border border-accent/10 bg-surface-raised p-4 shadow-sm">
                        <Avatar className="h-14 w-14 border border-accent/10 shadow-sm">
                            <AvatarImage src={space.host?.avatar || "/images/avatar-placeholder.png"} alt="" />
                            <AvatarFallback>{space.host?.name?.slice(0, 2).toUpperCase() || "HN"}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className={cn(poppins_600, "text-ink")}>
                                {space.host?.name || "Host"}
                            </p>
                            <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                                Host & Facilitator
                            </p>
                        </div>
                    </div>

                    {/* space Stats */}
                    <div className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm space-y-4">
                        <h3
                            className={cn(
                                poppins_600,
                                "flex items-center gap-2 text-lg text-ink"
                            )}
                        >
                            <div className="flex size-10 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                                <BarChart3 className="h-5 w-5 text-accent" />
                            </div>
                            Space Stats
                        </h3>

                        <StatRow icon={<Eye className="w-4 h-4 text-accent" />} label="Monthly Reads" value={space.monthlyReads} />
                        <StatRow
                            icon={<DownloadCloud className="w-4 h-4 text-accent" />}
                            label="Downloads"
                            value={space.downloads}
                        />
                        <StatRow
                            icon={<Star className="w-4 h-4 text-amber-600" />}
                            label="Rating"
                            value={`${space.rating || 0} / 5`}
                        />
                    </div>
                </aside>
            </div>
        </div>
    );
}

function StatRow({ icon, label, value }) {
    return (
        <div
            className={cn(
                poppins_500,
                "flex justify-between items-center rounded-xl border border-accent/10 bg-surface px-3 py-2.5 text-sm text-ink-muted"
            )}
        >
            <div className="flex items-center gap-2">{icon} {label}</div>
            <span className={cn(poppins_600, "text-ink")}>{value}</span>
        </div>
    );
}
