"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  BookOpenCheck,
  Brain,
  Coins,
  FileSearch,
  Gauge,
  GraduationCap,
  Languages,
  Quote,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

/* Every claim on this page maps to something implemented in dnb-ai:
   confidence.py, citations.py, verifier.py, hadith.py, tafsir.py, fiqh.py,
   memory/, safety/, nisab.py, stellar.py, study.py. */

const pillars = [
  {
    icon: Gauge,
    title: "It will tell you when it doesn’t know",
    desc: "Every answer carries a confidence score. Below the threshold it abstains rather than guesses — because on matters of Deen, “confidently wrong” is the worst possible outcome.",
  },
  {
    icon: UserCheck,
    title: "Doubtful rulings go to a scholar",
    desc: "Religious answers that score low are queued for human review. A scholar approves, corrects, or rejects them — the verdict is recorded, not discarded.",
  },
  {
    icon: Quote,
    title: "Citations are verified, not decorative",
    desc: "Qur’an and hadith references come back as typed, bounds-checked objects — validated against the 114-surah index and matched to corpus text, not trusted because the model wrote them.",
  },
];

const capabilities = [
  {
    icon: ScrollText,
    title: "Tafsir from named works",
    desc: "Ayah explanations retrieved from classical tafsir — al-Muyassar, Fi Zilal al-Qur’an, Ma‘arif al-Qur’an, Bayan ul Quran — with attribution. Never paraphrased from model memory.",
  },
  {
    icon: BookOpenCheck,
    title: "Grading-aware hadith",
    desc: "References across Bukhari, Muslim, Abu Dawud, at-Tirmidhi, an-Nasa’i, Ibn Majah, and the Muwatta are graded before they reach you — a da‘if narration is never dressed up as sahih.",
  },
  {
    icon: FileSearch,
    title: "Madhhab-aware fiqh",
    desc: "Fiqh questions are classified and answered with the position of the Hanafi, Maliki, Shafi‘i, and Hanbali schools rather than flattened into one opinion.",
  },
  {
    icon: Languages,
    title: "Answers in your language",
    desc: "Arabic, English, Urdu, Malay, French and more — auto-detected or requested. Qur’an is always quoted in Arabic script with a translation and a surah:ayah reference.",
  },
  {
    icon: Brain,
    title: "Remembers, on your terms",
    desc: "Builds a profile of your knowledge level, madhhab, and what you’ve studied, carried across sessions. You can read it, delete it outright, or opt out per message.",
  },
  {
    icon: Coins,
    title: "Live zakat and nisab",
    desc: "Nisab is derived from the current gold price rather than a stale constant, and zakat can be calculated against the USDC balance in your own Stellar wallet.",
  },
  {
    icon: GraduationCap,
    title: "Quizzes and flashcards",
    desc: "Turn a topic or a lesson into schema-validated study material at three difficulty levels, so revision isn’t another thing you have to build yourself.",
  },
  {
    icon: ShieldCheck,
    title: "Layered safety",
    desc: "A policy pipeline gates both what goes in and what comes out, so the assistant stays inside the boundaries it was given.",
  },
];

const pipeline = [
  {
    id: 1,
    title: "Your question is gated",
    desc: "The input passes a policy check before a single token is generated.",
  },
  {
    id: 2,
    title: "Sources are retrieved",
    desc: "Relevant tafsir and references are pulled from named works and handed to the model as grounding.",
  },
  {
    id: 3,
    title: "The answer is scored",
    desc: "Citations are verified, hadith are graded, and a confidence score decides: answer, hedge, or abstain.",
  },
  {
    id: 4,
    title: "You get it, or a scholar does",
    desc: "High confidence reaches you directly. Low-confidence religious answers go to the review queue first.",
  },
];

// A short scripted exchange, typed out — illustrative of the response shape.
const DEMO = [
  { role: "user", text: "Is it permissible to combine prayers while travelling?" },
  {
    role: "ai",
    text: "Yes — combining Dhuhr with ‘Asr, and Maghrib with ‘Isha, is established for the traveller.",
    meta: {
      confidence: "High",
      madhhab: "All four schools permit it; they differ on the conditions.",
      citations: ["Qur’an 4:101", "Sahih Muslim 705"],
    },
  },
];

function useTypewriter(text, active, speed = 18) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!active) return;
    setOut("");
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, active, speed]);
  return out;
}

const ChatDemo = () => {
  const [started, setStarted] = useState(false);
  const answer = DEMO[1];
  const typed = useTypewriter(answer.text, started);
  const done = typed.length === answer.text.length;

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-3xl border border-secondary/20 bg-basic/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      {/* Question */}
      <div className="mb-4 flex justify-end">
        <p
          className={cn(
            poppins_400,
            "max-w-[85%] rounded-2xl rounded-br-sm bg-secondary/20 px-4 py-3 text-sm text-ink-inverse"
          )}
        >
          {DEMO[0].text}
        </p>
      </div>

      {/* Answer */}
      <div className="flex gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent">
          <Sparkles className="size-4 text-ink-inverse" />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              poppins_400,
              "rounded-2xl rounded-bl-sm bg-accent/40 px-4 py-3 text-sm leading-relaxed text-ink-inverse"
            )}
          >
            {typed}
            {!done && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-secondary align-middle" />
            )}
          </p>

          <div
            className={cn(
              "mt-3 space-y-2 transition-opacity duration-700",
              done ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  poppins_500,
                  "inline-flex items-center gap-1.5 rounded-lg bg-secondary/20 px-2.5 py-1 text-[11px] text-secondary"
                )}
              >
                <Gauge className="size-3" />
                Confidence: {answer.meta.confidence}
              </span>
              {answer.meta.citations.map((c) => (
                <span
                  key={c}
                  className={cn(
                    poppins_500,
                    "inline-flex items-center gap-1.5 rounded-lg border border-secondary/25 px-2.5 py-1 text-[11px] text-ink-inverse-muted"
                  )}
                >
                  <Quote className="size-3" />
                  {c}
                </span>
              ))}
            </div>
            <p
              className={cn(
                poppins_400,
                "text-[11px] leading-relaxed text-ink-inverse-muted"
              )}
            >
              {answer.meta.madhhab}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AiPage() {
  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-basic">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-secondary via-accent to-secondary opacity-30 blur-2xl" />
        <div
          className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,153,0,0.25)_1.5px,transparent_1.5px)]"
          style={{ backgroundSize: "32px 32px" }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pt-36 pb-24 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className={cn(
                poppins_500,
                "mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm text-ink-inverse-muted"
              )}
            >
              <Sparkles className="size-3.5 text-secondary" />
              The Deen Bridge Assistant
            </span>

            <h1
              className={cn(
                poppins_600,
                "mb-6 text-4xl font-bold leading-tight text-ink-inverse sm:text-6xl lg:text-7xl font-stretch-125%"
              )}
            >
              An AI that knows{" "}
              <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
                when to stay silent
              </span>
            </h1>

            <p
              className={cn(
                poppins_400,
                "mb-8 max-w-xl text-lg leading-relaxed text-ink-inverse-muted font-stretch-110%"
              )}
            >
              Ask about Qur’an, hadith, fiqh, or your own zakat. Every answer is
              scored, every citation is checked, and anything doubtful goes to a
              scholar before it reaches you — not after.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                wide
                round
                to="/dashboard/ai"
                className="bg-gradient-to-r from-secondary to-highlight hover:from-highlight hover:to-secondary text-white px-10 py-3.5 text-base font-bold animate-in-out transition-all shadow-lg"
              >
                Ask a question
              </Button>
              <Link
                href="https://github.com/Deen-Bridge/dnb-ai"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  poppins_500,
                  "rounded-full border border-secondary/40 px-9 py-3.5 text-base text-ink-inverse transition-all hover:border-secondary hover:bg-secondary/10"
                )}
              >
                Read the source
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ChatDemo />
            <p
              className={cn(
                poppins_400,
                "mt-3 text-center text-xs text-ink-inverse-muted/70"
              )}
            >
              Illustrative exchange — showing the shape of a real response.
            </p>
          </motion.div>
        </div>
      </section>

      <main id="main-content" className="flex-1">
        {/* Three pillars */}
        <section className="relative overflow-hidden bg-surface px-4 py-20 sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl" />
            <div className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                Built to be trusted with Deen
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                Most assistants optimise for always having an answer. This one
                optimises for never giving you a wrong one.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.article
                    key={p.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-3xl border border-accent/10 bg-surface-raised p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
                  >
                    <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent shadow-md transition-transform group-hover:scale-110">
                      <Icon className="size-6 text-ink-inverse" />
                    </div>
                    <h3
                      className={cn(
                        poppins_600,
                        "mb-3 text-xl text-accent font-stretch-110%"
                      )}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={cn(
                        poppins_400,
                        "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                      )}
                    >
                      {p.desc}
                    </p>
                    <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-secondary via-highlight to-accent transition-transform duration-500 group-hover:scale-x-100" />
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How an answer is made */}
        <section className="relative overflow-hidden bg-basic px-4 py-20 sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 text-3xl font-bold text-ink-inverse sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                How an answer is made
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-inverse-muted font-stretch-110%"
                )}
              >
                Four gates between your question and the reply
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pipeline.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative rounded-2xl border border-secondary/20 bg-gradient-to-br from-basic to-accent p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/50"
                >
                  <span
                    className={cn(
                      poppins_600,
                      "mb-4 flex size-9 items-center justify-center rounded-full bg-secondary/20 text-sm text-ink-inverse"
                    )}
                  >
                    {s.id}
                  </span>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-2 text-base text-ink-inverse font-stretch-110%"
                    )}
                  >
                    {s.title}
                  </h3>
                  <p
                    className={cn(
                      poppins_400,
                      "text-sm leading-relaxed text-ink-inverse-muted"
                    )}
                  >
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="relative overflow-hidden bg-surface px-4 py-20 sm:px-6 sm:py-28">
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                What it can do
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                Not a general chatbot with a prompt taped on — purpose-built
                pieces, each solving a way an Islamic assistant can fail
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {capabilities.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.article
                    key={c.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: (i % 4) * 0.08 }}
                    className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/10">
                      <Icon className="size-5 text-accent" />
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
                        "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                      )}
                    >
                      {c.desc}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Privacy + open source */}
        <section className="relative overflow-hidden bg-gradient-to-br from-surface via-surface-raised to-surface px-4 pb-24 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-accent/10 bg-surface-raised p-10 shadow-sm">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary/10">
                <ShieldCheck className="size-6 text-accent" />
              </div>
              <h3
                className={cn(
                  poppins_600,
                  "mb-3 text-2xl text-ink font-stretch-110%"
                )}
              >
                Your memory, your call
              </h3>
              <p
                className={cn(
                  poppins_400,
                  "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                )}
              >
                What the assistant remembers about you is readable on request
                and erasable in full. You can also switch remembering off for
                any single message. Stored profiles expire on their own — they
                are not kept indefinitely.
              </p>
            </div>

            <div className="rounded-3xl border border-accent/10 bg-surface-raised p-10 shadow-sm">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary/10">
                <FileSearch className="size-6 text-accent" />
              </div>
              <h3
                className={cn(
                  poppins_600,
                  "mb-3 text-2xl text-ink font-stretch-110%"
                )}
              >
                Open source, end to end
              </h3>
              <p
                className={cn(
                  poppins_400,
                  "mb-5 text-sm leading-relaxed text-ink-muted font-stretch-110%"
                )}
              >
                The assistant is a FastAPI service under an MIT licence, built
                in public alongside the web app and the API. If you want to know
                exactly how a ruling is scored or a citation is checked, you can
                go and read it.
              </p>
              <Link
                href="https://github.com/Deen-Bridge/dnb-ai"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  poppins_500,
                  "text-sm text-highlight underline decoration-highlight/40 underline-offset-4 transition-colors hover:decoration-highlight"
                )}
              >
                github.com/Deen-Bridge/dnb-ai
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative w-full overflow-hidden bg-surface px-4 pb-24 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-secondary/20 bg-gradient-to-br from-basic via-accent to-basic px-6 py-16 text-center shadow-2xl sm:px-12"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_center,rgba(0,153,0,0.18)_1.5px,transparent_1.5px)]"
              style={{ backgroundSize: "26px 26px" }}
            />
            <div className="relative z-10">
              <h2
                className={cn(
                  poppins_600,
                  "mb-5 text-3xl font-bold text-ink-inverse sm:text-4xl lg:text-5xl font-stretch-125%"
                )}
              >
                Ask it something difficult
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto mb-10 max-w-2xl text-base leading-relaxed text-ink-inverse-muted sm:text-lg font-stretch-110%"
                )}
              >
                The kind of question you would normally take to a teacher. See
                what it says — and see what it refuses to say.
              </p>
              <Button
                wide
                round
                to="/dashboard/ai"
                className="bg-gradient-to-r from-secondary to-highlight hover:from-highlight hover:to-secondary text-white px-12 py-4 text-base font-bold animate-in-out transition-all shadow-lg"
              >
                Open the assistant
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
