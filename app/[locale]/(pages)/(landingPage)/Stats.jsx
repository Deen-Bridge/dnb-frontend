"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { BookOpen, Globe2, Radio, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { poppins_400, poppins_500, poppins_600 } from "@/lib/config/font.config";

const stats = [
  {
    id: "learners",
    k: "12K+",
    icon: Users,
  },
  {
    id: "resources",
    k: "850+",
    icon: BookOpen,
  },
  {
    id: "spaces",
    k: "300+",
    icon: Radio,
  },
  {
    id: "countries",
    k: "40+",
    icon: Globe2,
  },
];

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Extract numeric value and preserve the rest (prefixes, suffixes like K, M, %, +, $)
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const prefix = value.match(/^[^0-9.]*/)?.[0] || "";
  const suffix = value.replace(/[0-9.]/g, "").replace(prefix, "");

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  const formatCount = () => {
    const formatted = count % 1 !== 0 ? count.toFixed(1) : count.toFixed(0);
    return `${prefix}${formatted}${suffix}`;
  };

  return (
    <span ref={ref}>
      {isInView ? formatCount() : `${prefix}0${suffix}`}
    </span>
  );
}

const Stats = () => {
  const t = useTranslations("landing.stats");

  return (
  <section className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 bg-surface backdrop-blur-xl">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-16 text-center"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className={cn(
          poppins_500,
          "mb-4 inline-block rounded-full border border-accent/20 bg-secondary/10 px-4 py-1.5 text-sm text-accent backdrop-blur-sm"
        )}
      >
        {t("badge")}
      </motion.span>
      <h2 className={cn(
        poppins_600,
        "pb-5 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl font-stretch-125%"
      )}>
        {t("title")}
      </h2>
      <p className={cn(poppins_400, "mx-auto mt-4 max-w-2xl text-lg text-ink-muted font-stretch-110%")}>
        {t("subtitle")}
      </p>
    </motion.div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: i * 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 100,
          }}
          className="group relative h-full"
        >
          <div
            className="relative h-full overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-basic to-accent transition-all duration-300"
          >
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(0,153,0,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,153,0,0.12)_1px,transparent_1px)]"
              style={{ backgroundSize: "20px 20px" }}
            />

            <div className="relative p-8">
              {/* Icon in top-left */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1 + 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/25 to-highlight/20 transition-all duration-300 group-hover:scale-110"
              >
                <s.icon className="size-6 text-ink-inverse-muted" />
              </motion.div>

              {/* Large statistic */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className={cn(
                  poppins_600,
                  "mb-3 text-5xl font-bold tracking-tight sm:text-6xl text-ink-inverse font-stretch-110%"
                )}
              >
                <AnimatedCounter value={s.k} />
              </motion.div>

              {/* Label */}
              <p
                className={cn(poppins_500, "mb-2 text-base text-ink-inverse font-stretch-110%")}
              >
                {t(`items.${s.id}.label`)}
              </p>

              {/* Description */}
              <p
                className={cn(poppins_400, "text-sm leading-relaxed text-ink-inverse-muted")}
              >
                {t(`items.${s.id}.description`)}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
  );
};

export default Stats;
