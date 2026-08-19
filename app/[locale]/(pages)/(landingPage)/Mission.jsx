"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";
import { FaGlobe, FaBookOpen, FaUsers } from "react-icons/fa";

const missionPoints = [
  {
    id: "globalConnection",
    icon: <FaGlobe className="w-8 h-8 text-accent" />
  },
  {
    id: "authenticKnowledge",
    icon: <FaBookOpen className="w-8 h-8 text-highlight" />
  },
  {
    id: "supportiveCommunity",
    icon: <FaUsers className="w-8 h-8 text-accent" />
  }
];

export default function Mission() {
  const t = useTranslations("landing.mission");

  return (
    <section id="mission" className="relative py-24 px-4 sm:px-6 bg-gradient-to-b from-surface-raised to-surface overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 end-0 w-1/3 h-1/3 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 start-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h2 className={cn(
          poppins_600,
          "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-highlight to-accent text-transparent bg-clip-text font-stretch-125%"
        )}>
          {t("title")}
        </h2>
        <p className={cn(
          poppins_400,
          "text-xl text-ink-muted max-w-3xl mx-auto mb-16 leading-relaxed font-stretch-110%"
        )}>
          {t("intro")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {missionPoints.map((point) => (
            <div
              key={point.id}
              className="bg-surface-raised backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-accent/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10 flex items-center justify-center mx-auto mb-6 shadow-sm border border-accent/5">
                {point.icon}
              </div>
              <h3 className={cn(poppins_600, "text-2xl font-bold text-ink mb-4 font-stretch-110%")}>{t(`points.${point.id}.title`)}</h3>
              <p className={cn(poppins_400, "text-ink-muted leading-relaxed font-stretch-110%")}>{t(`points.${point.id}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
