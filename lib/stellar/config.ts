export const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
export const USDC_ISSUER = process.env.NEXT_PUBLIC_USDC_ISSUER || "";
export const USDC_ASSET_CODE = "USDC";
export function validateUsdcIssuer(issuer: string): boolean { return issuer.trim() !== "" && issuer === USDC_ISSUER; }
