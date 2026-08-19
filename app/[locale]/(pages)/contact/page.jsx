"use client";

import React, { useState } from "react";
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
import { FaEnvelope, FaGithub, FaGlobeAfrica, FaTwitter } from "react-icons/fa";
import { Bug, LifeBuoy, Mail, Users } from "lucide-react";

const SUPPORT_EMAIL = "salaam@deenbridge.com";

const channels = [
  {
    icon: <Mail className="size-5 text-accent" />,
    title: "General enquiries",
    desc: "Questions about the platform, partnerships, or anything else.",
    action: `mailto:${SUPPORT_EMAIL}`,
    label: SUPPORT_EMAIL,
    external: false,
  },
  {
    icon: <Bug className="size-5 text-accent" />,
    title: "Found a bug?",
    desc: "Open an issue and we’ll see it. The whole platform is public.",
    action: "https://github.com/Deen-Bridge",
    label: "github.com/Deen-Bridge",
    external: true,
  },
  {
    icon: <Users className="size-5 text-accent" />,
    title: "Want to teach?",
    desc: "Publish courses and books, host live spaces, get paid in USDC.",
    action: "/signup",
    label: "Apply as an educator",
    external: false,
  },
];

const topics = [
  "General enquiry",
  "Becoming an educator",
  "Payments & Stellar",
  "Report a problem",
  "Partnership",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: topics[0],
    message: "",
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  /* The old form only called preventDefault, so every message was silently
     dropped. There is no contact endpoint on the backend, so compose a real
     mail instead of pretending to send one. */
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = `[${form.topic}] from ${form.name || "a visitor"}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Topic: ${form.topic}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "w-full rounded-xl border border-accent/15 bg-surface px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-muted/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-basic">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary via-accent to-secondary opacity-30 blur-2xl" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-36 pb-20 text-center sm:px-6">
          <span
            className={cn(
              poppins_500,
              "mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm text-ink-inverse-muted"
            )}
          >
            <LifeBuoy className="size-3.5" />
            We read everything
          </span>
          <h1
            className={cn(
              poppins_600,
              "mb-6 text-4xl font-bold leading-tight text-ink-inverse sm:text-6xl font-stretch-125%"
            )}
          >
            Get in{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              touch
            </span>
          </h1>
          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-2xl text-lg leading-relaxed text-ink-inverse-muted font-stretch-110%"
            )}
          >
            Questions, feedback, or something you’d like to build with us —
            we’d love to hear from you.
          </p>
        </div>
      </section>

      <main id="main-content" className="flex-1 bg-surface">
        {/* Channels */}
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {channels.map((c) => (
              <Link
                key={c.title}
                href={c.action}
                {...(c.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/10">
                  {c.icon}
                </div>
                <h3
                  className={cn(
                    poppins_600,
                    "mb-2 text-base text-ink font-stretch-110%"
                  )}
                >
                  {c.title}
                </h3>
                <p
                  className={cn(
                    poppins_400,
                    "mb-3 text-sm leading-relaxed text-ink-muted font-stretch-110%"
                  )}
                >
                  {c.desc}
                </p>
                <span
                  className={cn(
                    poppins_500,
                    "text-sm text-highlight underline decoration-highlight/40 underline-offset-4 transition-colors group-hover:decoration-highlight"
                  )}
                >
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Form + info */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Info */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-3xl border border-accent/10 bg-surface-raised p-8 shadow-sm">
                <h3
                  className={cn(
                    poppins_600,
                    "mb-6 text-xl text-ink font-stretch-110%"
                  )}
                >
                  Reach us directly
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-accent">
                      <FaEnvelope className="size-4" />
                    </span>
                    <div>
                      <p
                        className={cn(
                          poppins_500,
                          "text-sm text-ink font-stretch-110%"
                        )}
                      >
                        Email
                      </p>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className={cn(
                          poppins_400,
                          "text-sm text-ink-muted transition-colors hover:text-accent"
                        )}
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-accent">
                      <FaGlobeAfrica className="size-4" />
                    </span>
                    <div>
                      <p
                        className={cn(
                          poppins_500,
                          "text-sm text-ink font-stretch-110%"
                        )}
                      >
                        Where we are
                      </p>
                      <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                        A distributed team, serving the Ummah worldwide.
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="my-8 border-accent/10" />

                <h4
                  className={cn(
                    poppins_500,
                    "mb-4 text-sm text-ink font-stretch-110%"
                  )}
                >
                  Follow along
                </h4>
                <div className="flex gap-3">
                  {[
                    {
                      icon: <FaGithub />,
                      href: "https://github.com/Deen-Bridge",
                      label: "Deen Bridge on GitHub",
                    },
                    {
                      icon: <FaTwitter />,
                      href: "https://x.com/deen_bridge",
                      label: "Deen Bridge on X",
                    },
                  ].map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex size-10 items-center justify-center rounded-full bg-secondary/10 text-accent transition-all hover:bg-accent hover:text-ink-inverse"
                    >
                      {s.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-accent/10 bg-surface-raised p-8 shadow-xl sm:p-10"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className={cn(poppins_500, "text-sm text-ink")}
                    >
                      Your name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Ahmed Ali"
                      className={cn(poppins_400, field)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className={cn(poppins_500, "text-sm text-ink")}
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={set("email")}
                      placeholder="ahmed@example.com"
                      className={cn(poppins_400, field)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="topic"
                    className={cn(poppins_500, "text-sm text-ink")}
                  >
                    What’s it about?
                  </label>
                  <select
                    id="topic"
                    value={form.topic}
                    onChange={set("topic")}
                    className={cn(poppins_400, field)}
                  >
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className={cn(poppins_500, "text-sm text-ink")}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    value={form.message}
                    onChange={set("message")}
                    placeholder="How can we help?"
                    className={cn(poppins_400, field, "resize-none")}
                  />
                </div>

                <Button
                  wide
                  round
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white py-4 text-base font-bold shadow-lg transition-all hover:shadow-xl"
                >
                  Send message
                </Button>

                <p
                  className={cn(
                    poppins_400,
                    "text-center text-xs text-ink-muted/80"
                  )}
                >
                  This opens your email app with the message ready to send.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
