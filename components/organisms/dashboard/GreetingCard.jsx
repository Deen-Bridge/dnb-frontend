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
import { cn } from "@/lib/utils";
import { poppins_600, poppins_700 } from "@/lib/config/font.config";
const GreetingCard = () => {
    const { user } = useAuth();

    // Extract the user's last name (last word)
    const getLastName = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    };
    return (
        <div className="bg-accent text-white rounded-2xl px-4 py-5 md:px-6 md:py-6 lg:p-8 flex items-center justify-between gap-4 md:gap-8 w-full shadow-md">
            {/* Avatar */}
            <Avatar className="hidden sm:block md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-lg shrink-0">
                <AvatarImage src={user?.image || "/images/man.jpg"} alt="user" className="object-cover" />
                <AvatarFallback className="rounded-lg uppercase">
                    {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
            </Avatar>

            {/* Text and Button Group */}
            <div className="flex flex-1 flex-col gap-3 md:gap-4">
                <h2 className={cn("text-xl md:text-2xl lg:text-4xl font-bold leading-snug", poppins_700.className)}>
                    Assalamu ʿalaikum
                    <span className={cn("bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text font-semibold pl-2", poppins_600.className)}>{getLastName(user?.name)}</span>
                </h2>
                <span className="text-sm sm:text-base md:text-lg font-light text-slate-200">Statting your day with the Quran feels your day with enjoyment and peace</span>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    {/* Progress */}
                    <div className="w-full max-w-lg flex justify-center items-center text-nowrap gap-4">
                        <div className="flex items-center gap-2 text-sm md:text-base font-bold text-white/90 mb-1">
                            <Sparkles className="h-6 w-6 text-white" />
                            <span>70% profile completed</span>
                        </div>
                        {/* Progress bar container */}
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-white/70 h-full rounded-full transition-all duration-500"
                                style={{ width: "70%" }}
                            />
                        </div>
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
