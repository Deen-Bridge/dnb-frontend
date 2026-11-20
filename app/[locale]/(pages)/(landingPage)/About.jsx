"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaUsers,
  FaRobot,
} from "react-icons/fa";

const pillars = [
  {
    id: "teachers",
    icon: <FaChalkboardTeacher className="h-5 w-5 text-accent" />,
  },
  {
    id: "library",
    icon: <FaBookOpen className="h-5 w-5 text-accent" />,
  },
  {
    id: "community",
    icon: <FaUsers className="h-5 w-5 text-accent" />,
  },
  {
    id: "ai",
    icon: <FaRobot className="h-5 w-5 text-accent" />,
  },
];

const About = () => {
  const t = useTranslations("landing.about");

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-surface px-4 py-20 backdrop-blur-xl sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy + product pillars */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span
                className={cn(
                  poppins_500,
                  "inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-xs uppercase tracking-wider text-secondary"
                )}
              >
                {t("eyebrow")}
              </span>
              <h2
                className={cn(
                  poppins_600,
                  "text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-secondary via-highlight to-accent sm:text-5xl lg:text-6xl font-stretch-125%"
                )}
              >
                {t("heading")}
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "max-w-2xl text-lg leading-relaxed text-ink-muted font-stretch-110%"
                )}
              >
                {t("description")}
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pillars.map((p) => (
                <li
                  key={p.id}
                  className="group rounded-2xl border border-accent/10 bg-surface-raised p-5 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40"
                >
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-highlight/10 border border-accent/5 transition-transform group-hover:scale-110">
                    {p.icon}
                  </div>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-1.5 text-base text-ink font-stretch-110%"
                    )}
                  >
                    {t(`pillars.${p.id}.title`)}
                  </h3>
                  <p
                    className={cn(
                      poppins_400,
                      "text-sm leading-relaxed text-ink-muted"
                    )}
                  >
                    {t(`pillars.${p.id}.desc`)}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — real image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative z-10">
              <Image
                src="/images/mosque.png"
                alt={t("imageAlt")}
                width={600}
                height={600}
                className="h-auto w-full rounded-2xl object-contain shadow-2xl"
                priority
              />
            </div>

            {/* Decorative glows */}
            <div className="absolute -top-4 -end-4 h-32 w-32 rounded-full bg-gradient-to-br from-secondary/40 to-highlight/30 opacity-60 blur-xl" />
            <div className="absolute -bottom-4 -start-4 h-24 w-24 rounded-full bg-gradient-to-tr from-secondary/25 to-highlight/20 opacity-40 blur-lg" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
