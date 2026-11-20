import { describe, expect, it } from "vitest";
import { validateStellarConfig } from "@/lib/stellar/config";

const ISSUER = `G${"A".repeat(55)}`;

describe("mobile Stellar safety configuration", () => {
  it("accepts an explicit network and issuer", () => {
    expect(validateStellarConfig({ network: "testnet", usdcIssuer: ISSUER })).toEqual([]);
  });

  it("rejects unknown networks and missing or malformed issuers", () => {
    expect(validateStellarConfig({ network: "preview" as never, usdcIssuer: "" })).toEqual([
      "network must be testnet or mainnet",
      "usdcIssuer must be a valid Stellar account address",
    ]);
  });
});
