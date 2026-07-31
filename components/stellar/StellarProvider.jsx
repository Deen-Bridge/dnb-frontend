"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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
} from "@/lib/stellar/stellarErrors";

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const EXPECTED_PASSPHRASE =
  NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;

const StellarContext = createContext(null);

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) {
    throw new Error("useStellar must be used within StellarProvider");
  }
  return context;
};

export default function StellarProvider({ children }) {
  const { user, refreshUser } = useAuth();
  const [kitInitialized, setKitInitialized] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWalletExtension, setHasWalletExtension] = useState(false);
  const [walletNetwork, setWalletNetwork] = useState(null);
  const [networkMismatch, setNetworkMismatch] = useState(false);

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

        // Check if Freighter is actually installed
        try {
          if (typeof window !== "undefined" && window.freighter) {
            const connected = await window.freighter.isConnected();
            setHasWalletExtension(connected);
          } else {
            // Check for any wallet by trying to detect
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
        const { address } = await StellarWalletsKit.authModal().catch(() => ({}));
        // If we can reach this, wallet is available.
        // The kit was initialized with the correct network, so if auth succeeds
        // the wallet should be on the right network.
        setNetworkMismatch(false);
        setWalletNetwork(NETWORK);
      } catch (error) {
        if (!isNoWalletError(error)) {
          // Some other issue — could be network mismatch
          const msg = error?.message || "";
          if (msg.includes("network") || msg.includes("mismatch")) {
            setNetworkMismatch(true);
          }
        }
      }
    }

    checkNetwork();
  }, [connectedWallet, kitInitialized]);

  // Connect wallet using the auth modal
  const connectWallet = useCallback(async () => {
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

      // Save to backend
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
    } catch (error) {
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
  }, [kitInitialized, user, refreshUser, selectWallet]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
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
    } catch (error) {
      console.error("Disconnect wallet error:", error);
      toast.error("Failed to disconnect wallet");
    }
  }, [user, refreshUser]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!connectedWallet) return;

    try {
      const res = await axiosInstance.get(
        `/api/stellar/wallet/balance/${connectedWallet}`
      );
      if (res.data.success) {
        setWalletInfo((prev) => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    }
  }, [connectedWallet]);

  // Sign transaction with user rejection handling
  const signTransaction = useCallback(
    async (xdr, networkPassphrase) => {
      if (!kitInitialized) {
        throw new Error("Wallet kit not initialized");
      }

      try {
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
          networkPassphrase,
        });

        return signedTxXdr;
      } catch (error) {
        if (isUserRejection(error)) {
          const rejectionError = new Error(WALLET_ERRORS.user_rejected.message);
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
    async (price) => {
      const issues = [];

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
        parseFloat(walletInfo.usdcBalance || 0) < (price || 0)
      ) {
        issues.push({
          ...WALLET_ERRORS.insufficient_balance,
          message: `You need $${price} USDC but only have $${parseFloat(walletInfo.usdcBalance || 0).toFixed(2)}.`,
        });
      }

      return issues;
    },
    [connectedWallet, networkMismatch, walletInfo]
  );

  const value = {
    kitInitialized,
    connectedWallet,
    walletInfo,
    isConnecting,
    isLoading,
    hasWalletExtension,
    walletNetwork,
    networkMismatch,
    connectWallet,
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
