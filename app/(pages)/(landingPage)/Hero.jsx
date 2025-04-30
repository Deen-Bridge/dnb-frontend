import React from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";

const Hero = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-[#0d2615] text-white">
            <h1
                className={cn(
                    poppins_600,
                    "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-snug"
                )}
            >
                Welcome to <span className="text-green-400">Deen Bridge</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 max-w-xl text-green-200">
                Your journey to <span className="text-white font-semibold">excellence</span> starts here.
            </p>

            <Button
                wide
                round
                className="bg-green-700 hover:bg-green-800 transition-all duration-300 text-base sm:text-lg px-6 py-3 shadow-md"
            >
                Sign Up
            </Button>
        </div>
    );
};

export default Hero;