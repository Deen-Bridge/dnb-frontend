"use client";

import Image from "next/image";
import { partners } from "@/lib/data";

export default function Partners() {
  return (
    <section className="w-full py-16 px-4 sm:px-8 bg-white dark:bg-basic text-basic dark:text-white flex flex-col items-center overflow-hidden">
      <h2 className="text-4xl sm:text-8xl font-bold mb-5 text-center">
        Our Partners
      </h2>
      <p className="text-xl mb-20 text-center max-w-2xl">
        We're proud to collaborate with Islamic organizations and communities
        that share our vision for growth and learning.
      </p>

      <div className="w-full max-w-6xl">
        <div className="flex animate-scroll">
          {/* First set of logos */}
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.target.src = "/images/dnb.png"; // Fallback image
                }}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {partners.map((partner) => (
            <div
              key={`${partner.name}-duplicate`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  e.target.src = "/images/dnb.png"; // Fallback image
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
