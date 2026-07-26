"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Wallet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  QrCode,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { useStellar } from "./StellarProvider";
import useStellarPayment from "@/hooks/useStellarPayment";
import Sep7QrCode from "./Sep7QrCode";
import {
  mapStellarError,
  isUserRejection,
  WALLET_INSTALL_LINKS,
} from "@/lib/stellar/stellarErrors";

export default function PaymentModal({
  isOpen,
  onClose,
  item,
  itemType,
  onSuccess,
}) {
  const {
    connectedWallet,
    walletInfo,
    connectWallet,
    network,
    isConnecting,
    hasWalletExtension,
    networkMismatch,
    validateForPayment,
  } = useStellar();
  const { initializePayment, executePayment, isProcessing } =
    useStellarPayment();

  const [step, setStep] = useState("preview");
  const [paymentData, setPaymentData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [preCheckIssues, setPreCheckIssues] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep("preview");
      setPaymentData(null);
      setResult(null);
      setError(null);
      setErrorDetail(null);
      setShowQr(false);
      setPreCheckIssues([]);
    }
  }, [isOpen]);

  // Run pre-payment validation when modal opens
  useEffect(() => {
    if (isOpen && connectedWallet) {
      validateForPayment(item?.price).then((issues) => {
        setPreCheckIssues(issues);
      });
    }
  }, [isOpen, connectedWallet, item?.price, validateForPayment]);

  const handleInitiate = async () => {
    setStep("processing");
    setError(null);
    setErrorDetail(null);
    const data = await initializePayment({
      itemType,
      itemId: item._id,
    });

    if (data) {
      setPaymentData(data);
      setStep("confirm");
    } else {
      setStep("preview");
    }
  };

  const handleConfirm = async () => {
    setStep("processing");
    setError(null);
    setErrorDetail(null);

    try {
      const success = await executePayment(paymentData);

      if (success) {
        setResult(success);
        setStep("success");
        onSuccess?.(success);
      } else {
        setStep("error");
        setError("Transaction failed. Please try again.");
      }
    } catch (err) {
      const mapped = mapStellarError(err);
      if (mapped) {
        setError(mapped.message);
        setErrorDetail(mapped);
      } else if (isUserRejection(err)) {
        setStep("preview");
        setError(null);
        setErrorDetail(null);
        return;
      } else {
        setError(err.message || "Transaction failed. Please try again.");
      }
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("preview");
    setPaymentData(null);
    setResult(null);
    setError(null);
    setErrorDetail(null);
    setShowQr(false);
    setPreCheckIssues([]);
    onClose();
  };

  const sep7Uri = paymentData?.sep7Uri || paymentData?.payment?.sep7Uri;

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const hasInsufficientBalance =
    connectedWallet &&
    parseFloat(walletInfo?.usdcBalance || 0) < (item?.price || 0);

  const hasBlockingIssues = preCheckIssues.some(
    (i) => i.type === "no_wallet" || i.type === "network" || i.type === "trustline"
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "success"
              ? "Payment Complete!"
              : `Purchase ${itemType === "book" ? "Book" : "Course"}`}
          </DialogTitle>
          <DialogDescription>
            {step === "preview" && "Review your purchase details"}
            {step === "confirm" && "Confirm payment in your wallet"}
            {step === "processing" && "Processing your payment..."}
            {step === "success" && "Your purchase was successful"}
            {step === "error" && "Something went wrong"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Details */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold line-clamp-2">{item?.title}</h4>
            <div className="flex justify-between items-center mt-2">
              <Badge variant="outline">
                {itemType === "book" ? "Book" : "Course"}
              </Badge>
              <span className="text-2xl font-bold text-primary">
                ${item?.price} USDC
              </span>
            </div>
          </div>

          {/* No Wallet Extension Installed */}
          {!connectedWallet && step === "preview" && !hasWalletExtension && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <WifiOff className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    No Stellar wallet detected
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Install a Stellar wallet extension to make purchases on
                    DeenBridge.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={WALLET_INSTALL_LINKS.freighter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-orange-800 hover:underline"
                >
                  Install Freighter
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={WALLET_INSTALL_LINKS.xbull.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-700 hover:underline"
                >
                  Install xBull
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={WALLET_INSTALL_LINKS.albedo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-700 hover:underline"
                >
                  Use Albedo (web wallet)
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Wallet Not Connected (extension exists) */}
          {!connectedWallet && step === "preview" && hasWalletExtension && (
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700 mb-3">
                Connect your Stellar wallet to continue
              </p>
              <Button
                onClick={connectWallet}
                className="w-full"
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
          )}

          {/* Network Mismatch Warning */}
          {connectedWallet && networkMismatch && step === "preview" && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Wrong Network
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Your wallet is on a different network. Please switch to{" "}
                    <strong>{network}</strong> in your wallet settings and try
                    again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pre-check Issues (trustline, balance) */}
          {connectedWallet &&
            !networkMismatch &&
            step === "preview" &&
            preCheckIssues.length > 0 && (
              <div className="space-y-2">
                {preCheckIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-sm ${
                      issue.type === "trustline"
                        ? "border-orange-200 bg-orange-50 text-orange-800"
                        : issue.type === "balance"
                          ? "border-red-200 bg-red-50 text-red-800"
                          : "border-yellow-200 bg-yellow-50 text-yellow-800"
                    }`}
                  >
                    <p className="font-medium">{issue.title}</p>
                    <p className="mt-1 text-xs opacity-80">{issue.message}</p>
                    {issue.nextStep && (
                      <p className="mt-1 text-xs font-medium">
                        {issue.nextStep}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

          {/* Wallet Connected - Preview */}
          {connectedWallet &&
            !networkMismatch &&
            step === "preview" && (
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Your Wallet
                  </span>
                  <span className="font-mono text-sm">
                    {truncateAddress(connectedWallet)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    USDC Balance
                  </span>
                  <span
                    className={`font-semibold ${
                      hasInsufficientBalance ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {parseFloat(walletInfo?.usdcBalance || 0).toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <Badge variant="secondary">{network}</Badge>
                </div>
                {!walletInfo?.hasTrustline && (
                  <p className="text-sm text-orange-500 mt-2">
                    ⚠ No USDC trustline. Add USDC asset in your wallet first.
                  </p>
                )}
                {hasInsufficientBalance && (
                  <p className="text-sm text-red-500 mt-2">
                    Insufficient USDC balance. Please add funds to your wallet.
                  </p>
                )}
              </div>
            )}

          {/* Confirm Step */}
          {step === "confirm" && paymentData && (
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg space-y-2">
              <p className="text-sm text-blue-700 font-medium">
                Please confirm the transaction in your wallet extension.
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sending:</span>
                  <span className="font-semibold">
                    ${paymentData.item.price} USDC
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono text-xs">
                    {truncateAddress(paymentData.creator.wallet)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Creator:</span>
                  <span className="font-semibold">
                    {paymentData.creator.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pay by QR (SEP-7) */}
          {step === "confirm" && sep7Uri && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQr((prev) => !prev)}
                className="w-full text-muted-foreground"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {showQr ? "Hide QR code" : "Pay by QR instead"}
              </Button>
              {showQr && (
                <div className="p-4 border rounded-lg">
                  <Sep7QrCode uri={sep7Uri} />
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                {isProcessing
                  ? "Processing payment..."
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
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold mt-4">Payment Successful!</h3>
              <p className="text-muted-foreground mt-2">
                You now have access to &quot;{item?.title}&quot;
              </p>
              {result?.transaction?.explorerUrl && (
                <a
                  href={result.transaction.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary mt-4 hover:underline"
                >
                  View on Stellar Explorer{" "}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Error Step */}
          {step === "error" && (
            <div className="text-center py-4">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold mt-4">
                {errorDetail?.title || "Payment Failed"}
              </h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              {errorDetail?.nextStep && (
                <p className="text-sm text-accent font-medium mt-2">
                  {errorDetail.nextStep}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {step === "preview" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {connectedWallet && !networkMismatch ? (
                  <Button
                    onClick={handleInitiate}
                    className="flex-1"
                    disabled={hasBlockingIssues || hasInsufficientBalance}
                  >
                    {hasInsufficientBalance ? (
                      "Insufficient Balance"
                    ) : hasBlockingIssues ? (
                      "Fix Issues Above"
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : !connectedWallet ? (
                  <Button
                    onClick={connectWallet}
                    className="flex-1"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    Connect Wallet
                  </Button>
                ) : null}
              </>
            )}

            {step === "confirm" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep("preview")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  <Wallet className="mr-2 h-4 w-4" />
                  Sign & Pay
                </Button>
              </>
            )}

            {(step === "success" || step === "error") && (
              <Button onClick={handleClose} className="w-full">
                {step === "success" ? "Done" : "Close"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
