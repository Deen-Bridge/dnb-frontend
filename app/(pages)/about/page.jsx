"use client";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";
import Navbar from "@/components/organisms/navbar/Navbar"; // Assuming there's a Navbar component
import Footer from "../(landingPage)/Footer"; // Using the landing page footer

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-basic flex flex-col">
      {/* <Navbar /> */} {/* Assuming Navbar is handled in a layout or imported, will just use standard padding top for now if no global nav is present in the layout */}
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-green-50 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className={cn(
              poppins_600,
              "text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text"
            )}>
              About DeenBridge
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-stretch-110%">
              We are a dedicated team striving to build the ultimate digital home for the Ummah. 
              Our vision is to bridge the gap between authentic Islamic knowledge and modern community connection.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="relative z-10">
                  <Image
                    src="/images/mosque.png"
                    alt="Our Story"
                    width={600}
                    height={600}
                    className="w-full h-auto object-cover rounded-3xl shadow-2xl"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-60 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full opacity-40 blur-lg"></div>
              </div>

              <div className="space-y-6">
                <h2 className={cn(poppins_600, "text-3xl sm:text-4xl font-bold text-gray-800")}>
                  Our Origin Story
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  DeenBridge was born out of a profound need for a safe, authentic, and engaging online space for Muslims. 
                  In an era filled with digital noise, we realized the importance of having a dedicated platform where 
                  faith takes precedence, and community bonds are strengthened through shared values.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We started with a simple idea: what if connecting with your local and global Muslim community was as 
                  seamless as using any modern social network, but firmly rooted in Islamic principles? Thus, DeenBridge 
                  was created.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 sm:px-6 bg-basic">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className={cn(poppins_600, "text-3xl sm:text-4xl font-bold text-gray-800 mb-12")}>
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Authenticity", desc: "Upholding the true teachings of Islam in everything we do and share." },
                { title: "Community", desc: "Fostering brotherhood and sisterhood across the globe." },
                { title: "Excellence (Ihsan)", desc: "Striving for perfection in our platform's design and user experience." }
              ].map((value, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-xl border border-accent/10">
                  <h3 className="text-xl font-bold text-accent mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
