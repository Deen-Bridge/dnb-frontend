"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  HeartHandshake,
  ExternalLink,
  Radio,
  Wallet,
  Coins,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import {
  isIncomingUsdcPayment,
  normalizeDonation,
} from "@/lib/stellar/horizon";
import { getExplorerTransactionUrl } from "@/lib/utils/stellarExplorer";
import { Skeleton } from "@/components/ui/skeleton";

// recharts is code-split so it never ships in the initial JS payload.
const DonationChart = dynamic(
  () => import("@/components/transparency/DonationChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-56 w-full rounded-xl" />,
  }
);

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;
const MAX_FEED_ITEMS = 100;

const getReconnectDelay = (attempts) =>
  Math.min(RECONNECT_DELAY * Math.pow(2, attempts), 30000);

const round = (value) => Math.round(value * 100) / 100;

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const truncateAddress = (addr) => {
  if (!addr) return "unknown";
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
};

/**
 * Client island that owns the live Horizon SSE stream. The server renders the
 * initial feed; this component opens a real EventSource to Horizon and prepends
 * new incoming USDC payments as they settle, with no page refresh. Connection
 * lifecycle and reconnect/backoff mirror hooks/useNotificationSSE.js.
 */
export default function LiveDonationFeed({
  wallet,
  network,
  horizonBase,
  initialItems = [],
  stats = null,
}) {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastCursorRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const [items, setItems] = useState(initialItems);
  const [connectionState, setConnectionState] = useState("connecting");
  const [connectionError, setConnectionError] = useState(null);
  const [liveTotal, setLiveTotal] = useState(0);
  const [liveCount, setLiveCount] = useState(0);

  const statsOk = stats?.success !== false;
  const baseTotal = useMemo(() => {
    if (statsOk && !Number.isNaN(Number.parseFloat(stats?.totalDonated))) {
      return Number.parseFloat(stats.totalDonated);
    }
    return round(initialItems.reduce((sum, item) => sum + (item.amount || 0), 0));
  }, [statsOk, stats?.totalDonated, initialItems]);

  const baseCount = useMemo(() => {
    if (statsOk && typeof stats?.donationCount === "number") {
      return stats.donationCount;
    }
    return initialItems.length;
  }, [statsOk, stats?.donationCount, initialItems]);

  const handleConnectionError = useCallback(() => {
    setConnectionState("reconnecting");
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const attempts = reconnectAttemptsRef.current;
    if (attempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = getReconnectDelay(attempts);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current = attempts + 1;
        connectSSERef.current();
      }, delay);
    } else {
      setConnectionState("disconnected");
      setConnectionError(
        "Live updates are temporarily unavailable. Showing the latest on-chain donations — refresh to catch up."
      );
    }
  }, []);

  const connectSSE = useCallback(() => {
    if (!wallet || eventSourceRef.current) return;

    setConnectionState("connecting");
    const cursor = lastCursorRef.current || "now";
    const url = `${horizonBase}/accounts/${encodeURIComponent(
      wallet
    )}/payments?cursor=${cursor}&order=asc`;

    let eventSource;
    try {
      eventSource = new EventSource(url);
    } catch (error) {
      console.error("Failed to open Horizon SSE stream:", error);
      handleConnectionError();
      return;
    }
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionState("connected");
      setConnectionError(null);
      reconnectAttemptsRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      let record;
      try {
        record = JSON.parse(event.data);
      } catch (error) {
        console.error("Failed to parse Horizon SSE message:", error);
        return;
      }

      if (record?.paging_token) {
        lastCursorRef.current = record.paging_token;
      }

      if (!isIncomingUsdcPayment(record, wallet)) return;

      const hash = record.transaction_hash || record.transaction?.hash;
      const item = {
        ...normalizeDonation(record),
        explorerUrl: getExplorerTransactionUrl(hash, network),
      };

      setItems((prev) => {
        if (prev.some((p) => p.hash && p.hash === item.hash)) return prev;
        return [item, ...prev].slice(0, MAX_FEED_ITEMS);
      });
      setLiveTotal((total) => round(total + item.amount));
      setLiveCount((count) => count + 1);
    };

    eventSource.onerror = () => {
      handleConnectionError();
    };
  }, [wallet, horizonBase, network, handleConnectionError]);

  const connectSSERef = useRef(connectSSE);
  connectSSERef.current = connectSSE;

  useEffect(() => {
    connectSSERef.current();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  const chartItems = items;

  const displayedTotal = round(baseTotal + liveTotal);
  const displayedCount = baseCount + liveCount;
  const poolBalance =
    statsOk && !Number.isNaN(Number.parseFloat(stats?.poolBalance))
      ? Number.parseFloat(stats.poolBalance)
      : null;

  const connectionLabel = {
    connected: "Live",
    connecting: "Connecting…",
    reconnecting: "Reconnecting…",
    disconnected: "Paused",
  }[connectionState];

  return (
    <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── Running totals ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Coins}
            label="Total received"
            value={`$${displayedTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            hint="USDC · all time"
          />
          <StatCard
            icon={HeartHandshake}
            label="Donations"
            value={displayedCount.toLocaleString("en-US")}
            hint={liveCount > 0 ? `${liveCount} new this session` : "verified on-chain"}
          />
          <StatCard
            icon={Wallet}
            label="Pool balance"
            value={
              poolBalance === null
                ? "—"
                : `$${poolBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
            }
            hint="USDC · held on Stellar"
          />
        </div>
        <p className={cn(poppins_400, "text-center text-xs text-ink-muted")}>
          All-time totals come from the fund&apos;s on-chain donation stats and update
          as new payments stream in live.
        </p>

        {/* ── Chart ── */}
        <div className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className={cn(poppins_600, "text-lg text-ink")}>
              Donations over time
            </h2>
            <span
              className={cn(
                poppins_400,
                "rounded-full border border-accent/15 bg-surface px-3 py-1 text-xs text-ink-muted"
              )}
            >
              Last 14 days
            </span>
          </div>
          {chartItems.length > 0 ? (
            <DonationChart items={chartItems} />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-accent/15 text-center">
              <p className={cn(poppins_500, "text-sm text-ink-muted")}>
                No donations in the recent window yet
              </p>
              <p className={cn(poppins_400, "mt-1 text-xs text-ink-muted/70")}>
                The first on-chain contribution will appear here
              </p>
            </div>
          )}
        </div>

        {/* ── Live feed ── */}
        <div className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={cn(poppins_600, "text-lg text-ink")}>
                Live donation feed
              </h2>
              <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
                Every incoming USDC payment to the fund, streamed straight from
                Stellar Horizon.
              </p>
            </div>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                connectionState === "connected"
                  ? "border-secondary/30 bg-secondary/10 text-secondary"
                  : connectionState === "disconnected"
                    ? "border-red-500/30 bg-red-500/10 text-red-600"
                    : "border-accent/20 bg-accent/10 text-ink-muted"
              )}
              title={
                connectionError ||
                `Streaming incoming USDC payments to ${wallet}`
              }
            >
              {connectionState === "connected" ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              <span className={cn(poppins_500)}>{connectionLabel}</span>
              {connectionState === "connected" && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                </span>
              )}
            </div>
          </div>

          {connectionError && (
            <div className="mb-4 rounded-xl border border-accent/15 bg-surface px-4 py-3">
              <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                {connectionError}
              </p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-accent/15 py-12 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                <Radio className="h-6 w-6 text-accent" />
              </div>
              <p className={cn(poppins_500, "text-ink")}>
                No donations yet
              </p>
              <p className={cn(poppins_400, "mx-auto mt-1 max-w-sm text-sm text-ink-muted")}>
                Be the first to give Sadaqah Jariyah — your payment will appear
                here within seconds, straight from the Stellar network.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li
                  key={item.id || item.hash || index}
                  className={cn(
                    "animate-in fade-in slide-in-from-top-2 duration-500 flex items-center justify-between gap-3 rounded-xl border border-accent/10 bg-surface p-3.5 transition-colors hover:border-secondary/30",
                    index === 0 && liveCount > 0 && "border-secondary/40 bg-secondary/5"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                      <HeartHandshake className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn(poppins_600, "truncate text-ink")}>
                        ${(item.amount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className={cn(poppins_400, "text-xs text-ink-muted")}>
                          USDC
                        </span>
                      </p>
                      <p className={cn(poppins_400, "truncate text-xs text-ink-muted")}>
                        <span className="font-mono">{truncateAddress(item.from)}</span>
                        {" · "}
                        <span>{timeAgo(item.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  {item.explorerUrl && item.hash ? (
                    <a
                      href={item.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-accent/15 bg-surface-raised px-2.5 py-1.5 text-xs text-secondary transition-colors hover:border-secondary/40 hover:text-highlight"
                      title="Verify on stellar.expert"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verify
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <p className={cn(poppins_400, "mt-4 text-center text-xs text-ink-muted")}>
            Each row links to the actual transaction on stellar.expert — you can
            verify every donation yourself on the {network} network.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-accent/10 bg-surface-raised p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <p className={cn(poppins_500, "text-xs uppercase tracking-wider text-ink-muted")}>
          {label}
        </p>
      </div>
      <p className={cn(poppins_600, "truncate text-3xl text-ink")}>{value}</p>
      <p className={cn(poppins_400, "mt-1 text-xs text-ink-muted")}>{hint}</p>
    </div>
  );
}
