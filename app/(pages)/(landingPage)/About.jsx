"use client";
import React from "react";
import Image from "next/image";
import Button from "@/components/atoms/form/Button";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_600 } from "@/lib/config/font.config";

const About = () => {
  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-surface backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Section - Text Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h2 className={cn(
                poppins_600,
                "text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-secondary via-highlight to-accent font-stretch-125%"
              )}>
                Where Deen Meets{" "}
                <span>Excellence</span>
              </h2>
            </div>

            <p className={cn(
              poppins_400,
              "text-xl leading-relaxed text-ink-muted max-w-2xl font-stretch-110%"
            )}>
              We are dedicated to connecting Muslims worldwide through
              meaningful conversations, authentic knowledge, and a supportive
              community. DeenBridge empowers users to learn, share, and grow in
              their faith by providing access to trusted resources, inspiring
              books, and opportunities to engage with others on their journey of
              Islamic excellence.
            </p>


            {/* CTA Button */}
            <div className="pt-4">
              <Button
                wide
                round
                to="/signup"
                className=" text-white font-semibold py-4 px-8 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Explore DeenBridge
              </Button>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/images/mosque.png"
                alt="Beautiful mosque architecture representing Islamic excellence"
                width={600}
                height={600}
                className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                priority
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-secondary/40 to-highlight/30 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-secondary/25 to-highlight/20 rounded-full opacity-40 blur-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
