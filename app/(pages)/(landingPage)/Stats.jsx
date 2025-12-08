"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    k: "10K+",
    v: "Active Members",
    icon: Users,
    description: "Join our growing community of Muslims worldwide",
    isDark: true,
  },
  {
    k: "500+",
    v: "Islamic Resources",
    icon: CheckCircle2,
    description: "Curated books, courses, and authentic knowledge",
    isDark: true,
  },
  {
    k: "50K+",
    v: "Discussions",
    icon: TrendingUp,
    description: "Meaningful conversations and knowledge sharing",
    isDark: true,
  },
  {
    k: "98%",
    v: "Satisfaction Rate",
    icon: DollarSign,
    description: "Community members satisfied with their journey",
    isDark: true,
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

const Stats = () => (
  <section className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 bg-white/80 backdrop-blur-xl">
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
        className="mb-4 inline-block rounded-full border border-green-200/50 bg-gradient-to-r from-green-50/80 to-emerald-50/80 px-4 py-1.5 text-sm font-medium text-green-700 backdrop-blur-sm dark:border-green-500/20 dark:from-green-500/10 dark:to-emerald-500/10 dark:text-green-300"
      >
        Our Community
      </motion.span>
      <h2 className="pb-5 bg-gradient-to-r from-accent via-green-500 to-highlight bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
        Growing Together in Faith
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-700">
        Numbers that reflect our commitment to connecting Muslims worldwide through
        authentic knowledge, meaningful conversations, and spiritual growth
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
            className={cn(
              "relative h-full overflow-hidden rounded-2xl border transition-all duration-300",
              s.isDark
                ? "border-green-500/20 bg-gradient-to-br from-green-950/90 to-emerald-950/90 dark:from-green-900/40 dark:to-emerald-900/40"
                : "border-green-200/30 bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:border-green-500/10 dark:from-green-950/20 dark:to-emerald-950/20"
            )}
          >
            {/* Grid pattern overlay */}
            <div
              className={cn(
                "absolute inset-0 opacity-30",
                s.isDark
                  ? "bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(16,185,129,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.15)_1px,transparent_1px)]"
                  : "bg-[linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)]"
              )}
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
                className={cn(
                  "mb-6 inline-flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                  s.isDark
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                    : "bg-gradient-to-br from-green-500/10 to-emerald-500/10"
                )}
              >
                <s.icon
                  className={cn(
                    "size-6",
                    s.isDark
                      ? "text-green-300 dark:text-green-400"
                      : "text-green-600 dark:text-green-400"
                  )}
                />
              </motion.div>

              {/* Large statistic */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.4 }}
                className={cn(
                  "mb-3 text-5xl font-bold tracking-tight sm:text-6xl",
                  s.isDark
                    ? "text-green-200 dark:text-green-300"
                    : "text-green-700 dark:text-green-300"
                )}
              >
                <AnimatedCounter value={s.k} />
              </motion.div>

              {/* Label */}
              <p
                className={cn(
                  "mb-2 text-base font-semibold",
                  s.isDark
                    ? "text-green-300/90 dark:text-green-200"
                    : "text-green-700 dark:text-green-300"
                )}
              >
                {s.v}
              </p>

              {/* Description */}
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  s.isDark
                    ? "text-green-300/70 dark:text-green-300/60"
                    : "text-green-600/70 dark:text-green-400/70"
                )}
              >
                {s.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default Stats;
