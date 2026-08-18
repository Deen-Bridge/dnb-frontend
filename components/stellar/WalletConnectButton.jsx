"use client";
import { useStellar } from "./StellarProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  LogOut,
  RefreshCw,
  ExternalLink,
  Copy,
  Loader2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { WALLET_INSTALL_LINKS } from "@/lib/stellar/stellarErrors";
import { getExplorerUrl } from "@/lib/utils/stellarExplorer";

export default function WalletConnectButton({ variant = "outline", size = "default" }) {
  const {
    connectedWallet,
    walletInfo,
    isConnecting,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    network,
    hasWalletExtension,
    networkMismatch,
  } = useStellar();

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(connectedWallet);
    toast.success("Address copied to clipboard");
  };

  const viewOnExplorer = () => {
    window.open(getExplorerUrl(connectedWallet, network), "_blank");
  };

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  // No wallet installed — show install prompt
  if (!connectedWallet && !hasWalletExtension) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-2">
            <Download className="h-4 w-4" />
            Install Wallet
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-xs text-muted-foreground">
              No Stellar wallet detected. Install one to continue:
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => window.open(WALLET_INSTALL_LINKS.freighter.url, "_blank")}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Install Freighter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(WALLET_INSTALL_LINKS.xbull.url, "_blank")}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Install xBull
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(WALLET_INSTALL_LINKS.albedo.url, "_blank")}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Use Albedo (web)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={connectWallet} className="cursor-pointer">
            <Wallet className="mr-2 h-4 w-4" />
            Already installed? Connect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not connected — show connect button
  if (!connectedWallet) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Connected — show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              networkMismatch ? "bg-yellow-500" : "bg-green-500"
            }`}
          />
          {truncateAddress(connectedWallet)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-2">
            {networkMismatch && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-yellow-800 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Wrong network. Switch wallet to <strong>{network}</strong>.
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network</span>
              <Badge variant={network === "mainnet" ? "default" : "secondary"}>
                {network}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">USDC Balance</span>
              <span className="font-bold text-primary">
                {parseFloat(walletInfo?.usdcBalance || 0).toFixed(2)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">XLM Balance</span>
              <span className="font-medium">
                {parseFloat(walletInfo?.xlmBalance || 0).toFixed(4)} XLM
              </span>
            </div>
            {walletInfo && !walletInfo.hasTrustline && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-orange-800 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>USDC trustline not set up.</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={refreshBalance} className="cursor-pointer">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Balance
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnectWallet}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
