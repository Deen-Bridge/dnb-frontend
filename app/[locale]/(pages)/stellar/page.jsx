"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  FaWallet,
  FaHandHoldingHeart,
  FaBookOpen,
  FaShieldAlt,
  FaBolt,
  FaSearchDollar,
  FaGlobeAfrica,
  FaLink,
} from "react-icons/fa";

// What the network is actually used for on DeenBridge today.
const uses = [
  {
    icon: <FaWallet className="w-6 h-6 text-ink-inverse" />,
    title: "Paying educators",
    desc: "Teachers are paid in USDC the moment a learner enrolls. No 30-day payout cycle, no minimum threshold, no bank in the middle — the funds land in the wallet they already control.",
  },
  {
    icon: <FaHandHoldingHeart className="w-6 h-6 text-ink-inverse" />,
    title: "Sadaqah & charity",
    desc: "Sadaqah Jariyah donations flow into a transparent on-chain USDC fund that pays scholarships for students of knowledge. Every contribution is publicly verifiable, from your wallet to the pool.",
  },
  {
    icon: <FaBookOpen className="w-6 h-6 text-ink-inverse" />,
    title: "Courses & books",
    desc: "Buying a course or a book is a signed payment from your own wallet. You approve the exact amount, and the educator receives it directly.",
  },
];

const reasons = [
  {
    icon: <FaBolt className="w-5 h-5 text-accent" />,
    title: "Settles in seconds",
    desc: "Transactions confirm in about five seconds, so an educator sees their earnings before the learner has finished the first lesson.",
  },
  {
    icon: <FaSearchDollar className="w-5 h-5 text-accent" />,
    title: "Fees near zero",
    desc: "Network fees are a fraction of a cent. A student in Kano pays the same to transact as one in London, and neither loses a chunk of it to intermediaries.",
  },
  {
    icon: <FaShieldAlt className="w-5 h-5 text-accent" />,
    title: "Non-custodial",
    desc: "DeenBridge never holds your funds. You sign every transaction in your own wallet, and you can walk away with your balance at any time.",
  },
  {
    icon: <FaGlobeAfrica className="w-5 h-5 text-accent" />,
    title: "Built for the Ummah",
    desc: "Cross-border payments that do not depend on a card network reaching your country — which matters when your teacher and your student live continents apart.",
  },
  {
    icon: <FaLink className="w-5 h-5 text-accent" />,
    title: "Publicly verifiable",
    desc: "Every payment and every donation carries a transaction hash you can open in a Stellar explorer and check for yourself.",
  },
  {
    icon: <FaBookOpen className="w-5 h-5 text-accent" />,
    title: "Priced in USDC",
    desc: "A dollar-denominated stablecoin, so a course priced today is worth the same tomorrow. No volatility between enrolling and being paid.",
  },
];

const flow = [
  {
    id: 1,
    title: "Connect your wallet",
    desc: "Link a Stellar wallet such as Freighter. It takes a minute, and DeenBridge only ever sees your public address.",
  },
  {
    id: 2,
    title: "Approve the payment",
    desc: "When you enroll or donate, your wallet shows you the exact amount and asset. Nothing moves until you sign it yourself.",
  },
  {
    id: 3,
    title: "It settles in seconds",
    desc: "The network confirms the transfer and the recipient's balance updates almost immediately.",
  },
  {
    id: 4,
    title: "Verify it on-chain",
    desc: "Every transaction links out to a Stellar explorer, so you never have to take our word for it.",
  },
];

export default function StellarPage() {
  return (
    <div className="min-h-screen bg-basic flex flex-col">
      <Navbar />
      {/* Hero — dark, so the transparent Navbar reads correctly. pt clears the
          fixed bar. */}
      <section className="relative overflow-hidden bg-basic">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-accent to-secondary opacity-30 blur-2xl z-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-36 pb-24 text-center">
          <Link
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Built on Stellar — visit stellar.org"
            className="group mb-8 inline-flex items-center gap-3 rounded-2xl bg-surface-raised px-5 py-3 shadow-lg transition-transform hover:scale-105"
          >
            <span
              className={cn(
                poppins_500,
                "text-xs uppercase tracking-wider text-ink-muted"
              )}
            >
              Built on
            </span>
            {/* Palette PNG with an opaque white background — multiply drops the
                white into the chip so only the mark and wordmark show. */}
            <Image
              src="/images/images.png"
              alt="Stellar"
              width={738}
              height={228}
              className="h-6 w-auto mix-blend-multiply"
            />
          </Link>
          <h1
            className={cn(
              poppins_600,
              "mb-6 text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight text-ink-inverse font-stretch-125%"
            )}
          >
            Money that moves as fast as{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              knowledge
            </span>
          </h1>
          <p
            className={cn(
              poppins_400,
              "mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed text-ink-inverse-muted font-stretch-110%"
            )}
          >
            DeenBridge runs its payments on the Stellar network. That is how
            educators get paid in seconds, how sadaqah stays transparent, and
            how a learner anywhere in the world can enroll without a bank
            standing in the way.
          </p>
        </div>
      </section>

      <main id="main-content" className="flex-1">
        {/* What we use it for */}
        <section className="relative overflow-hidden bg-surface py-20 sm:py-24 px-4 sm:px-6">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute left-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-br from-secondary/10 to-transparent blur-3xl" />
            <div className="absolute bottom-0 right-0 h-1/3 w-1/3 rounded-full bg-gradient-to-tr from-accent/10 to-transparent blur-2xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent font-stretch-125%"
                )}
              >
                What we use it for
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                Three places the network does real work on this platform
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {uses.map((u) => (
                <div
                  key={u.title}
                  className="group rounded-3xl border border-accent/10 bg-surface-raised p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent shadow-md transition-transform group-hover:scale-110">
                    {u.icon}
                  </div>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-3 text-xl text-accent font-stretch-110%"
                    )}
                  >
                    {u.title}
                  </h3>
                  <p
                    className={cn(
                      poppins_400,
                      "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                    )}
                  >
                    {u.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How a payment works */}
        <section className="relative overflow-hidden bg-basic py-20 sm:py-24 px-4 sm:px-6">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-inverse font-stretch-125%"
                )}
              >
                How a payment works
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-inverse-muted font-stretch-110%"
                )}
              >
                You stay in control from the first tap to the last confirmation
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {flow.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-basic to-accent p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <span
                    className={cn(
                      poppins_600,
                      "mb-4 flex size-9 items-center justify-center rounded-full bg-secondary/20 text-sm text-ink-inverse"
                    )}
                  >
                    {f.id}
                  </span>
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
                      "text-sm leading-relaxed text-ink-inverse-muted"
                    )}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Stellar */}
        <section className="relative overflow-hidden bg-gradient-to-br from-surface via-surface-raised to-secondary/10 py-20 sm:py-24 px-4 sm:px-6">
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2
                className={cn(
                  poppins_600,
                  "mb-4 bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text pb-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent font-stretch-125%"
                )}
              >
                Why Stellar
              </h2>
              <p
                className={cn(
                  poppins_400,
                  "mx-auto max-w-2xl text-lg text-ink-muted font-stretch-110%"
                )}
              >
                We chose it for reasons that show up in your account, not in a
                whitepaper
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map((r) => (
                <div
                  key={r.title}
                  className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-secondary/10">
                    {r.icon}
                  </div>
                  <h3
                    className={cn(
                      poppins_600,
                      "mb-2 text-base text-accent font-stretch-110%"
                    )}
                  >
                    {r.title}
                  </h3>
                  <p
                    className={cn(
                      poppins_400,
                      "text-sm leading-relaxed text-ink-muted font-stretch-110%"
                    )}
                  >
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface px-4 sm:px-6 pb-24">
          <div className="mx-auto max-w-4xl rounded-3xl border border-accent/10 bg-surface-raised p-10 text-center shadow-xl">
            <h3
              className={cn(
                poppins_600,
                "mb-4 text-2xl sm:text-3xl font-bold text-ink font-stretch-125%"
              )}
            >
              Ready to connect your wallet?
            </h3>
            <p
              className={cn(
                poppins_400,
                "mx-auto mb-8 max-w-2xl text-ink-muted font-stretch-110%"
              )}
            >
              Set it up once and you can enroll, give sadaqah, and receive
              earnings without ever handing your funds to anyone.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                wide
                round
                to="/account/wallet"
                className="bg-gradient-to-r from-accent to-highlight hover:from-highlight hover:to-accent text-white px-10 py-3.5 text-base font-bold animate-in-out transition-all shadow-lg"
              >
                Set up your wallet
              </Button>
              <Button
                wide
                round
                outlined
                to="/dashboard/sadaqah"
                className="px-10 py-3.5 text-base font-bold transition-all"
              >
                Give Sadaqah
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
