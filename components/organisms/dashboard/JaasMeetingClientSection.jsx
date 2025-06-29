"use client";
import JaasMeetingComponent from "@/components/organisms/jitsi/JitsiMeeting";
import Button from "@/components/atoms/form/Button";
import useAuth from "@/hooks/useAuth";
import { Clock } from "lucide-react";
import { joinSpaceWaitlist } from "@/lib/actions/spaces/joinSpaceWaitlist";
import { useState } from "react";

export default function JaasMeetingClientButtons({ space, JitsiMeetRoomName }) {
    const { user } = useAuth();
    // Directly check if user is in waitlist
    const isInWaitlist = space?.waitlist?.includes(user?._id);
    const [joinedWaitlist, setJoinedWaitlist] = useState(isInWaitlist);

    const handleJoinWaitlist = async () => {
        await joinSpaceWaitlist(space._id);
        setJoinedWaitlist(true);
    };

    return (
        <div className="flex flex-wrap gap-4">
            {space?.host?._id === user?._id ? (
                <JaasMeetingComponent JitsiMeetRoomName={JitsiMeetRoomName} />
            ) : (
                <Button
                    wide
                    className="bg-accent hover:bg-highlight text-white font-bold shadow-lg transition"
                    round
                    to="_blank"
                >
                    Join Space
                </Button>
            )}

            {!joinedWaitlist ? (
                <Button
                    outlined
                    round
                    onClick={handleJoinWaitlist}
                >
                    <Clock className="w-5 h-5 mr-2" /> Join Waitlist
                </Button>
            ) : (
                <Button outlined round disabled>
                    <Clock className="w-5 h-5 mr-2" /> Joined Waitlist
                </Button>
            )}
        </div>
    );
}