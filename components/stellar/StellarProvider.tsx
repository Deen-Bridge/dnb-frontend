"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import axiosInstance from "@/lib/config/axios.config";
import {
  isNoWalletError,
  isUserRejection,
  WALLET_ERRORS,
  WALLET_INSTALL_LINKS,
  StellarErrorDetail,
} from "@/lib/stellar/stellarErrors";
import { StellarWalletInfo } from "@/types/stellar";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const EXPECTED_PASSPHRASE =
  NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;

export interface StellarContextType {
  kitInitialized: boolean;
  connectedWallet: string | null;
  walletInfo: StellarWalletInfo | null;
  isConnecting: boolean;
  isLoading: boolean;
  hasWalletExtension: boolean;
  walletNetwork: string | null;
  networkMismatch: boolean;
  connectWallet: () => Promise<void>;
  selectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  signTransaction: (xdr: string, networkPassphrase?: string) => Promise<string>;
  validateForPayment: (price?: number | string) => Promise<StellarErrorDetail[]>;
  network: string;
  expectedNetworkPassphrase: string;
}

const StellarContext = createContext<StellarContextType | null>(null);

export const useStellar = (): StellarContextType => {
  const context = useContext(StellarContext);
  if (!context) {
    throw new Error("useStellar must be used within StellarProvider");
  }
  return context;
};

export interface StellarProviderProps {
  children: ReactNode;
}

export default function StellarProvider({ children }: StellarProviderProps) {
  const { user, refreshUser } = useAuth();
  const [kitInitialized, setKitInitialized] = useState<boolean>(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<StellarWalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasWalletExtension, setHasWalletExtension] = useState<boolean>(false);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [networkMismatch, setNetworkMismatch] = useState<boolean>(false);

  // Detect wallet extensions and initialize kit
  useEffect(() => {
    async function detectWallets() {
      try {
        const modules = [
          new FreighterModule(),
          new xBullModule(),
          new AlbedoModule(),
        ];

        StellarWalletsKit.init({
          modules,
          network: EXPECTED_PASSPHRASE,
          selectedWalletId: FREIGHTER_ID,
        });

        setKitInitialized(true);

        try {
          if (typeof window !== "undefined" && (window as any).freighter) { // TODO(types): Ambient freighter extension window object
            const connected = await (window as any).freighter.isConnected(); // TODO(types): Freighter isConnected API
            setHasWalletExtension(connected);
          } else {
            setHasWalletExtension(false);
          }
        } catch {
          setHasWalletExtension(false);
        }
      } catch (error) {
        console.error("Failed to initialize Stellar Wallets Kit:", error);
      }
    }

    detectWallets();
  }, []);

  // Check if user already has connected wallet in database
  useEffect(() => {
    const checkStoredWallet = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get("/api/stellar/wallet/me");
        if (res.data.success && res.data.connected) {
          setConnectedWallet(res.data.wallet.publicKey);
          setWalletInfo(res.data.wallet);
        }
      } catch (error) {
        console.error("Failed to fetch wallet info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredWallet();
  }, [user?._id]);

  // Check network alignment when wallet connects
  useEffect(() => {
    if (!connectedWallet || !kitInitialized) return;

    async function checkNetwork() {
      try {
        await StellarWalletsKit.authModal().catch(() => ({}));
        setNetworkMismatch(false);
        setWalletNetwork(NETWORK);
      } catch (error: any) { // TODO(types): Error from authModal
        if (!isNoWalletError(error)) {
          const msg = error?.message || "";
          if (msg.includes("network") || msg.includes("mismatch")) {
            setNetworkMismatch(true);
          }
        }
      }
    }

    checkNetwork();
  }, [connectedWallet, kitInitialized]);

  // Open wallet auth modal and return address (no backend persistence)
  const selectWallet = useCallback(async (): Promise<string> => {
    if (!kitInitialized) {
      throw new Error("Wallet kit not initialized");
    }
    const { address } = await StellarWalletsKit.authModal();
    if (!address) {
      throw new Error("Failed to get wallet address");
    }
    return address;
  }, [kitInitialized]);

  // Connect wallet using the auth modal
  const connectWallet = useCallback(async (): Promise<void> => {
    if (!kitInitialized) {
      toast.error("Wallet kit not initialized. Please refresh the page.");
      return;
    }

    if (!user?._id) {
      toast.error("Please log in to connect your wallet");
      return;
    }

    setIsConnecting(true);
    try {
      const { address } = await StellarWalletsKit.authModal();

      if (!address) {
        throw new Error("Failed to get wallet address");
      }

      const res = await axiosInstance.post("/api/stellar/wallet/connect", {
        publicKey: address,
      });

      if (res.data.success) {
        setConnectedWallet(address);
        setWalletInfo(res.data.wallet);
        setWalletNetwork(NETWORK);
        setNetworkMismatch(false);
        toast.success("Wallet connected successfully!");

        if (user?._id) {
          await refreshUser(user._id);
        }
      } else {
        throw new Error(res.data.message || "Failed to connect wallet");
      }
    } catch (error: any) { // TODO(types): Wallet connect error
      if (isNoWalletError(error)) {
        const installInfo = WALLET_INSTALL_LINKS;
        toast.error(
          "No Stellar wallet detected. Install Freighter to continue.",
          {
            duration: 8000,
            action: {
              label: "Install Freighter",
              onClick: () => window.open(installInfo.freighter.url, "_blank"),
            },
          }
        );
      } else if (isUserRejection(error)) {
        // Silent — user cancelled
      } else {
        console.error("Wallet connection error:", error);
        toast.error(error.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [kitInitialized, user, refreshUser]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      await axiosInstance.delete("/api/stellar/wallet/disconnect");

      StellarWalletsKit.disconnect();

      setConnectedWallet(null);
      setWalletInfo(null);
      setWalletNetwork(null);
      setNetworkMismatch(false);
      toast.success("Wallet disconnected");

      if (user?._id) {
        await refreshUser(user._id);
      }
    } catch (error: any) { // TODO(types): Disconnect error
      console.error("Disconnect wallet error:", error);
      toast.error("Failed to disconnect wallet");
    }
  }, [user, refreshUser]);

  // Refresh balance
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!connectedWallet) return;

    try {
      const res = await axiosInstance.get(
        `/api/stellar/wallet/balance/${connectedWallet}`
      );
      if (res.data.success) {
        setWalletInfo((prev) => (prev ? { ...prev, ...res.data } : res.data));
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [connectedWallet]);

  // Sign transaction with user rejection handling
  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string): Promise<string> => {
      if (!kitInitialized) {
        throw new Error("Wallet kit not initialized");
      }

      try {
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
          networkPassphrase,
        });

        return signedTxXdr;
      } catch (error: any) { // TODO(types): Sign transaction error
        if (isUserRejection(error)) {
          const rejectionError: any = new Error(WALLET_ERRORS.user_rejected.message); // TODO(types): Error with code
          rejectionError.code = "USER_REJECTED";
          rejectionError.title = WALLET_ERRORS.user_rejected.title;
          rejectionError.nextStep = WALLET_ERRORS.user_rejected.nextStep;
          throw rejectionError;
        }
        throw error;
      }
    },
    [kitInitialized]
  );

  // Validate pre-payment conditions
  const validateForPayment = useCallback(
    async (price?: number | string): Promise<StellarErrorDetail[]> => {
      const issues: StellarErrorDetail[] = [];
      const numPrice = typeof price === "string" ? parseFloat(price) : (price || 0);

      if (!connectedWallet) {
        issues.push({
          ...WALLET_ERRORS.wallet_not_installed,
          type: "no_wallet",
        });
      }

      if (networkMismatch) {
        issues.push({
          ...WALLET_ERRORS.network_mismatch,
          message: `Your wallet is on the wrong network. Please switch to ${NETWORK}.`,
        });
      }

      if (walletInfo && !walletInfo.hasTrustline) {
        issues.push(WALLET_ERRORS.trustline_missing);
      }

      if (
        connectedWallet &&
        walletInfo &&
        parseFloat(walletInfo.usdcBalance || "0") < numPrice
      ) {
        issues.push({
          ...WALLET_ERRORS.insufficient_balance,
          message: `You need $${numPrice} USDC but only have $${parseFloat(walletInfo.usdcBalance || "0").toFixed(2)}.`,
        });
      }

      return issues;
    },
    [connectedWallet, networkMismatch, walletInfo]
  );

  const value: StellarContextType = {
    kitInitialized,
    connectedWallet,
    walletInfo,
    isConnecting,
    isLoading,
    hasWalletExtension,
    walletNetwork,
    networkMismatch,
    connectWallet,
    selectWallet,
    disconnectWallet,
    refreshBalance,
    signTransaction,
    validateForPayment,
    network: NETWORK,
    expectedNetworkPassphrase: EXPECTED_PASSPHRASE,
  };

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  );
}
