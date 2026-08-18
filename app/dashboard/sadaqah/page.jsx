"use client";
import { useState, useEffect, useCallback } from "react";
import Button from "@/components/atoms/form/Button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HeartHandshake,
  Loader2,
  Wallet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Coins,
  TrendingUp,
  Users,
  MousePointerClick,
  PenLine,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { useStellar } from "@/components/stellar/StellarProvider";
import useStellarDonation from "@/hooks/useStellarDonation";
import Sep7QrCode from "@/components/stellar/Sep7QrCode";

const PRESET_AMOUNTS = [5, 10, 25, 100];

const formatAmount = (value) => {
  const num = parseFloat(value || 0);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ── building blocks ── */

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

const Chip = ({ icon: Icon, children }) => (
  <span
    className={cn(
      poppins_500,
      "inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs text-accent"
    )}
  >
    <Icon className="h-3.5 w-3.5 text-accent" />
    {children}
  </span>
);

const SectionHeading = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
    {subtitle && (
      <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
        {subtitle}
      </p>
    )}
  </div>
);

const HOW_IT_WORKS = [
  { icon: MousePointerClick, text: "Choose an amount to give" },
  { icon: PenLine, text: "Sign the payment in your Stellar wallet" },
  { icon: Landmark, text: "It funds the on-chain scholarship pool" },
];

export default function SadaqahPage() {
  const { connectedWallet, walletInfo, connectWallet, network, isConnecting } =
    useStellar();
  const {
    initializeDonation,
    executeDonation,
    cancelDonation,
    getDonationStats,
    isProcessing,
  } = useStellarDonation();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsUnconfigured, setStatsUnconfigured] = useState(false);

  const [step, setStep] = useState("amount"); // amount | confirm | processing | success | error
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [donationData, setDonationData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    setStatsUnconfigured(false);

    const data = await getDonationStats();
    if (data.success === false) {
      if (data.unconfigured) {
        setStatsUnconfigured(true);
      } else {
        setStatsError(data.message || "Failed to load fund stats");
      }
    } else {
      setStats(data);
    }
    setStatsLoading(false);
  }, [getDonationStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const amount = customAmount !== "" ? parseFloat(customAmount) : selectedAmount;
  const isValidAmount = !isNaN(amount) && amount > 0;
  const hasInsufficientBalance =
    connectedWallet &&
    isValidAmount &&
    parseFloat(walletInfo?.usdcBalance || 0) < amount;

  const handlePresetSelect = (value) => {
    setSelectedAmount(value);
    setCustomAmount("");
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleInitiate = async () => {
    if (!isValidAmount) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    setStep("processing");
    const data = await initializeDonation({ amount });
    if (data) {
      setDonationData(data);
      setStep("confirm");
    } else {
      setStep("amount");
    }
  };

  const handleConfirm = async () => {
    setStep("processing");
    const success = await executeDonation(donationData);
    if (success) {
      setResult(success);
      setStep("success");
      setDonationData(null);
      fetchStats();
    } else {
      setStep("error");
      setError("Transaction failed. Please try again.");
    }
  };

  const handleBack = () => {
    cancelDonation();
    setDonationData(null);
    setStep("amount");
  };

  const handleReset = () => {
    cancelDonation();
    setDonationData(null);
    setResult(null);
    setError(null);
    setStep("amount");
  };

  const presetActive = (preset) =>
    customAmount === "" && selectedAmount === preset;

  /* ── Featured pool panel (right of hero) ── */
  const PoolPanel = () => (
    <Panel className="flex h-full flex-col justify-center bg-gradient-to-br from-basic to-accent p-6 text-ink-inverse">
      {statsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-3 w-28 bg-white/20" />
          <Skeleton className="h-9 w-40 bg-white/20" />
          <Skeleton className="h-10 w-full bg-white/10" />
        </div>
      ) : statsUnconfigured ? (
        <div className="flex items-center gap-2 text-ink-inverse-muted">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className={cn(poppins_400, "text-sm")}>
            Fund not configured yet — check back soon, insha&apos;Allah.
          </p>
        </div>
      ) : statsError ? (
        <div className="space-y-3">
          <p className={cn(poppins_400, "text-sm text-ink-inverse-muted")}>
            {statsError}
          </p>
          <button
            onClick={fetchStats}
            className={cn(
              poppins_500,
              "inline-flex items-center gap-2 text-sm text-ink-inverse hover:opacity-80"
            )}
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : (
        <>
          <p
            className={cn(
              poppins_500,
              "text-xs uppercase tracking-wider text-ink-inverse-muted"
            )}
          >
            Scholarship Pool Balance
          </p>
          <p className={cn(poppins_600, "mt-1 text-4xl leading-none")}>
            ${formatAmount(stats?.poolBalance)}
            <span
              className={cn(poppins_500, "ml-1 text-lg text-ink-inverse-muted")}
            >
              USDC
            </span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className={cn(poppins_400, "text-[11px] text-ink-inverse-muted")}>
                Total donated
              </p>
              <p className={cn(poppins_600, "text-base text-ink-inverse")}>
                ${formatAmount(stats?.totalDonated)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className={cn(poppins_400, "text-[11px] text-ink-inverse-muted")}>
                Donations
              </p>
              <p className={cn(poppins_600, "text-base text-ink-inverse")}>
                {stats?.donationCount ?? 0}
              </p>
            </div>
          </div>
        </>
      )}
    </Panel>
  );

  return (
    <div className="space-y-6 bg-surface p-4 sm:p-6">
      {/* ── Hero + featured pool (2/3 · 1/3) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-surface-raised to-highlight/10 p-6 sm:p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
                <HeartHandshake className="h-6 w-6 text-accent" />
              </div>
              <h1
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent sm:text-3xl"
                )}
              >
                Sadaqah Jariyah
              </h1>
            </div>
            <p
              className={cn(
                poppins_400,
                "mt-3 max-w-xl leading-relaxed text-ink-muted"
              )}
            >
              Give a charity that keeps on giving. Your donation funds
              scholarships for students of knowledge, held in a transparent
              on-chain USDC fund on Stellar — publicly verifiable, from your
              wallet to the pool.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip icon={ShieldCheck}>On-chain transparency</Chip>
              <Chip icon={Coins}>USDC on Stellar</Chip>
              <Chip icon={Sparkles}>Funds scholarships</Chip>
            </div>
            <a
              href="/transparency"
              className={cn(
                poppins_500,
                "mt-5 inline-flex items-center gap-1.5 text-sm text-accent underline-offset-4 transition-colors hover:text-secondary hover:underline"
              )}
            >
              Watch donations arrive live
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </Panel>

        <PoolPanel />
      </div>

      {/* ── Give (2/3) · sidebar (1/3) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Give */}
        <Panel className="p-6 lg:col-span-2">
          <SectionHeading
            title={step === "success" ? "Donation Complete!" : "Make a Donation"}
            subtitle={
              {
                amount: "Choose an amount to donate to the scholarship fund",
                confirm: "Sign with your wallet, or scan the QR with a mobile wallet",
                processing: "Processing your donation…",
                success: "May Allah accept it from you",
                error: "Something went wrong",
              }[step]
            }
          />

          <div className="space-y-5">
            {step === "amount" && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={cn(
                        poppins_600,
                        "flex h-16 flex-col items-center justify-center rounded-xl border text-lg transition-all",
                        presetActive(preset)
                          ? "border-accent bg-accent text-white shadow-md"
                          : "border-accent/15 bg-surface text-ink hover:border-secondary/50 hover:bg-secondary/5"
                      )}
                    >
                      ${preset}
                      <span
                        className={cn(
                          poppins_400,
                          "text-[10px] uppercase tracking-wider",
                          presetActive(preset)
                            ? "text-white/70"
                            : "text-ink-muted"
                        )}
                      >
                        USDC
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="custom-amount"
                    className={cn(poppins_500, "text-sm text-ink-muted")}
                  >
                    Or enter a custom amount
                  </label>
                  <div className="relative">
                    <span
                      className={cn(
                        poppins_600,
                        "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
                      )}
                    >
                      $
                    </span>
                    <input
                      id="custom-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 50"
                      value={customAmount}
                      onChange={handleCustomChange}
                      className={cn(
                        poppins_500,
                        "w-full rounded-xl border border-accent/15 bg-surface py-3 pl-8 pr-16 text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      )}
                    />
                    <span
                      className={cn(
                        poppins_500,
                        "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-ink-muted"
                      )}
                    >
                      USDC
                    </span>
                  </div>
                </div>

                {!connectedWallet ? (
                  <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                    <p className={cn(poppins_500, "mb-3 text-sm text-accent")}>
                      Connect your Stellar wallet to donate
                    </p>
                    <Button
                      round
                      onClick={connectWallet}
                      wide
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting…
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/10 bg-surface px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-accent" />
                      <span className={cn(poppins_400, "text-sm text-ink-muted")}>
                        Balance
                      </span>
                      <span
                        className={cn(
                          poppins_600,
                          "text-sm",
                          hasInsufficientBalance ? "text-red-600" : "text-ink"
                        )}
                      >
                        {formatAmount(walletInfo?.usdcBalance)} USDC
                      </span>
                    </div>
                    <span
                      className={cn(
                        poppins_500,
                        "rounded-full border border-accent/15 bg-surface-raised px-3 py-0.5 text-xs capitalize text-accent"
                      )}
                    >
                      {network}
                    </span>
                  </div>
                )}

                {connectedWallet && hasInsufficientBalance && (
                  <p className={cn(poppins_400, "text-sm text-red-600")}>
                    Insufficient USDC balance for this amount.
                  </p>
                )}

                {connectedWallet && (
                  <Button
                    round
                    wide
                    onClick={handleInitiate}
                    disabled={
                      !isValidAmount || hasInsufficientBalance || isProcessing
                    }
                  >
                    {hasInsufficientBalance ? (
                      "Insufficient Balance"
                    ) : (
                      <>
                        Donate {isValidAmount ? `$${formatAmount(amount)}` : ""}{" "}
                        USDC
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

            {step === "confirm" && donationData && (
              <>
                <div className="space-y-1 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                  <p className={cn(poppins_500, "text-sm text-accent")}>
                    Please confirm the transaction in your wallet extension.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={cn(poppins_400, "text-ink-muted")}>
                      Donating:
                    </span>
                    <span className={cn(poppins_600, "text-ink")}>
                      ${formatAmount(donationData.amount)} USDC
                    </span>
                  </div>
                </div>

                {donationData.sep7Uri && (
                  <div className="rounded-xl border border-accent/10 bg-surface p-4">
                    <p
                      className={cn(
                        poppins_500,
                        "mb-3 text-center text-sm text-ink"
                      )}
                    >
                      Prefer mobile? Pay by QR instead
                    </p>
                    <Sep7QrCode uri={donationData.sep7Uri} />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button round outlined onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  <Button round onClick={handleConfirm} className="flex-1">
                    <Wallet className="mr-2 h-4 w-4" />
                    Sign &amp; Donate
                  </Button>
                </div>
              </>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                <p className={cn(poppins_500, "mt-4 text-ink")}>
                  {isProcessing
                    ? "Processing donation…"
                    : "Preparing transaction…"}
                </p>
                <p className={cn(poppins_400, "mt-2 text-xs text-ink-muted")}>
                  Please check your wallet for the signing request
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="py-6 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary/10">
                  <CheckCircle className="h-9 w-9 text-secondary" />
                </div>
                <h3 className={cn(poppins_600, "mt-4 text-xl text-ink")}>
                  JazakAllahu Khairan!
                </h3>
                <p className={cn(poppins_400, "mt-2 text-ink-muted")}>
                  Your donation was recorded on the Stellar network.
                </p>
                {result?.explorerUrl && (
                  <a
                    href={result.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      poppins_500,
                      "mt-4 inline-flex items-center gap-1 text-sm text-secondary hover:text-highlight"
                    )}
                  >
                    View on Stellar Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <Button round wide onClick={handleReset} className="mt-6">
                  Donate Again
                </Button>
              </div>
            )}

            {step === "error" && (
              <div className="py-6 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle className="h-9 w-9 text-red-600" />
                </div>
                <h3 className={cn(poppins_600, "mt-4 text-xl text-ink")}>
                  Donation Failed
                </h3>
                <p className={cn(poppins_400, "mt-2 text-ink-muted")}>{error}</p>
                <Button round wide onClick={handleReset} className="mt-6">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </Panel>

        {/* Sidebar: recent + how it works */}
        <div className="space-y-6">
          <Panel className="p-6">
            <SectionHeading
              title="Recent Donations"
              subtitle="Latest contributions, verifiable on-chain"
            />
            {statsLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : statsUnconfigured || statsError ? (
              <div className="rounded-xl border border-dashed border-accent/15 py-8 text-center">
                <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                  Donation activity is unavailable right now
                </p>
              </div>
            ) : !stats?.recent?.length ? (
              <div className="rounded-xl border border-dashed border-accent/15 py-10 text-center">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                  <HeartHandshake className="h-5 w-5 text-accent" />
                </div>
                <p className={cn(poppins_500, "text-ink")}>No donations yet</p>
                <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
                  Be the first to give Sadaqah Jariyah
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recent.map((donation, i) => (
                  <div
                    key={donation.txHash || i}
                    className="flex items-center justify-between rounded-xl border border-accent/10 bg-surface p-3 transition-colors hover:border-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-highlight/10">
                        <HeartHandshake className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className={cn(poppins_600, "text-ink")}>
                          ${formatAmount(donation.amount)}{" "}
                          <span
                            className={cn(poppins_400, "text-xs text-ink-muted")}
                          >
                            USDC
                          </span>
                        </p>
                        <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                          {formatDate(donation.createdAt)}
                        </p>
                      </div>
                    </div>
                    {donation.explorerUrl && (
                      <a
                        href={donation.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary transition-colors hover:text-highlight"
                        title="View on Stellar Explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="p-6">
            <SectionHeading title="How it works" />
            <ol className="space-y-4">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                    <s.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div className="pt-1">
                    <p className={cn(poppins_500, "text-sm text-ink")}>
                      <span className="text-ink-muted">{i + 1}.</span> {s.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p
              className={cn(
                poppins_400,
                "mt-5 border-t border-accent/10 pt-4 text-xs leading-relaxed text-ink-muted"
              )}
            >
              Non-custodial: you sign every payment yourself. DeenBridge never
              holds your funds — they go straight to the on-chain pool.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
