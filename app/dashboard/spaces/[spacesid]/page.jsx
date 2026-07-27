import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DownloadCloud, Eye, Star, UserRound, BarChart3 } from "lucide-react";
import { getSpaceById } from "@/lib/actions/spaces/doGetSpacesById";
import JaasMeetingClientButtons from "@/components/organisms/dashboard/JaasMeetingClientSection";
import { joinSpaceWaitlist } from "@/lib/actions/spaces/joinSpaceWaitlist";

export default async function Page({ params }) {
    const { spacesid } = params;
    let space = null;
    try {
        space = await getSpaceById(spacesid);
    } catch (err) {
        console.log("Error fetching space:", err);
        return notFound();
    }
    if (!space) return notFound();

    return (
        <div className="min-h-screen py-12 px-4 md:px-12">
            <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
                {/* space Showcase */}
                <div className="md:col-span-8 space-y-12">
                    <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md bg-white/5">
                        <Image
                            src={space.thumbnail || "/images/placeholder.jpg"}
                            alt={space.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tight">{space.title}</h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-accent ">{space.category}</Badge>
                            <Badge variant="accent" className="bg-white/10 text-highlight">
                                {space.price ? `$${space.price}` : "Free"}
                            </Badge>
                            <Badge variant="accent" className="bg-white/10 text-highlight">
                                {space.status.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-md /80 leading-relaxed">{space.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <JaasMeetingClientButtons space={space} JitsiMeetRoomName={space.title} />
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="md:col-span-4 space-y-8 sticky top-20 self-start">

                    {/* Host Card */}
                    <div className="flex items-center gap-4 mt-10 bg-accent/10 p-4 rounded-2xl shadow">
                        <Avatar className="h-14 w-14 border border-white/10 shadow-lg">
                            <AvatarImage src={space.host?.avatar || "/images/avatar-placeholder.png"} />
                            <AvatarFallback>{space.host?.name?.slice(0, 2).toUpperCase() || "HN"}</AvatarFallback>
                        </Avatar>
                        <div className="text-accent ">
                            <p className="font-bold ">{space.host?.name || "Host"}</p>
                            <p className="text-sm ">Host & Facilitator</p>
                        </div>
                    </div>

                    {/* space Stats */}
                    <div className="bg-accent/10 p-6 rounded-3xl  border border-white/10 shadow  space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2 ">
                            <BarChart3 className="w-5 h-5" />
                            Space Stats
                        </h3>

                        <StatRow icon={<Eye className="w-4 h-4" />} label="Monthly Reads" value={space.monthlyReads} />
                        <StatRow
                            icon={<DownloadCloud className="w-4 h-4 " />}
                            label="Downloads"
                            value={space.downloads}
                        />
                        <StatRow
                            icon={<Star className="w-4 h-4 text-yellow-400" />}
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
        <div className="flex justify-between items-center text-sm font-medium text-accent">
            <div className="flex items-center gap-2">{icon} {label}</div>
            <span className="font-bold">{value}</span>
        </div>
    );
}
