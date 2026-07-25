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

const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const IS_E2E = process.env.NEXT_PUBLIC_E2E_WALLET === "true";

// E2E test-mode wallet — when NEXT_PUBLIC_E2E_WALLET=true, replaces the
// browser-extension StellarWalletsKit with a deterministic stub.
// Guarded by process.env so it tree-shakes in production builds.
let _E2E_getWalletKit = null;
if (IS_E2E) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createE2EWalletKit } = require("./e2eWallet");
  _E2E_getWalletKit = () => createE2EWalletKit();
}

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

  // Initialize Stellar Wallets Kit
  useEffect(() => {
    try {
      if (IS_E2E && _E2E_getWalletKit) {
        const kit = _E2E_getWalletKit();
        setConnectedWallet("GA7QYNF7SOWQ3GLR2GMK2G5TTF2JRTTN2KXT3KGYRK3H4X2BYKT4QXYZ");
        setWalletInfo({
          publicKey: "GA7QYNF7SOWQ3GLR2GMK2G5TTF2JRTTN2KXT3KGYRK3H4X2BYKT4QXYZ",
          usdcBalance: "100.00",
          network: NETWORK,
        });
        setKitInitialized(true);
        return;
      }

      // Create modules for different wallets
      const modules = [
        new FreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
      ];

      // Initialize the kit with static method
      StellarWalletsKit.init({
        modules,
        network: NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET,
        selectedWalletId: FREIGHTER_ID, // Default to Freighter
      });

      setKitInitialized(true);
    } catch (error) {
      console.error("Failed to initialize Stellar Wallets Kit:", error);
    }
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
      let address;

      if (IS_E2E && _E2E_getWalletKit) {
        const kit = _E2E_getWalletKit();
        const result = await kit.authModal();
        address = result.address;
      } else {
        // Open the authentication modal which returns the address when successful
        const result = await StellarWalletsKit.authModal();
        address = result.address;
      }

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
        toast.success("Wallet connected successfully!");

        // Refresh user data
        if (user?._id) {
          await refreshUser(user._id);
        }
      } else {
        throw new Error(res.data.message || "Failed to connect wallet");
      }
    } catch (error) {
      // User closing modal is not an error worth showing
      if (error?.code === -1 && error?.message?.includes("closed")) {
        console.log("User closed wallet modal");
      } else {
        console.error("Wallet connection error:", error);
        toast.error(error.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [kitInitialized, user, refreshUser]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await axiosInstance.delete("/api/stellar/wallet/disconnect");

      if (IS_E2E && _E2E_getWalletKit) {
        const kit = _E2E_getWalletKit();
        kit.disconnect();
      } else {
        StellarWalletsKit.disconnect();
      }

      setConnectedWallet(null);
      setWalletInfo(null);
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

  // Sign transaction
  const signTransaction = useCallback(
    async (xdr, networkPassphrase) => {
      if (!kitInitialized) {
        throw new Error("Wallet kit not initialized");
      }

      if (IS_E2E && _E2E_getWalletKit) {
        const kit = _E2E_getWalletKit();
        const result = await kit.signTransaction(xdr, { networkPassphrase });
        return result.signedTxXdr;
      }

      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase,
      });

      return signedTxXdr;
    },
    [kitInitialized]
  );

  const value = {
    kitInitialized,
    connectedWallet,
    walletInfo,
    isConnecting,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    signTransaction,
    network: NETWORK,
  };

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  );
}
