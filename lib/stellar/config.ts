import { config } from "@/lib/config/env";

export const STELLAR_NETWORK = config.stellarNetwork;
export const USDC_ISSUER = config.usdcIssuer ?? "";
export const USDC_ASSET_CODE = "USDC";
export function validateUsdcIssuer(issuer: string): boolean { return issuer.trim() !== "" && issuer === USDC_ISSUER; }
