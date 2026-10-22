"use client";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { poppins_600 } from "@/lib/config/font.config";

// Testimonials stay hidden until we have real, attributable quotes with consent.
const testimonials = [];

export default function Testimonials() {
  const t = useTranslations("landing.testimonials");
  if (testimonials.length === 0) return null;

  return (
    <section className="relative py-20 px-2 sm:px-6 bg-basic overflow-hidden">
      {/* Decorative Islamic motif background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute start-0 top-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute end-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-tr from-highlight/10 to-transparent rounded-full blur-2xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2
          className={cn(
            poppins_600,
            "text-3xl sm:text-5xl lg:text-7xl font-bold text-center pb-8 sm:pb-12 bg-gradient-to-r from-secondary via-highlight to-accent text-transparent bg-clip-text font-stretch-125%"
          )}
        >
          {t("title")}
        </h2>

        {/* Marquee Container */}
        <div className="space-y-6">
          {/* First Row - Moving Left to Right */}
          <div className="overflow-hidden">
            <div className="flex animate-marquee-reverse">
              {row1Duplicated.map((item, i) => (
                <div
                  key={`row1-${i}`}
                  className="flex-shrink-0 w-[260px] sm:w-[320px] lg:w-[350px] mx-2 sm:mx-4 rounded-3xl bg-surface-raised backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all p-5 sm:p-7 lg:p-8 flex flex-col border-0 border-accent/10"
                >
                  <blockquote className="italic text-sm sm:text-base lg:text-lg text-ink-muted mb-3 sm:mb-4 font-stretch-110% flex-1">
                    "{t(`items.${item.id}.quote`)}"
                  </blockquote>
                  <div className="flex items-center gap-4">

                    <div>
                      <span className="block font-bold text-accent text-base sm:text-lg">
                        {t(`items.${item.id}.name`)}
                      </span>
                      <span className="block text-xs sm:text-sm text-ink-muted/80">
                        {t(`items.${item.id}.role`)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Moving Right to Left */}
          <div className="overflow-hidden">
            <div className="flex animate-marquee">
              {row2Duplicated.map((item, i) => (
                <div
                  key={`row2-${i}`}
                  className="flex-shrink-0 w-[260px] sm:w-[320px] lg:w-[350px] mx-2 sm:mx-4 rounded-3xl bg-surface-raised backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all p-5 sm:p-7 lg:p-8 flex flex-col border-0 border-accent/10"
                >
                  <blockquote className="italic text-sm sm:text-base lg:text-lg text-ink-muted mb-3 sm:mb-4 font-stretch-110% flex-1">
                    "{t(`items.${item.id}.quote`)}"
                  </blockquote>
                  <div className="flex items-center gap-4">

                    <div>
                      <span className="block font-bold text-accent text-base sm:text-lg">
                        {t(`items.${item.id}.name`)}
                      </span>
                      <span className="block text-xs sm:text-sm text-ink-muted/80">
                        {t(`items.${item.id}.role`)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
