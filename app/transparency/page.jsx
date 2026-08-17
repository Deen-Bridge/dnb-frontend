import { Suspense } from "react";
import Link from "next/link";
import { HeartHandshake, ShieldCheck, Radio, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { siteName } from "@/lib/config/site.config";
import { config } from "@/lib/config/env";
import Navbar from "@/components/molecules/ladingpage/Navbar";
import Footer from "../(pages)/(landingPage)/Footer";
import LiveDonationFeed from "@/components/transparency/LiveDonationFeed";
import TransparencySkeleton from "@/components/transparency/TransparencySkeleton";
import {
  fetchDonationStats,
  fetchRecentDonations,
  getHorizonBaseUrl,
  normalizeDonation,
  resolveDonationWallet,
} from "@/lib/stellar/horizon";
import { getExplorerTransactionUrl } from "@/lib/utils/stellarExplorer";

export const metadata = {
  title: "Sadaqah Transparency — Live Donations on Stellar",
  description:
    "Watch every Sadaqah Jariyah donation arrive live from the Stellar network. No account needed — verify every contribution on-chain via stellar.expert.",
  alternates: { canonical: "/transparency" },
  openGraph: {
    title: "Sadaqah Transparency — Live Donations on Stellar",
    description:
      "A public, on-chain live feed of every USDC donation reaching the Sadaqah fund. Verify each one yourself on stellar.expert.",
    url: "/transparency",
    siteName,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Deen Bridge Sadaqah Transparency" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sadaqah Transparency — Live Donations on Stellar",
    description:
      "A public, on-chain live feed of every USDC donation reaching the Sadaqah fund.",
    images: ["/og.png"],
  },
};

/**
 * Server-rendered feed. Resolves the donation wallet (env var → backend stats
 * → not-configured state), fetches recent incoming USDC payments from Horizon
 * REST, and hands the list to the client island that keeps it live via SSE.
 * Never throws: Horizon/backend outages degrade to the last-known list or a
 * friendly empty state instead of blanking the page.
 */
async function TransparencyFeed() {
  const network = config.stellarNetwork;
  const stats = await fetchDonationStats();
  const wallet = resolveDonationWallet(stats);

  if (!wallet) {
    return <NotConfiguredState />;
  }

  const records = await fetchRecentDonations({ wallet, network });
  const initialItems = records.map((record) => ({
    ...normalizeDonation(record),
    explorerUrl: getExplorerTransactionUrl(
      record.transaction_hash || record.transaction?.hash,
      network
    ),
  }));

  return (
    <LiveDonationFeed
      wallet={wallet}
      network={network}
      horizonBase={getHorizonBaseUrl(network)}
      initialItems={initialItems}
      stats={stats}
    />
  );
}

export default function TransparencyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-basic">
      <Navbar solid />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-basic pt-32 pb-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-accent to-secondary opacity-30 blur-2xl" />
            <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
            <Link
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                poppins_500,
                "mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-1.5 text-xs uppercase tracking-wider text-ink-inverse"
              )}
            >
              <Radio className="h-3.5 w-3.5 text-secondary" />
              Live from Stellar Horizon
            </Link>

            <h1
              className={cn(
                poppins_600,
                "mx-auto max-w-3xl text-3xl font-bold leading-tight text-ink-inverse sm:text-5xl"
              )}
            >
              Watch every donation,{" "}
              <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
                live on-chain
              </span>
            </h1>
            <p
              className={cn(
                poppins_400,
                "mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-inverse-muted sm:text-lg"
              )}
            >
              Every Sadaqah Jariyah contribution flows straight into a public
              USDC fund on the Stellar network. This page streams those payments
              in real time — no login, no filter, no middleman. Verify each one
              yourself on stellar.expert.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: ShieldCheck, text: "Verified on stellar.expert" },
                { icon: HeartHandshake, text: "Funds scholarships" },
                { icon: Radio, text: "Updates within seconds" },
              ].map((chip) => (
                <span
                  key={chip.text}
                  className={cn(
                    poppins_500,
                    "inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs text-ink-inverse"
                  )}
                >
                  <chip.icon className="h-3.5 w-3.5 text-secondary" />
                  {chip.text}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/dashboard/sadaqah"
                className={cn(
                  poppins_600,
                  "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary to-highlight px-8 py-3.5 text-sm text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
                )}
              >
                Give Sadaqah
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <Suspense fallback={<TransparencySkeleton />}>
          <TransparencyFeed />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function NotConfiguredState() {
  return (
    <section className="bg-surface px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-accent/20 bg-surface-raised p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
          <Radio className="h-7 w-7 text-accent" />
        </div>
        <h2 className={cn(poppins_600, "text-xl text-ink")}>
          Transparency feed not configured yet
        </h2>
        <p className={cn(poppins_400, "mt-3 text-sm leading-relaxed text-ink-muted")}>
          The live donation feed isn&apos;t wired up yet — the on-chain fund is
          still being set up. Check back soon, insha&apos;Allah, and every
          contribution will appear here in real time.
        </p>
        <Link
          href="/dashboard/sadaqah"
          className={cn(
            poppins_500,
            "mt-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-5 py-2.5 text-sm text-accent transition-colors hover:bg-secondary/20"
          )}
        >
          Learn about Sadaqah Jariyah
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
