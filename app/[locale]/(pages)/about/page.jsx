"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import Navbar from "@/components/molecules/ladingpage/Navbar";
import Footer from "../(landingPage)/Footer";
import Button from "@/components/atoms/form/Button";
import {
  FaBookOpen,
  FaCode,
  FaHandHoldingHeart,
  FaMosque,
  FaServer,
  FaRobot,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

const values = [
  {
    icon: <FaShieldAlt className="size-6 text-ink-inverse" />,
    title: "Authenticity",
    desc: "Knowledge traced to its source. Named tafsir works, graded hadith, and the positions of the four schools — never a confident guess.",
  },
  {
    icon: <FaUsers className="size-6 text-ink-inverse" />,
    title: "Community",
    desc: "Brotherhood and sisterhood that survives distance. Live spaces, study circles, and teachers you can actually reach.",
  },
  {
    icon: <FaMosque className="size-6 text-ink-inverse" />,
    title: "Excellence (Ihsan)",
    desc: "Beauty and care in the craft itself. If the Deen deserves our best, so does the thing we built to carry it.",
  },
];

// Three real repositories, all public.
const services = [
  {
    icon: <FaCode className="size-5 text-accent" />,
    name: "dnb-frontend",
    role: "The web application",
    tech: "Next.js",
    href: "https://github.com/Deen-Bridge/dnb-frontend",
  },
  {
    icon: <FaServer className="size-5 text-accent" />,
    name: "dnb-backend",
    role: "Auth, content, and Stellar payments",
    tech: "REST API",
    href: "https://github.com/Deen-Bridge/dnb-backend",
  },
  {
    icon: <FaRobot className="size-5 text-accent" />,
    name: "dnb-ai",
    role: "The Islamic-knowledge assistant",
    tech: "FastAPI",
    href: "https://github.com/Deen-Bridge/dnb-ai",
  },
];

const offerings = [
  {
    icon: <FaBookOpen className="size-5 text-accent" />,
    title: "Courses and a library",
    desc: "Structured learning and a growing collection of books, published by verified educators.",
  },
  {
    icon: <FaUsers className="size-5 text-accent" />,
    title: "Live spaces",
    desc: "Halaqahs, tafsir circles, and open Q&As hosted across time zones.",
  },
  {
    icon: <FaRobot className="size-5 text-accent" />,
    title: "An assistant that abstains",
    desc: "Confidence-scored answers with verified citations, and a scholar in the loop when it isn't sure.",
  },
  {
    icon: <FaHandHoldingHeart className="size-5 text-accent" />,
    title: "Transparent sadaqah",
    desc: "An on-chain scholarship fund where every contribution can be verified by anyone.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-basic">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary via-accent to-secondary opacity-30 blur-2xl" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-36 pb-24 text-center sm:px-6">
          <span
            className={cn(
              poppins_500,
              "mb-6 inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm text-ink-inverse-muted"
            )}
          >
            About Deen Bridge
          </span>
          <h1
            className={cn(
              poppins_600,
              "mb-6 text-4xl font-bold leading-tight text-ink-inverse sm:text-6xl lg:text-7xl font-stretch-125%"
            )}
          >
            A digital home for the{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              Ummah
            </span>
          </h1>
          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-2xl text-lg leading-relaxed text-ink-inverse-muted sm:text-xl font-stretch-110%"
            )}
          >
            Bridging authentic Islamic knowledge and modern community — built in
            the open, paid out on Stellar, and answerable to the people who use
            it.
          </p>
        </div>
      </section>

      <main id="main-content" className="flex-1">
        {/* Story */}
        <section className="relative overflow-hidden bg-surface px-4 py-20 sm:px-6 lg:px-8 sm:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="relative">
                <div className="relative z-10">
                  <Image
                    src="/images/mosque.png"
                    alt="Mosque architecture"
                    width={600}
                    height={600}
                    className="h-auto w-full rounded-3xl object-cover shadow-2xl"
                  />
                </div>
                <div className="absolute -right-4 -top-4 size-32 rounded-full bg-gradient-to-br from-secondary/40 to-highlight/30 opacity-60 blur-xl" />
                <div className="absolute -bottom-4 -left-4 size-24 rounded-full bg-gradient-to-tr from-secondary/25 to-highlight/20 opacity-40 blur-lg" />
              </div>

              <div className="space-y-6">
                <h2
                  className={cn(
                    poppins_600,
                    "text-3xl text-ink sm:text-4xl font-stretch-125%"
                  )}
                >
                  Why we built it
                </h2>
                <p
                  className={cn(
                    poppins_400,
                    "text-lg leading-relaxed text-ink-muted font-stretch-110%"
                  )}
                >
                  Authentic Islamic learning online is scattered. Good teachers
                  are hard to find, harder to pay, and a serious student ends up
                  stitching together a syllabus from a dozen places — never
                  quite sure what is reliable.
                </p>
                <p
                  className={cn(
                    poppins_400,
                    "text-lg leading-relaxed text-ink-muted font-stretch-110%"
                  )}
                >
                  Deen Bridge puts the courses, the library, the live circles,
                  and the teachers in one place, and makes the money work too —
                  educators are paid directly in USDC, in seconds, wherever they
                  happen to live.
                </p>
                <div className="pt-2">
                  <Button
                    wide
                    round
                    to="/signup"
                    className="bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white px-10 py-3.5 text-base font-bold animate-in-out transition-all shadow-lg"
                  >
                    Join us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface-raised to-surface px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                What we’re building
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                Four pieces, one platform
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {offerings.map((o) => (
                <div
                  key={o.title}
                  className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/10">
                    {o.icon}
                  </div>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-2 text-base text-ink font-stretch-110%"
                    )}
                  >
                    {o.title}
                  </h3>
                  <p
                    className={cn(
                      poppins_400,
                      "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                    )}
                  >
                    {o.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values — light cards on dark, fixing the old grey-on-green heading */}
        <section className="relative overflow-hidden bg-basic px-4 py-20 sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl text-center">
            <h2
              className={cn(
                poppins_600,
                "mb-4 text-3xl font-bold text-ink-inverse sm:text-4xl lg:text-5xl font-stretch-125%"
              )}
            >
              Our core values
            </h2>
            <p
              className={cn(
                poppins_400,
                "mx-auto mb-14 max-w-2xl text-lg text-ink-inverse-muted font-stretch-110%"
              )}
            >
              Three commitments we hold ourselves to
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="group rounded-3xl border border-secondary/20 bg-gradient-to-br from-basic to-accent p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50"
                >
                  <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary/20 transition-transform group-hover:scale-110">
                    {v.icon}
                  </div>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-3 text-xl text-ink-inverse font-stretch-110%"
                    )}
                  >
                    {v.title}
                  </h3>
                  <p
                    className={cn(
                      poppins_400,
                      "text-sm leading-relaxed text-ink-inverse-muted"
                    )}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open source */}
        <section className="relative overflow-hidden bg-surface px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl font-stretch-125%"
                )}
              >
                Built in public
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                Three services, all open source under an MIT licence. Read them,
                audit them, or send a pull request.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {services.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/10">
                    {s.icon}
                  </div>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-1 text-base text-ink font-stretch-110%"
                    )}
                  >
                    {s.name}
                  </h3>
                  <p className={cn(poppins_400, "mb-3 text-sm text-ink-muted")}>
                    {s.role}
                  </p>
                  <span
                    className={cn(
                      poppins_500,
                      "inline-flex rounded-lg bg-secondary/10 px-2.5 py-1 text-xs text-accent"
                    )}
                  >
                    {s.tech}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
