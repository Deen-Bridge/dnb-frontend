"use client";

import { useReducedMotion } from "framer-motion";
import { partners } from "@/lib/data";

function initials(name) {
  const words = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function PartnerPill({ partner, index }) {
  return (
    <div
      key={`${partner.name}-${index}`}
      className="flex items-center gap-3 shrink-0 rounded-full border border-green-900/10 dark:border-white/10 bg-green-50/60 dark:bg-white/5 px-5 py-3 opacity-80 hover:opacity-100 transition-all duration-300"
      title={partner.name}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 text-white text-sm font-bold">
        {initials(partner.name)}
      </span>
      <span className="text-sm sm:text-base font-medium whitespace-nowrap">
        {partner.name}
      </span>
    </div>
  );
}

export default function Partners() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="partners-heading"
      className="w-full py-16 px-4 sm:px-8 bg-white dark:bg-basic text-basic dark:text-white flex flex-col items-center overflow-hidden"
    >
      <h2
        id="partners-heading"
        className="text-4xl sm:text-7xl font-bold mb-5 text-center"
      >
        Trusted Voices in the Ummah
      </h2>
      <p className="text-xl mb-16 text-center max-w-2xl">
        We draw inspiration from the Islamic organizations and institutions
        leading the way in education, community, and service worldwide.
      </p>

      {/* Reduced-motion: static wrapping grid */}
      {shouldReduceMotion ? (
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl">
          {partners.map((partner, index) => (
            <PartnerPill key={partner.name} partner={partner} index={index} />
          ))}
        </div>
      ) : (
        /* Auto-scrolling marquee */
        <div className="relative w-full overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-white dark:from-basic to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-white dark:from-basic to-transparent"
          />

          <div className="flex w-max animate-scroll hover:[animation-play-state:paused] items-center gap-4 sm:gap-6 py-2">
            {[...partners, ...partners].map((partner, index) => (
              <PartnerPill key={`${partner.name}-${index}`} partner={partner} index={index} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
