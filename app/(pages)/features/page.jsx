"use client";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Footer from "../(landingPage)/Footer";
import { FaBookReader, FaCalendarAlt, FaUsers, FaComments } from "react-icons/fa";

const features = [
  {
    title: "Global Spaces & Communities",
    description: "Join dedicated spaces tailored to your interests, local community, or specific fields of study. Connect with like-minded individuals in a safe, moderated environment.",
    icon: <FaUsers className="w-6 h-6 text-white" />,
    image: "/images/img-9.jpeg", // Using existing placeholder images
    reverse: false
  },
  {
    title: "Curated Islamic Library",
    description: "Access a vast collection of authentic books, articles, and scholarly resources. Our library is meticulously curated to ensure you are learning from trusted sources.",
    icon: <FaBookReader className="w-6 h-6 text-white" />,
    image: "/images/img-10.jpg",
    reverse: true
  },
  {
    title: "Events & Meetups",
    description: "Discover virtual seminars, local study circles, and community meetups. RSVP, add to your calendar, and never miss an opportunity to learn and connect.",
    icon: <FaCalendarAlt className="w-6 h-6 text-white" />,
    image: "/images/img-11.jpg",
    reverse: false
  },
  {
    title: "Meaningful Discussions",
    description: "Engage in deep, respectful conversations about faith, life, and personal growth. Our platform is designed to promote Ihsan (excellence) in every interaction.",
    icon: <FaComments className="w-6 h-6 text-white" />,
    image: "/images/img-12.jpg",
    reverse: true
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 bg-gradient-to-b from-white to-green-50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-accent/5 to-highlight/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className={cn(
              poppins_600,
              "text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text"
            )}>
              Features that Connect
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-stretch-110%">
              Explore the tools we've built to help you learn authentically, connect globally, and grow spiritually.
            </p>
          </div>
        </section>

        {/* Features List */}
        <section className="py-12 px-4 sm:px-6 mb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-24">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex flex-col lg:flex-row items-center gap-12 lg:gap-20",
                  feature.reverse ? "lg:flex-row-reverse" : ""
                )}
              >
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-3xl transform rotate-3 scale-105 group-hover:rotate-6 transition-transform duration-500 z-0"></div>
                  <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white">
                    {/* Placeholder div if image fails to load, but we have some placeholder images */}
                    <div className="aspect-[4/3] relative bg-gray-100">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-lg">
                    {feature.icon}
                  </div>
                  <h2 className={cn(poppins_600, "text-3xl sm:text-4xl font-bold text-gray-800")}>
                    {feature.title}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
