"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";

// The tradition our educators actually teach from. Deliberately not a partner
// or endorsement list — every claim here is one we can stand behind. The
// oversized `ar` script is decorative and identical across locales, so it stays
// in the static array; the translatable title/desc live in the message catalog.
const sources = [
  { id: "quran", ar: "القرآن" },
  { id: "hadith", ar: "الحديث" },
  { id: "fiqh", ar: "الفقه" },
  { id: "aqeedah", ar: "العقيدة" },
  { id: "seerah", ar: "السيرة" },
  { id: "tazkiyah", ar: "التزكية" },
];

export default function Sources() {
  const t = useTranslations("landing.sources");

  return (
    <section className="relative w-full overflow-hidden bg-surface py-20 sm:py-28 px-4 sm:px-6">
      {/* Geometric motif — a dot lattice plus crossed diagonals, drawn in the
          brand green so the section has texture without any imagery. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_center,rgba(38,89,2,0.10)_1.5px,transparent_1.5px)]"
          style={{ backgroundSize: "28px 28px" }}
        />
        <div
          className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,rgba(0,153,0,0.06)_0_1px,transparent_1px_28px),repeating-linear-gradient(-45deg,rgba(0,153,0,0.06)_0_1px,transparent_1px_28px)]"
        />
        <div className="absolute start-1/2 top-0 h-1/2 w-2/3 -translate-x-1/2 rounded-full bg-gradient-to-b from-secondary/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span
            className={cn(
              poppins_500,
              "mb-4 inline-flex items-center rounded-full border border-accent/20 bg-secondary/10 px-4 py-1.5 text-sm text-accent"
            )}
          >
            {t("badge")}
          </span>

          <h2
            className={cn(
              poppins_600,
              "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl font-stretch-125%"
            )}
          >
            {t("title")}
          </h2>

          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl font-stretch-110%"
            )}
          >
            {t("description")}
          </p>
        </motion.div>

        {/* Source cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-accent/10 bg-surface-raised p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
            >
              {/* Oversized Arabic sits behind the copy and lifts on hover */}
              <span
                lang="ar"
                dir="rtl"
                aria-hidden="true"
                className="pointer-events-none absolute -end-2 -top-4 select-none text-7xl leading-none text-accent/[0.07] transition-all duration-500 group-hover:text-accent/[0.14] sm:text-8xl"
              >
                {s.ar}
              </span>

              <div className="relative">
                <span
                  lang="ar"
                  dir="rtl"
                  className="mb-4 block text-3xl leading-tight text-accent"
                >
                  {s.ar}
                </span>

                <h3
                  className={cn(
                    poppins_600,
                    "mb-2 text-xl text-ink font-stretch-110%"
                  )}
                >
                  {t(`items.${s.id}.title`)}
                </h3>

                <p
                  className={cn(
                    poppins_400,
                    "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                  )}
                >
                  {t(`items.${s.id}.desc`)}
                </p>
              </div>

              {/* Accent edge on hover */}
              <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-secondary via-highlight to-accent transition-transform duration-500 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
