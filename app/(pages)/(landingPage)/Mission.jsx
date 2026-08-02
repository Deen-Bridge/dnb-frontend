"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";
import { FaGlobe, FaBookOpen, FaUsers } from "react-icons/fa";

const missionPoints = [
  {
    icon: <FaGlobe className="w-8 h-8 text-accent" />,
    title: "Global Connection",
    description: "Uniting the Ummah across borders to foster meaningful relationships and mutual support."
  },
  {
    icon: <FaBookOpen className="w-8 h-8 text-highlight" />,
    title: "Authentic Knowledge",
    description: "Providing a platform for reliable Islamic education, resources, and scholarly guidance."
  },
  {
    icon: <FaUsers className="w-8 h-8 text-accent" />,
    title: "Supportive Community",
    description: "Creating safe spaces for Muslims to share, learn, and grow together in their faith journey."
  }
];

export default function Mission() {
  return (
    <section id="mission" className="relative py-24 px-4 sm:px-6 bg-gradient-to-b from-surface-raised to-surface overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <h2 className={cn(
          poppins_600,
          "text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-secondary via-highlight to-accent text-transparent bg-clip-text font-stretch-125%"
        )}>
          Our Mission
        </h2>
        <p className={cn(
          poppins_400,
          "text-xl text-ink-muted max-w-3xl mx-auto mb-16 leading-relaxed font-stretch-110%"
        )}>
          At DeenBridge, our goal is to empower Muslims globally by building a digital home 
          that seamlessly blends faith, learning, and authentic community connection.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {missionPoints.map((point, idx) => (
            <div 
              key={idx} 
              className="bg-surface-raised backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-accent/10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10 flex items-center justify-center mx-auto mb-6 shadow-sm border border-accent/5">
                {point.icon}
              </div>
              <h3 className={cn(poppins_600, "text-2xl font-bold text-ink mb-4 font-stretch-110%")}>{point.title}</h3>
              <p className={cn(poppins_400, "text-ink-muted leading-relaxed font-stretch-110%")}>{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
