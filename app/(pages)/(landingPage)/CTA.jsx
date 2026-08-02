"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Button from "@/components/atoms/form/Button";
import { FaBookOpen, FaUsers, FaWallet } from "react-icons/fa";

const assurances = [
  { icon: <FaUsers className="size-4" />, text: "Free to join" },
  { icon: <FaBookOpen className="size-4" />, text: "Browse everything before you buy" },
  { icon: <FaWallet className="size-4" />, text: "Pay per course, no subscription" },
];

export default function CTA() {
  return (
    // Light strip so the closing CTA reads as its own object rather than
    // blending into the dark FAQ above it and the dark footer below.
    <section className="relative w-full overflow-hidden bg-surface px-4 py-20 sm:px-8 sm:py-28">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-secondary/10 to-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-secondary/20 bg-gradient-to-br from-basic via-accent to-basic px-6 py-14 text-center shadow-2xl sm:px-12 sm:py-20"
      >
        {/* Motif inside the card */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,rgba(0,153,0,0.18)_1.5px,transparent_1.5px)]"
            style={{ backgroundSize: "26px 26px" }}
          />
          <div className="absolute -left-16 -top-16 size-64 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 size-64 rounded-full bg-highlight/20 blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Logo — white mark on transparent, made for dark surfaces */}
          <Image
            src="/images/dnb-nobg.png"
            alt="Deen Bridge"
            width={225}
            height={225}
            className="mx-auto mb-6 size-20 w-auto sm:size-24"
          />

          <h2
            className={cn(
              poppins_600,
              "mb-5 text-3xl font-bold leading-tight text-ink-inverse sm:text-5xl lg:text-6xl font-stretch-125%"
            )}
          >
            Your journey starts with{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              one step
            </span>
          </h2>

          <p
            className={cn(
              poppins_400,
              "mx-auto mb-10 max-w-2xl text-base leading-relaxed text-ink-inverse-muted sm:text-lg font-stretch-110%"
            )}
          >
            Join thousands of Muslims learning, teaching, and giving together.
            Create an account and you can be in your first halaqah tonight.
          </p>

          <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              wide
              round
              to="/signup"
              className="bg-gradient-to-r from-secondary to-highlight hover:from-highlight hover:to-secondary text-white px-10 py-3.5 text-base font-bold animate-in-out transition-all shadow-lg"
            >
              Create free account
            </Button>
            <Link
              href="/dashboard/courses"
              className={cn(
                poppins_500,
                "rounded-full border border-secondary/40 px-9 py-3.5 text-base text-ink-inverse transition-all hover:border-secondary hover:bg-secondary/10"
              )}
            >
              Browse courses
            </Link>
          </div>

          {/* Assurances */}
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {assurances.map((a) => (
              <li
                key={a.text}
                className={cn(
                  poppins_400,
                  "flex items-center gap-2 text-sm text-ink-inverse-muted"
                )}
              >
                <span className="text-secondary">{a.icon}</span>
                {a.text}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
