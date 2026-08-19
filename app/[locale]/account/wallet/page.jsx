"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStellar } from "@/components/stellar/StellarProvider";
import WalletConnectButton from "@/components/stellar/WalletConnectButton";
import TransactionHistory from "@/components/stellar/TransactionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  ExternalLink,
  Info,
  Coins,
  Receipt,
  LifeBuoy,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config";
import { getExplorerUrl } from "@/lib/utils/stellarExplorer";

/* ── building blocks (design-system consistent) ── */

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

const CardHeading = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-5 flex items-start gap-3">
    {Icon && (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
        <Icon className="h-5 w-5 text-accent" />
      </div>
    )}
    <div>
      <h2 className={cn(poppins_600, "text-lg text-ink")}>{title}</h2>
      {subtitle && (
        <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

export default function WalletPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { connectedWallet, walletInfo, isLoading, network } = useStellar();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return (
      <div className="bg-surface p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-11 w-64 rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 12)}...${addr.slice(-12)}`;
  };

  return (
    <div className="min-h-full bg-surface p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
              <Wallet className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1
                className={cn(
                  poppins_600,
                  "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
                )}
              >
                Stellar Wallet
              </h1>
              <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                Manage your Stellar wallet and view transactions
              </p>
            </div>
          </div>
          <WalletConnectButton />
        </div>

        {/* ── Network Info ── */}
        <div className="flex items-center gap-2 rounded-xl border border-accent/10 bg-surface-raised px-4 py-3">
          <Info className="h-4 w-4 shrink-0 text-ink-muted" />
          <span className={cn(poppins_400, "text-sm text-ink-muted")}>
            You are connected to Stellar
          </span>
          <span
            className={cn(
              poppins_500,
              "rounded-full border px-3 py-0.5 text-xs capitalize",
              network === "mainnet"
                ? "border-secondary/20 bg-secondary/10 text-secondary"
                : "border-amber-200 bg-amber-100 text-amber-700"
            )}
          >
            {network}
          </span>
        </div>

        {/* ── Wallet Status Card ── */}
        <Panel className="p-6">
          <CardHeading
            icon={Coins}
            title="Wallet Status"
            subtitle={
              connectedWallet
                ? "Your wallet is connected and ready to use"
                : "Connect your Stellar wallet to make payments"
            }
          />

          {connectedWallet ? (
            <div className="space-y-4">
              {/* Address */}
              <div className="flex flex-col gap-3 rounded-xl border border-accent/10 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className={cn(poppins_400, "text-xs uppercase tracking-wider text-ink-muted")}>
                    Wallet Address
                  </p>
                  <p className={cn(poppins_500, "mt-1 break-all font-mono text-sm text-ink")}>
                    {truncateAddress(connectedWallet)}
                  </p>
                </div>
                <a
                  href={getExplorerUrl(connectedWallet, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    poppins_500,
                    "inline-flex shrink-0 items-center gap-1 text-sm text-secondary transition-colors hover:text-highlight"
                  )}
                >
                  View on Explorer
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-accent/10 bg-surface p-4">
                  <p className={cn(poppins_400, "text-xs uppercase tracking-wider text-ink-muted")}>
                    USDC Balance
                  </p>
                  <p className={cn(poppins_600, "mt-1 text-3xl text-secondary")}>
                    ${parseFloat(walletInfo?.usdcBalance || 0).toFixed(2)}
                  </p>
                  {!walletInfo?.hasTrustline && (
                    <p className={cn(poppins_400, "mt-1 text-xs text-amber-600")}>
                      No USDC trustline. Add USDC asset to your wallet.
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-accent/10 bg-surface p-4">
                  <p className={cn(poppins_400, "text-xs uppercase tracking-wider text-ink-muted")}>
                    XLM Balance
                  </p>
                  <p className={cn(poppins_600, "mt-1 text-3xl text-ink")}>
                    {parseFloat(walletInfo?.xlmBalance || 0).toFixed(4)}{" "}
                    <span className={cn(poppins_500, "text-lg text-ink-muted")}>
                      XLM
                    </span>
                  </p>
                </div>
              </div>

              {/* Trustline Warning */}
              {!walletInfo?.hasTrustline && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <h4 className={cn(poppins_600, "text-sm text-amber-800")}>
                      USDC Trustline Required
                    </h4>
                    <p className={cn(poppins_400, "mt-1 text-sm text-amber-700")}>
                      To send or receive USDC payments, you need to add a USDC
                      trustline to your wallet. Open your wallet app (like
                      Freighter) and add the USDC asset.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-accent/15 py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/15 to-highlight/10">
                <Wallet className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h3 className={cn(poppins_600, "text-lg text-ink")}>
                  No Wallet Connected
                </h3>
                <p className={cn(poppins_400, "mx-auto mt-1 max-w-sm text-sm text-ink-muted")}>
                  Connect your Stellar wallet to make purchases and receive
                  payments
                </p>
              </div>
              <WalletConnectButton variant="default" />
            </div>
          )}
        </Panel>

        {/* ── Transaction History ── */}
        {connectedWallet && (
          <Panel className="p-6">
            <CardHeading
              icon={Receipt}
              title="Transactions"
              subtitle="View your payment history as a buyer or creator"
            />
            <TransactionHistory />
          </Panel>
        )}

        {/* ── Help Section ── */}
        <Panel className="p-6">
          <CardHeading
            icon={LifeBuoy}
            title="Need Help?"
            subtitle="Get set up with Stellar in a few simple steps"
          />
          <div className="space-y-4">
            <div>
              <h4 className={cn(poppins_600, "text-sm text-ink")}>
                Getting Started with Stellar
              </h4>
              <ol className="mt-3 space-y-2">
                <li className="flex items-start gap-3">
                  <span
                    className={cn(
                      poppins_600,
                      "flex size-6 shrink-0 items-center justify-center rounded-lg border border-accent/10 bg-surface text-xs text-accent"
                    )}
                  >
                    1
                  </span>
                  <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                    Install the{" "}
                    <a
                      href="https://www.freighter.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(poppins_500, "text-secondary hover:text-highlight hover:underline")}
                    >
                      Freighter Wallet
                    </a>{" "}
                    browser extension
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className={cn(
                      poppins_600,
                      "flex size-6 shrink-0 items-center justify-center rounded-lg border border-accent/10 bg-surface text-xs text-accent"
                    )}
                  >
                    2
                  </span>
                  <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                    Create or import a Stellar account
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className={cn(
                      poppins_600,
                      "flex size-6 shrink-0 items-center justify-center rounded-lg border border-accent/10 bg-surface text-xs text-accent"
                    )}
                  >
                    3
                  </span>
                  <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                    Add USDC trustline in your wallet settings
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span
                    className={cn(
                      poppins_600,
                      "flex size-6 shrink-0 items-center justify-center rounded-lg border border-accent/10 bg-surface text-xs text-accent"
                    )}
                  >
                    4
                  </span>
                  <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                    Fund your wallet with USDC to make purchases
                  </p>
                </li>
              </ol>
            </div>

            {network === "testnet" && (
              <div className="flex items-start gap-3 rounded-xl border border-accent/10 bg-surface p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
                  <ArrowRight className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h4 className={cn(poppins_600, "text-sm text-ink")}>
                    Testnet Mode
                  </h4>
                  <p className={cn(poppins_400, "mt-1 text-sm text-ink-muted")}>
                    You are on testnet. Get free test XLM from the{" "}
                    <a
                      href="https://laboratory.stellar.org/#account-creator?network=test"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(poppins_500, "text-secondary hover:text-highlight hover:underline")}
                    >
                      Stellar Laboratory
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
