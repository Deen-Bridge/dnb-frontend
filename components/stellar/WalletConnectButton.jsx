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
import { Wallet, LogOut, RefreshCw, ExternalLink, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    const baseUrl =
      network === "mainnet"
        ? "https://stellar.expert/explorer/public/account/"
        : "https://stellar.expert/explorer/testnet/account/";
    window.open(baseUrl + connectedWallet, "_blank");
  };

  // Show loading state
  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  // Show connect button if not connected
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

  // Show connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <span dir="ltr">{truncateAddress(connectedWallet)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network</span>
              <Badge variant={network === "mainnet" ? "default" : "secondary"}>
                {network}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">USDC Balance</span>
              <span dir="ltr" className="font-bold text-primary">
                {parseFloat(walletInfo?.usdcBalance || 0).toFixed(2)} USDC
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">XLM Balance</span>
              <span dir="ltr" className="font-medium">
                {parseFloat(walletInfo?.xlmBalance || 0).toFixed(4)} XLM
              </span>
            </div>
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
