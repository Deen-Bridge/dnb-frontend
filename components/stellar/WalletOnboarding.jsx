"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, Wallet, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { useStellar } from "@/components/stellar/StellarProvider";
import { useWalletReadiness, WALLET_STATES } from "@/hooks/useWalletReadiness";
import { toast } from "sonner";
import { TransactionBuilder, Asset, Networks, Horizon } from "@stellar/stellar-sdk";

const STEPS = [
  { id: "connect", label: "Connect wallet" },
  { id: "fund", label: "Fund account" },
  { id: "trust", label: "Enable USDC" },
  { id: "done", label: "Done" },
];

export default function WalletOnboarding({ isOpen, onOpenChange }) {
  const { connectWallet, isConnecting, network, connectedWallet, signTransaction, refreshBalance } = useStellar();
  const { state, account, refresh, isLoading: isReadinessLoading } = useWalletReadiness();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isFunding, setIsFunding] = useState(false);
  const [isTrusting, setIsTrusting] = useState(false);
  const usdcIssuer = process.env.NEXT_PUBLIC_USDC_ISSUER;

  const getExplorerUrl = (txHash) => {
    return network === "mainnet"
      ? `https://stellar.expert/explorer/public/tx/${txHash}`
      : `https://stellar.expert/explorer/testnet/tx/${txHash}`;
  };

  const handleFundTestnet = async () => {
    if (!connectedWallet) return;
    setIsFunding(true);
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(connectedWallet)}`);
      if (!res.ok) {
        throw new Error("Friendbot rate-limited or failed. Please try again later.");
      }
      toast.success("Account funded successfully!");
      await refresh();
      await refreshBalance();
    } catch (err) {
      toast.error(err.message || "Failed to fund account");
    } finally {
      setIsFunding(false);
    }
  };

  const handleEnableUSDC = async () => {
    if (!account || !connectedWallet) return;
    setIsTrusting(true);
    try {
      const horizonUrl = network === "mainnet"
        ? "https://horizon.stellar.org"
        : "https://horizon-testnet.stellar.org";
      const server = new Horizon.Server(horizonUrl);
      
      const networkPassphrase = network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

      const usdcAsset = new Asset("USDC", usdcIssuer);
      
      const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase,
      })
        .addOperation(
          Operation.changeTrust({
            asset: usdcAsset,
          })
        )
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();

      // Sign using StellarProvider
      const signedXdr = await signTransaction(xdr, networkPassphrase);

      // Submit to horizon
      const tx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
      const submitResponse = await server.submitTransaction(tx);

      toast.success("USDC trustline created successfully!");

      // Poll until trustline is visible (wait a couple of seconds and refresh)
      // Usually it's immediate after submitResponse, but we can do a quick refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refresh();
      await refreshBalance();

    } catch (err) {
      console.error("Trustline error:", err);
      
      // Handle user rejection
      if (err?.code === -1 && err?.message?.includes("closed") || err?.message?.includes("reject") || err?.message?.includes("cancelled")) {
        toast.error("Signature request was rejected in your wallet.");
        return;
      }
      
      // Handle op_low_reserve
      const resultCodes = err?.response?.data?.extras?.result_codes;
      if (resultCodes?.operations?.includes("op_low_reserve")) {
        toast.error("Underfunded account. You need more XLM to add a trustline.");
        // Route back to fund step by manually triggering refresh which updates state
        await refresh();
        return;
      }

      // Handle horizon timeout
      if (err?.response?.status === 504 || err?.message?.includes("timeout")) {
        const hash = err?.response?.data?.hash;
        if (hash) {
          toast.error(
            <div className="flex flex-col gap-1">
              <span>Transaction timed out waiting for network confirmation.</span>
              <a 
                href={getExplorerUrl(hash)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-xs"
              >
                Check status on stellar.expert
              </a>
            </div>
          );
        } else {
          toast.error("Transaction timed out. Please check your wallet.");
        }
        return;
      }

      toast.error(err?.response?.data?.title || err.message || "Failed to enable USDC");
    } finally {
      setIsTrusting(false);
    }
  };


  // Map state to step index
  useEffect(() => {
    switch (state) {
      case WALLET_STATES.NO_WALLET:
        setActiveStepIndex(0);
        break;
      case WALLET_STATES.ACCOUNT_NOT_FOUND:
      case WALLET_STATES.LOW_XLM:
        setActiveStepIndex(1);
        break;
      case WALLET_STATES.NO_TRUSTLINE:
        setActiveStepIndex(2);
        break;
      case WALLET_STATES.READY:
        setActiveStepIndex(3);
        break;
      default:
        setActiveStepIndex(0);
    }
  }, [state]);

  const progressPercentage = ((activeStepIndex + 1) / STEPS.length) * 100;

  const handleConnect = async () => {
    await connectWallet();
    await refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set up your Stellar Wallet</DialogTitle>
          <DialogDescription>
            Complete these steps to use USDC on DeenBridge.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 mt-2">
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isActive = index === activeStepIndex;
            const isCompleted = index < activeStepIndex;
            const isPending = index > activeStepIndex;

            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  isActive
                    ? "border-primary shadow-sm"
                    : isCompleted
                    ? "opacity-75"
                    : "opacity-50"
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : isActive ? (
                      <Circle className="h-5 w-5 text-primary fill-primary/10" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={`font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Actions for active step */}
                  {isActive && step.id === "connect" && (
                    <Button
                      size="sm"
                      onClick={handleConnect}
                      disabled={isConnecting || isReadinessLoading}
                    >
                      {isConnecting || isReadinessLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  )}

                  {isActive && step.id === "fund" && (
                    <div className="flex flex-col items-end gap-2 w-full ml-4">
                      {network === "testnet" ? (
                        <div className="w-full">
                          <p className="text-sm text-muted-foreground mb-3 text-left">
                            Your testnet account needs XLM to perform transactions. We can fund it for free using Friendbot.
                          </p>
                          <Button
                            size="sm"
                            onClick={handleFundTestnet}
                            disabled={isFunding || isReadinessLoading}
                            className="w-full"
                          >
                            {isFunding || isReadinessLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Funding...
                              </>
                            ) : (
                              "Fund with Friendbot"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full space-y-3 text-left">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Your account needs a minimum balance of <strong>~1.5 XLM</strong> to exist and add a USDC trustline.
                            </p>
                            <p className="text-xs text-blue-700 mt-2">
                              Stellar requires a small base reserve for active accounts to prevent spam.
                              <a
                                href="https://developers.stellar.org/docs/learn/fundamentals/lumens#base-reserves"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 underline font-medium"
                              >
                                Learn more about reserves.
                              </a>
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            Please send at least 2 XLM to your address:
                          </p>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md border text-xs font-mono break-all">
                            {connectedWallet}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={refresh}
                            disabled={isReadinessLoading}
                          >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            I have funded my account
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {isActive && step.id === "trust" && (
                    <div className="flex flex-col gap-3 w-full ml-4">
                      <p className="text-sm text-muted-foreground text-left">
                        A USDC trustline allows your wallet to hold and transfer USDC.
                      </p>
                      <div className="p-3 border rounded-lg bg-muted/50 space-y-2 text-sm text-left">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Asset Code</span>
                          <span className="font-semibold">USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Issuer</span>
                          <span className="font-mono text-xs">{usdcIssuer?.slice(0, 8)}...{usdcIssuer?.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Network</span>
                          <span className="capitalize">{network}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleEnableUSDC}
                        disabled={isTrusting || isReadinessLoading}
                        className="w-full mt-2"
                      >
                        {isTrusting || isReadinessLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          "Add USDC Trustline"
                        )}
                      </Button>
                    </div>
                  )}

                  {isActive && step.id === "done" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Close
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
