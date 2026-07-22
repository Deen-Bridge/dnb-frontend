"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import Navbar from "@/components/molecules/ladingpage/Navbar";
import { useTranslations } from "next-intl";

const Hero = () => {
    const t = useTranslations("landing.hero");
    return (
        <main className="relative h-screen flex flex-col bg-basic text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-slate-800 to-green-500 opacity-30 blur-2xl z-0" />
            <Navbar />
           <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-10 text-center sm:font-stretch-125%">
                <h1
                    className={cn(
                        poppins_600,
                        "text-6xl lg:text-8xl font-bold mb-4 leading-snug"
                    )}
                >
                    {t.rich("title", { brand: (chunks) => <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text">{chunks}</span> })}
                </h1>

                <p className="text-lg md:text-xl lg:text-3xl mb-6 text-green-200">
                    {t.rich("subtitle", { emphasis: (chunks) => <span className="text-white font-semibold">{chunks}</span> })}
                </p>
                <Button
                    wide
                    round
                    to="/dashboard"
                    className=" text-white px-10 py-3 animate-in-out transition-all"
                >
                    {t("cta")}
                </Button>
            </div>
        </main>
    );
};

export default Hero;
