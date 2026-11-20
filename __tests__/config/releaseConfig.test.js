import { describe, expect, it } from "vitest";
import { validateReleaseConfig } from "../../scripts/validate-release-config.mjs";

const valid = {
  RELEASE_PROFILE: "integration",
  NEXT_PUBLIC_API_URL: "https://dnb-backend-api.onrender.com",
  NEXT_PUBLIC_STELLAR_NETWORK: "testnet",
  NEXT_PUBLIC_USDC_ISSUER: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
};

describe("release configuration validation", () => {
  it("accepts a deployed-like integration profile", () => {
    expect(validateReleaseConfig(valid).errors).toEqual([]);
  });

  it("rejects placeholder endpoints without printing their values", () => {
    const result = validateReleaseConfig({
      ...valid,
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    });
    expect(result.errors).toContain("NEXT_PUBLIC_API_URL must be a deployed, non-placeholder URL.");
    expect(result.errors.join(" ")).not.toContain("api.example.com");
  });

  it("requires the network-specific canonical issuer", () => {
    const result = validateReleaseConfig({
      ...valid,
      NEXT_PUBLIC_USDC_ISSUER: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    });
    expect(result.errors).toContain(
      "NEXT_PUBLIC_USDC_ISSUER does not match the canonical testnet USDC issuer."
    );
  });

  it("requires mainnet for production preflight", () => {
    const result = validateReleaseConfig({ ...valid, RELEASE_PROFILE: "production" });
    expect(result.errors).toContain(
      "Production preflight requires NEXT_PUBLIC_STELLAR_NETWORK=mainnet."
    );
  });
});
