"use client";

import React from "react";
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
  BookOpen,
  Bookmark,
  Coins,
  GraduationCap,
  HandHeart,
  MessagesSquare,
  Radio,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";

// Each entry maps to a route that exists in the app today.
const features = [
  {
    icon: GraduationCap,
    title: "Courses",
    href: "/dashboard/courses",
    desc: "Structured lessons from verified educators, with your progress saved as you go. Enroll once and pick up wherever you left off, on any device.",
    points: ["Progress tracking", "Bookmark for later", "Publish your own"],
    featured: true,
  },
  {
    icon: BookOpen,
    title: "Library",
    href: "/dashboard/library",
    desc: "A growing collection of Islamic books you can preview, buy, and read in the browser — filtered by category, price, or rating.",
    points: ["In-browser reader", "Free and paid titles", "Reviews and ratings"],
    featured: true,
  },
  {
    icon: Radio,
    title: "Community Spaces",
    href: "/dashboard/spaces",
    desc: "Live halaqahs, tafsir circles, and open Q&As hosted by teachers across the Ummah. Join what's live now or add an upcoming one to your list.",
    points: ["Live and upcoming", "Hosted by educators", "Join the waitlist"],
    featured: true,
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    href: "/ai",
    desc: "An Islamic-knowledge assistant that scores its own confidence, verifies its citations, and routes doubtful rulings to a scholar rather than guessing.",
    points: ["Verified citations", "Scholar review", "Multilingual"],
    featured: true,
  },
  {
    icon: HandHeart,
    title: "Sadaqah Jariyah",
    href: "/dashboard/sadaqah",
    desc: "Give to an on-chain scholarship fund for students of knowledge. Every contribution is publicly verifiable, from your wallet to the pool.",
    points: ["On-chain transparency", "Funds scholarships"],
  },
  {
    icon: Wallet,
    title: "Stellar Payments",
    href: "/stellar",
    desc: "Buy in USDC and pay educators directly. Settlement takes seconds, fees are a fraction of a cent, and we never hold your funds.",
    points: ["Non-custodial", "Seconds to settle"],
  },
  {
    icon: MessagesSquare,
    title: "Messaging",
    href: "/dashboard/messages",
    desc: "Reach teachers and fellow students directly, so a question you had during a lesson doesn't have to wait for the next one.",
    points: ["Direct messages", "Space discussions"],
  },
  {
    icon: Search,
    title: "Search & Recommendations",
    // /dashboard/search only exists as search/[searchparam] — no index route.
    href: "/dashboard",
    desc: "Find a course, a book, or a teacher across the whole platform — and get suggestions based on what you've actually been studying.",
    points: ["Cross-platform search", "Personalised"],
  },
  {
    icon: Bookmark,
    title: "Saved & Purchases",
    href: "/dashboard/saved",
    desc: "Everything you've bought and everything you meant to come back to, kept in one place.",
    points: ["Bookmarks", "Purchase history"],
  },
  {
    icon: Coins,
    title: "Earnings",
    href: "/dashboard/earnings",
    desc: "For educators: see what you've made, per course and per book, and watch it settle to your own wallet.",
    points: ["Per-item breakdown", "Paid in USDC"],
  },
];

export default function FeaturesPage() {
  const [primary, secondaryFeatures] = [
    features.filter((f) => f.featured),
    features.filter((f) => !f.featured),
  ];

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
            Everything on the platform
          </span>
          <h1
            className={cn(
              poppins_600,
              "mb-6 text-4xl font-bold leading-tight text-ink-inverse sm:text-6xl lg:text-7xl font-stretch-125%"
            )}
          >
            Features that{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              connect
            </span>
          </h1>
          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-2xl text-lg leading-relaxed text-ink-inverse-muted sm:text-xl font-stretch-110%"
            )}
          >
            The tools we’ve built to help you learn authentically, connect
            globally, and grow in your Deen.
          </p>
        </div>
      </section>

      <main className="flex-1">
        {/* The four pillars */}
        <section className="relative overflow-hidden bg-surface px-4 py-20 sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                Where you’ll spend your time
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                Four places the platform does its real work
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {primary.map((f) => {
                const Icon = f.icon;
                return (
                  <Link
                    key={f.title}
                    href={f.href}
                    className="group relative overflow-hidden rounded-3xl border border-accent/10 bg-surface-raised p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent shadow-md transition-transform group-hover:scale-110">
                      <Icon className="size-6 text-ink-inverse" />
                    </div>
                    <h3
                      className={cn(
                        poppins_600,
                        "mb-3 text-2xl text-accent font-stretch-110%"
                      )}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={cn(
                        poppins_400,
                        "mb-5 leading-relaxed text-ink-muted font-stretch-110%"
                      )}
                    >
                      {f.desc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {f.points.map((p) => (
                        <span
                          key={p}
                          className={cn(
                            poppins_500,
                            "rounded-lg bg-secondary/10 px-3 py-1.5 text-xs text-accent"
                          )}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-secondary via-highlight to-accent transition-transform duration-500 group-hover:scale-x-100" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Everything else */}
        <section className="relative overflow-hidden bg-basic px-4 py-20 sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-14 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 text-3xl font-bold text-ink-inverse sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                And everything around it
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-inverse-muted font-stretch-110%"
                )}
              >
                The parts that keep the rest working
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {secondaryFeatures.map((f) => {
                const Icon = f.icon;
                return (
                  <Link
                    key={f.title}
                    href={f.href}
                    className="group rounded-2xl border border-secondary/20 bg-gradient-to-br from-basic to-accent p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50"
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/20 transition-transform group-hover:scale-110">
                      <Icon className="size-5 text-ink-inverse" />
                    </div>
                    <h3
                      className={cn(
                        poppins_600,
                        "mb-2 text-lg text-ink-inverse font-stretch-110%"
                      )}
                    >
                      {f.title}
                    </h3>
                    <p
                      className={cn(
                        poppins_400,
                        "mb-4 text-sm leading-relaxed text-ink-inverse-muted"
                      )}
                    >
                      {f.desc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {f.points.map((p) => (
                        <span
                          key={p}
                          className={cn(
                            poppins_500,
                            "rounded-lg border border-secondary/25 px-2.5 py-1 text-[11px] text-ink-inverse-muted"
                          )}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl rounded-3xl border border-accent/10 bg-surface-raised p-10 text-center shadow-xl">
            <h3
              className={cn(
                poppins_600,
                "mb-4 text-2xl text-ink sm:text-3xl font-stretch-125%"
              )}
            >
              See it for yourself
            </h3>
            <p
              className={cn(
                poppins_400,
                "mx-auto mb-8 max-w-2xl text-ink-muted font-stretch-110%"
              )}
            >
              Creating an account is free, and there are free courses and books
              waiting the moment you do.
            </p>
            <Button
              wide
              round
              to="/signup"
              className="bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white px-12 py-4 text-base font-bold animate-in-out transition-all shadow-lg"
            >
              Create free account
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
