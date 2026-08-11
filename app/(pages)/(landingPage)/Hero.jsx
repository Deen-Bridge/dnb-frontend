"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";

/* Swap for any real photo in /public/images
   (e.g. img-3.jpg, img-4.jpg, img-5.jpg, img-6.jpg, auth.jpg). */
const HERO_IMAGE = "/images/mosque.png";

/* Right-side preview cards — swap img/title/meta for real content any time. */
const previews = [
  {
    img: "/images/book1.jpg",
    label: "From the library",
    title: "Riyāḍ aṣ-Ṣāliḥīn",
    meta: "Read online",
  },
  {
    img: "/images/img-2.jpeg",
    label: "Featured course",
    title: "Foundations of Tajwīd",
    meta: "Self-paced",
  },
  {
    img: "/images/img-3.jpg",
    label: "Community spaces",
    title: "Weekly Halaqah",
    meta: "Live sessions",
  },
];

const trust = ["Trusted teachers", "Authentic sources", "A global Ummah"];

const Hero = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-basic text-ink-inverse">
      {/* Real image background */}
      <Image
        src={HERO_IMAGE}
        alt="DeenBridge — authentic Islamic learning"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Dark overlay — heavier on the left so the copy stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-basic/95 via-basic/80 to-basic/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-basic via-basic/20 to-basic/60" />

      {/* Content — top/bottom padding clears the fixed navbar */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center pt-28 pb-16 lg:pt-32">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 sm:px-10 lg:grid-cols-2 lg:px-16">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl text-left"
          >
            <h1
              className={cn(
                poppins_600,
                "text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl font-stretch-125%"
              )}
            >
              Authentic Islamic{" "}
              <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
                learning &amp; excellence
              </span>
            </h1>

            <p
              className={cn(
                poppins_400,
                "mt-5 max-w-lg text-base leading-relaxed text-ink-inverse-muted sm:text-lg font-stretch-110%"
              )}
            >
              Enroll in trusted courses, read a growing library, join a global
              community, and get cited answers from an Islamic-knowledge
              assistant — all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                wide
                round
                to="/signup"
                className="bg-gradient-to-r from-secondary to-highlight hover:from-highlight hover:to-secondary text-white px-8 py-3 text-base font-bold animate-in-out transition-all shadow-lg"
              >
                Start learning
              </Button>
              <Link
                href="/dashboard"
                className={cn(
                  poppins_500,
                  "rounded-full border border-ink-inverse/25 px-7 py-3 text-center text-base text-ink-inverse transition-all hover:border-secondary hover:bg-secondary/10"
                )}
              >
                Explore DeenBridge
              </Link>
            </div>

            <p className={cn(poppins_500, "mt-8 text-sm text-ink-inverse-muted")}>
              {trust.join("  ·  ")}
            </p>
          </motion.div>

          {/* Right — compact product preview cards */}
          <div className="hidden lg:block">
            <div className="ml-auto flex w-full max-w-sm flex-col gap-4">
              {previews.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border border-ink-inverse/15 bg-basic/50 p-3 shadow-2xl backdrop-blur-md transition-transform hover:-translate-y-0.5",
                    i % 2 === 1 && "translate-x-6"
                  )}
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={cn(
                        poppins_500,
                        "text-[10px] uppercase tracking-wider text-secondary"
                      )}
                    >
                      {p.label}
                    </span>
                    <h3
                      className={cn(
                        poppins_600,
                        "truncate text-sm text-ink-inverse font-stretch-110%"
                      )}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={cn(
                        poppins_400,
                        "text-xs text-ink-inverse-muted"
                      )}
                    >
                      {p.meta}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
