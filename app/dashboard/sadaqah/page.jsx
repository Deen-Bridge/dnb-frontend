"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Button from "@/components/atoms/form/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "sonner";
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

  // Fund stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsUnconfigured, setStatsUnconfigured] = useState(false);

  // Donation flow state
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="rounded-xl p-6 sm:p-8 shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-8 w-8 text-brand-text" />
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">
            Sadaqah Jariyah
          </h1>
        </div>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          Give a charity that keeps on giving. Your donation funds scholarships
          for students of knowledge, held in a transparent on-chain USDC fund
          on the Stellar network. Every contribution is publicly verifiable,
          from your wallet to the scholarship pool.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            On-chain transparency
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Coins className="h-3 w-3" />
            USDC on Stellar
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Funds scholarships
          </Badge>
        </div>
      </div>

      {/* Fund Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : statsUnconfigured ? (
        <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning">
            The donation fund is not configured yet. Please check back soon,
            insha&apos;Allah.
          </p>
        </div>
      ) : statsError ? (
        <div className="p-4 border border-error/20 bg-error/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-error shrink-0" />
            <p className="text-sm text-error">{statsError}</p>
          </div>
          <Button round outlined onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 space-y-2 shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
            <p className="text-sm bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">
              Scholarship Pool Balance
            </p>
            <h3 className="text-2xl font-bold text-brand-text">
              ${formatAmount(stats?.poolBalance)}{" "}
              <span className="text-base font-medium">USDC</span>
            </h3>
          </div>
          <div className="rounded-xl p-4 space-y-2 shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
            <p className="text-sm bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">
              Total Donated
            </p>
            <h3 className="text-2xl font-bold text-brand-text">
              ${formatAmount(stats?.totalDonated)}{" "}
              <span className="text-base font-medium">USDC</span>
            </h3>
          </div>
          <div className="rounded-xl p-4 space-y-2 shadow-sm bg-gradient-to-br from-green-50 via-white to-green-100/80 backdrop-blur-xl">
            <p className="text-sm bg-gradient-to-r from-accent via-green-500 to-highlight text-transparent bg-clip-text">
              Donations
            </p>
            <h3 className="text-2xl font-bold text-brand-text">
              {stats?.donationCount ?? 0}
            </h3>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donate Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {step === "success" ? "Donation Complete!" : "Make a Donation"}
            </CardTitle>
            <CardDescription>
              {step === "amount" &&
                "Choose an amount to donate to the scholarship fund"}
              {step === "confirm" &&
                "Sign with your wallet, or scan the QR with a mobile wallet"}
              {step === "processing" && "Processing your donation..."}
              {step === "success" && "May Allah accept it from you"}
              {step === "error" && "Something went wrong"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount Selection */}
            {step === "amount" && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      round
                      outlined={!(customAmount === "" && selectedAmount === preset)}
                      className={customAmount === "" && selectedAmount === preset ? "bg-accent text-white h-12 text-base" : "h-12 text-base"}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="custom-amount"
                    className="text-sm text-muted-foreground"
                  >
                    Or enter a custom amount (USDC)
                  </label>
                  <Input
                    id="custom-amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 50"
                    value={customAmount}
                    onChange={handleCustomChange}
                  />
                </div>

                {/* Wallet Not Connected */}
                {!connectedWallet ? (
                  <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                    <p className="text-sm text-warning mb-3">
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
                          Connecting...
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
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        USDC Balance
                      </span>
                      <span
                        className={`font-semibold ${
                          hasInsufficientBalance
                            ? "text-error"
                            : "text-success"
                        }`}
                      >
                        {formatAmount(walletInfo?.usdcBalance)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Network
                      </span>
                      <Badge variant="secondary">{network}</Badge>
                    </div>
                    {hasInsufficientBalance && (
                      <p className="text-sm text-error">
                        Insufficient USDC balance for this amount.
                      </p>
                    )}
                  </div>
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

            {/* Confirm Step */}
            {step === "confirm" && donationData && (
              <>
                <div className="p-4 border border-info/20 bg-info/5 rounded-lg space-y-1">
                  <p className="text-sm text-info font-medium">
                    Please confirm the transaction in your wallet extension.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-info/80">
                    <span className="text-muted-foreground">Donating:</span>
                    <span className="font-semibold">
                      ${formatAmount(donationData.amount)} USDC
                    </span>
                  </div>
                </div>

                {donationData.sep7Uri && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-center mb-3">
                      Prefer mobile? Pay by QR instead
                    </p>
                    <Sep7QrCode uri={donationData.sep7Uri} />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    round
                    outlined
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button round onClick={handleConfirm} className="flex-1">
                    <Wallet className="mr-2 h-4 w-4" />
                    Sign & Donate
                  </Button>
                </div>
              </>
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                  {isProcessing
                    ? "Processing donation..."
                    : "Preparing transaction..."}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please check your wallet for the signing request
                </p>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 text-success mx-auto" />
                <h3 className="text-xl font-semibold mt-4">
                  JazakAllahu Khairan!
                </h3>
                <p className="text-muted-foreground mt-2">
                  Your donation was recorded on the Stellar network.
                </p>
                {result?.explorerUrl && (
                  <a
                    href={result.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary mt-4 hover:underline"
                  >
                    View on Stellar Explorer{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <Button round wide onClick={handleReset} className="mt-6">
                  Donate Again
                </Button>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && (
              <div className="text-center py-4">
                <AlertCircle className="h-16 w-16 text-error mx-auto" />
                <h3 className="text-xl font-semibold mt-4">Donation Failed</h3>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button round wide onClick={handleReset} className="mt-6">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>
              Latest contributions to the fund, verifiable on-chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : statsUnconfigured || statsError ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Donation activity is unavailable right now
                </p>
              </div>
            ) : !stats?.recent?.length ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">No donations yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to give Sadaqah Jariyah
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recent.map((donation, i) => (
                  <div
                    key={donation.txHash || i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-brand-text">
                        ${formatAmount(donation.amount)}{" "}
                        <span className="text-muted-foreground text-sm font-normal">
                          USDC
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    {donation.explorerUrl && (
                      <a
                        href={donation.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                        title="View on Stellar Explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
