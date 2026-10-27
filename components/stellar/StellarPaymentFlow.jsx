"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { FaCogs, FaWallet, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { config } from "@/lib/config/env";
import { getHorizonBaseUrl } from "@/lib/stellar/horizon";
import Button from "@/components/atoms/form/Button";

// Mirrors hooks/useStellarPayment.ts: prepare (backend XDR) -> sign in the
// user's wallet -> submit the signed XDR -> settle.
const steps = [
  { id: "prepare", icon: FaCogs },
  { id: "sign", icon: FaWallet },
  { id: "submit", icon: FaPaperPlane },
  { id: "settle", icon: FaCheckCircle },
];

const STEP_INTERVAL_MS = 3000;
const POLL_INTERVAL_MS = 10000;
const REQUEST_TIMEOUT_MS = 8000;

// Polls the latest ledger from Horizon. On any failure the state drops to
// "error" with no ledger, so a stale number is never shown as live.
const useLatestLedger = () => {
  const [state, setState] = useState({
    status: "loading",
    ledger: null,
    closedAt: null,
  });

  useEffect(() => {
    let cancelled = false;
    let timer;
    let controller;
    const url = `${getHorizonBaseUrl(config.stellarNetwork)}/ledgers?order=desc&limit=1`;

    const load = async () => {
      controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Horizon responded with ${res.status}`);
        const body = await res.json();
        const record = body?._embedded?.records?.[0];
        if (
          !record ||
          typeof record.sequence !== "number" ||
          typeof record.closed_at !== "string"
        ) {
          throw new Error("Unexpected Horizon ledger payload");
        }
        if (!cancelled) {
          setState({
            status: "live",
            ledger: record.sequence,
            closedAt: record.closed_at,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ status: "error", ledger: null, closedAt: null });
        }
      } finally {
        clearTimeout(abortTimer);
      }
      if (!cancelled) timer = setTimeout(load, POLL_INTERVAL_MS);
    };

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  return state;
};

const LiveLedger = ({ t, network }) => {
  const { status, ledger, closedAt } = useLatestLedger();

  if (status !== "live") {
    return (
      <p
        className={cn(poppins_400, "text-sm text-ink-inverse-muted")}
        data-status={status}
      >
        {status === "loading"
          ? t("flow.live.loading", { network })
          : t("flow.live.unavailable")}
      </p>
    );
  }

  const explorerNetwork = network === "mainnet" ? "public" : "testnet";
  return (
    <p className={cn(poppins_400, "text-sm text-ink-inverse-muted")}>
      <span className="mr-2 inline-block size-2 rounded-full bg-secondary motion-safe:animate-pulse" aria-hidden="true" />
      {t.rich("flow.live.ledger", {
        network,
        // Figures are LTR islands so digits never visually reverse inside the
        // right-to-left (Arabic) sentence.
        ledger: <span dir="ltr">{ledger.toLocaleString("en-US")}</span>,
        time: <span dir="ltr">{new Date(closedAt).toISOString().slice(11, 19)}</span>,
      })}{" "}
      <Link
        href={`https://stellar.expert/explorer/${explorerNetwork}/ledger/${ledger}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-secondary underline decoration-secondary/40 underline-offset-4 hover:decoration-secondary"
      >
        {t("flow.live.link")}
      </Link>
    </p>
  );
};

const StellarPaymentFlow = () => {
  const t = useTranslations("landing.stellar");
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Auto-advance only when motion is allowed. With reduced motion every step
  // is already visible, so nothing is hidden behind the animation.
  useEffect(() => {
    if (reduceMotion || !autoplay) return undefined;
    const id = setInterval(
      () => setActive((i) => (i + 1) % steps.length),
      STEP_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [reduceMotion, autoplay]);

  const network = config.stellarNetwork === "mainnet" ? "mainnet" : "testnet";
  const progress = ((active + 1) / steps.length) * 100;

  return (
    <section
      id="stellar"
      className="relative w-full overflow-hidden bg-basic py-20 sm:py-28 px-4 sm:px-6"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-accent/20 blur-2xl" />
        <div
          className="absolute inset-0 opacity-25 bg-[linear-gradient(rgba(0,153,0,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,153,0,0.12)_1px,transparent_1px)]"
          style={{ backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <h2
            className={cn(
              poppins_600,
              "mb-6 text-4xl sm:text-5xl font-bold leading-tight text-ink-inverse font-stretch-125%"
            )}
          >
            {t("heading.lead")}{" "}
            <span className="bg-gradient-to-r from-secondary via-highlight to-secondary bg-clip-text text-transparent">
              {t("heading.emphasis")}
            </span>
          </h2>
          <p
            className={cn(
              poppins_400,
              "mb-8 text-lg leading-relaxed text-ink-inverse-muted"
            )}
          >
            {t("flow.intro")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              wide
              round
              to="/signup"
              className="bg-gradient-to-r from-secondary to-highlight hover:from-highlight hover:to-secondary text-white px-10 py-3.5 text-base font-bold shadow-lg"
            >
              {t("cta.primary")}
            </Button>
            <Link
              href="/stellar"
              className={cn(
                poppins_500,
                "rounded-full border border-secondary/40 px-8 py-3.5 text-base text-ink-inverse transition-all hover:border-secondary hover:bg-secondary/10"
              )}
            >
              {t("cta.secondary")}
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-secondary/20 bg-secondary/5 p-6 sm:p-8 backdrop-blur-sm">
          <h3
            className={cn(
              poppins_600,
              "mb-6 text-xl text-ink-inverse font-stretch-110%"
            )}
          >
            {t("flow.title")}
          </h3>

          <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-secondary/20" aria-hidden="true">
            <div
              className="h-full rounded-full bg-secondary motion-safe:transition-[width] motion-safe:duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const isActive = index === active;
              const Icon = step.icon;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      setAutoplay(false);
                      setActive(index);
                    }}
                    className={cn(
                      "group h-full w-full rounded-2xl border p-5 text-left motion-safe:transition-all motion-safe:duration-300 focus-visible:outline-2 focus-visible:outline-secondary",
                      isActive
                        ? "border-secondary bg-secondary/15 shadow-lg"
                        : "border-secondary/20 bg-gradient-to-br from-basic to-accent"
                    )}
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/20",
                          isActive && "motion-safe:animate-pulse"
                        )}
                      >
                        <Icon className="h-5 w-5 text-ink-inverse" aria-hidden="true" />
                      </div>
                      <span
                        className={cn(
                          poppins_600,
                          "flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs text-accent"
                        )}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <h4
                      className={cn(
                        poppins_600,
                        "mb-2 text-base text-ink-inverse font-stretch-110%"
                      )}
                    >
                      {t(`flow.steps.${step.id}.title`)}
                    </h4>
                    <p
                      className={cn(
                        poppins_400,
                        "text-sm leading-relaxed text-ink-inverse-muted"
                      )}
                    >
                      {t(`flow.steps.${step.id}.desc`)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 border-t border-secondary/20 pt-6">
            <LiveLedger t={t} network={network} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StellarPaymentFlow;
