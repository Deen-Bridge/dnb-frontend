"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import Navbar from "@/components/molecules/ladingpage/Navbar";

const Hero = () => {
    return (
        <main className=" relative h-screen flex flex-col bg-basic text-white overflow-hidden overscroll-none">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-slate-800 to-green-500 opacity-30 blur-2xl z-0" />
            <Navbar />
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-10 text-center">
                <h1
                    className={cn(
                        poppins_600,
                        "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-snug"
                    )}
                >
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text">
                        Deen Bridge
                    </span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 max-w-xl text-green-200">
                    Your journey to{" "}
                    <span className="text-white font-semibold">excellence</span>{" "}
                    starts here.
                </p>

                <Button
                    wide
                    round
                    to="/dashboard"
                    className="bg-accent hover:bg-highlight text-white px-10 py-3 animate-in-out transition-all"
                >
                  Lets Dive
                </Button>
            </div>
        </main>
    );
};

export default Hero;