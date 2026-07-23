"use client";

import { useState, useCallback, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { useStellar } from "@/components/stellar/StellarProvider";

export const WALLET_STATES = {
  NO_WALLET: "NO_WALLET",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  NO_TRUSTLINE: "NO_TRUSTLINE",
  LOW_XLM: "LOW_XLM",
  READY: "READY",
};

// Base reserve model constants (https://developers.stellar.org/docs/learn/fundamentals/lumens#base-reserves)
const BASE_RESERVE = 0.5; // XLM
const MIN_ACCOUNT_RESERVE = 2 * BASE_RESERVE; // Basic account needs 2 base reserves (1 XLM)
const TRUSTLINE_RESERVE = BASE_RESERVE; // Each trustline adds 1 base reserve (0.5 XLM)
const TX_FEE_BUFFER = 0.01; // Small buffer for transaction fees

export const useWalletReadiness = () => {
  const { connectedWallet, network } = useStellar();
  const [state, setState] = useState(WALLET_STATES.NO_WALLET);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!connectedWallet) {
      setState(WALLET_STATES.NO_WALLET);
      setAccount(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Connect to the correct Horizon network directly
      const horizonUrl =
        network === "mainnet"
          ? "https://horizon.stellar.org"
          : "https://horizon-testnet.stellar.org";
      const server = new Horizon.Server(horizonUrl);

      let accountDetails;
      try {
        accountDetails = await server.loadAccount(connectedWallet);
        setAccount(accountDetails);
      } catch (e) {
        if (e.response && e.response.status === 404) {
          setState(WALLET_STATES.ACCOUNT_NOT_FOUND);
          setAccount(null);
          return;
        }
        throw e;
      }

      // Check for USDC trustline
      const usdcIssuer = process.env.NEXT_PUBLIC_USDC_ISSUER;
      const hasTrustline = accountDetails.balances.some(
        (b) => b.asset_code === "USDC" && b.asset_issuer === usdcIssuer
      );

      if (hasTrustline) {
        setState(WALLET_STATES.READY);
        return;
      }

      // If no trustline, check if they have enough XLM to add one
      // The reserve needed is: (current subentries + 1 for new trustline + 2 for base account) * base_reserve + fees
      // We can also calculate based on the account's available balance
      const xlmBalanceObj = accountDetails.balances.find((b) => b.asset_type === "native");
      const xlmBalance = parseFloat(xlmBalanceObj?.balance || "0");
      
      const currentSubentries = accountDetails.subentry_count || 0;
      const requiredReserve = (2 + currentSubentries + 1) * BASE_RESERVE + TX_FEE_BUFFER;

      if (xlmBalance < requiredReserve) {
        setState(WALLET_STATES.LOW_XLM);
      } else {
        setState(WALLET_STATES.NO_TRUSTLINE);
      }

    } catch (err) {
      console.error("Error fetching wallet readiness:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [connectedWallet, network]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, account, refresh, isLoading, error };
};
