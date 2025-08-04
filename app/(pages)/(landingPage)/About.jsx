"use client";
import React from "react";
import Image from "next/image";
import Button from "@/components/atoms/form/Button";

const About = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-green-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Section - Text Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                Where Deen Meets{" "}
                <span className="text-secondary">Excellence</span>
              </h2>
            </div>

            <p className="text-lg leading-relaxed text-gray-700 max-w-2xl">
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
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-60 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full opacity-40 blur-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
