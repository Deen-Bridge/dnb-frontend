"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";

const Hero = () => {
    return (
        <div className="flex flex-col items-center space-y-10 justify-center min-h-screen text-center bg-basic text-white">
            <h
                className={cn(
                    poppins_600,
                    "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-snug "
                )}
            >
                Welcome to <span className=" bg-gradient-to-r from-green-400  via-green-500 to-green-600 text-transparent bg-clip-text">Deen Bridge</span>
            </h>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 max-w-xl text-green-200">
                Your journey to <span className="text-white font-semibold">excellence</span> starts here.
            </p>

            <Button
                round
                outlined
                className="bg-green-500 hover:bg-green-600 text-white px-10 py-3"
            >
                Sign Up
            </Button>
        </div>
    );
};

export default Hero;