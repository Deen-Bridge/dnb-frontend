import { describe, it, expect } from "vitest";
import {
  STELLAR_USDC_CLIENT_REGISTRY,
  validateClientUsdcPaymentConfig,
} from "@/lib/stellar/usdcClientRegistry";

describe("Centralized client USDC issuer and network validation (#562)", () => {
  it("accepts matching network and issuer and rejects cross-network issuer mixing", () => {
    const valid = validateClientUsdcPaymentConfig({
      network: "testnet",
      assetCode: "USDC",
      assetIssuer: STELLAR_USDC_CLIENT_REGISTRY.testnet.trustedIssuer,
    });
    expect(valid.ready).toBe(true);
    expect(valid.descriptor?.horizonUrl).toBe("https://horizon-testnet.stellar.org");

    const mixed = validateClientUsdcPaymentConfig({
      network: "mainnet",
      assetCode: "USDC",
      assetIssuer: STELLAR_USDC_CLIENT_REGISTRY.testnet.trustedIssuer,
    });
    expect(mixed.ready).toBe(false);
    expect(mixed.errorMessage).toContain("Untrusted USDC issuer");
  });
});
