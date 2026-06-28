"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStellar } from "@/components/stellar/StellarProvider";
import WalletConnectButton from "@/components/stellar/WalletConnectButton";
import TransactionHistory from "@/components/stellar/TransactionHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, ExternalLink, Info } from "lucide-react";
import useAuth from "@/hooks/useAuth";

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
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 12)}...${addr.slice(-12)}`;
  };

  const getExplorerUrl = (publicKey) => {
    const baseUrl =
      network === "mainnet"
        ? "https://stellar.expert/explorer/public/account/"
        : "https://stellar.expert/explorer/testnet/account/";
    return baseUrl + publicKey;
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Stellar Wallet
          </h1>
          <p className="text-muted-foreground">
            Manage your Stellar wallet and view transactions
          </p>
        </div>
        <WalletConnectButton />
      </div>

      {/* Network Info */}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <Info className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          You are connected to Stellar{" "}
          <Badge variant={network === "mainnet" ? "default" : "secondary"}>
            {network}
          </Badge>
        </span>
      </div>

      {/* Wallet Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
          <CardDescription>
            {connectedWallet
              ? "Your wallet is connected and ready to use"
              : "Connect your Stellar wallet to make payments"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedWallet ? (
            <div className="space-y-4">
              {/* Address */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <p className="font-mono text-sm">{truncateAddress(connectedWallet)}</p>
                </div>
                <a
                  href={getExplorerUrl(connectedWallet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">USDC Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    ${parseFloat(walletInfo?.usdcBalance || 0).toFixed(2)}
                  </p>
                  {!walletInfo?.hasTrustline && (
                    <p className="text-xs text-orange-500 mt-1">
                      No USDC trustline. Add USDC asset to your wallet.
                    </p>
                  )}
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">XLM Balance</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(walletInfo?.xlmBalance || 0).toFixed(4)} XLM
                  </p>
                </div>
              </div>

              {/* Trustline Warning */}
              {!walletInfo?.hasTrustline && (
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">USDC Trustline Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    To send or receive USDC payments, you need to add a USDC trustline to your wallet.
                    Open your wallet app (like Freighter) and add the USDC asset.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold">No Wallet Connected</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">
                Connect your Stellar wallet to make purchases and receive payments
              </p>
              <WalletConnectButton variant="default" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {connectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              View your payment history as a buyer or creator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory />
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium">Getting Started with Stellar</h4>
            <p className="text-sm text-muted-foreground">
              1. Install the{" "}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Freighter Wallet
              </a>{" "}
              browser extension
            </p>
            <p className="text-sm text-muted-foreground">
              2. Create or import a Stellar account
            </p>
            <p className="text-sm text-muted-foreground">
              3. Add USDC trustline in your wallet settings
            </p>
            <p className="text-sm text-muted-foreground">
              4. Fund your wallet with USDC to make purchases
            </p>
          </div>
          {network === "testnet" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Testnet Mode</h4>
              <p className="text-sm text-blue-700">
                You are on testnet. Get free test XLM from the{" "}
                <a
                  href="https://laboratory.stellar.org/#account-creator?network=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Stellar Laboratory
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
