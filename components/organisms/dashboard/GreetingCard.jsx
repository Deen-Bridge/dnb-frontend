"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import Button from "@/components/atoms/form/Button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";

const GreetingCard = () => {
    const { user } = useAuth();

    return (
        <div className="bg-accent text-white rounded-2xl px-4 py-5 md:px-6 md:py-6 lg:p-8 flex items-center justify-between gap-4 md:gap-8 w-full shadow-md">

            {/* Avatar */}
            <Avatar className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-lg shrink-0">
                <AvatarImage src={user?.image || "/images/man.jpg"} alt="user" className="object-cover" />
                <AvatarFallback className="rounded-lg uppercase">
                    {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
            </Avatar>

            {/* Text and Button Group */}
            <div className="flex flex-1 flex-col gap-3 md:gap-4">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-snug">
                    Assalamu ʿalaikum   <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text">{user?.name}</span>
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    {/* Progress */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-bold text-white/90">
                        <Sparkles className="h-7 w-7 text-white animate-pulse" />
                        <span>70% profile completed</span>
                    </div>

                    {/* Button */}
                    <Button
                        round
                        className="bg-highlight text-xs md:text-sm font-medium hover:bg-highlight/90 w-full sm:w-auto"
                        to="/profile"
                    >
                        Complete Profile
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GreetingCard;
