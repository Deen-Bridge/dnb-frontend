import { STELLAR_NETWORK } from "@/lib/config/env";

export type StellarNetwork = "testnet" | "mainnet";

export type StellarConfig = {
  network: StellarNetwork;
  usdcIssuer: string;
};

export function validateStellarConfig(config: Partial<StellarConfig>): string[] {
  const errors: string[] = [];
  if (config.network !== "testnet" && config.network !== "mainnet") {
    errors.push("network must be testnet or mainnet");
  }
  if (!config.usdcIssuer || !/^G[A-Z2-7]{55}$/.test(config.usdcIssuer)) {
    errors.push("usdcIssuer must be a valid Stellar account address");
  }
  return errors;
}

export function getStellarConfig(): StellarConfig {
  const config = {
    network: STELLAR_NETWORK as StellarNetwork,
    usdcIssuer: process.env.EXPO_PUBLIC_USDC_ISSUER || "",
  };
  const errors = validateStellarConfig(config);
  if (errors.length) throw new Error(`Invalid Stellar configuration: ${errors.join("; ")}`);
  return config;
}
