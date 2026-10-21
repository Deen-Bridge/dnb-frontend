export type SupportedClientStellarNetwork = "testnet" | "mainnet";

export interface StellarUsdcNetworkDescriptor {
  network: SupportedClientStellarNetwork;
  networkPassphrase: string;
  horizonUrl: string;
  assetCode: "USDC";
  trustedIssuer: string;
}

export const STELLAR_USDC_CLIENT_REGISTRY: Record<
  SupportedClientStellarNetwork,
  StellarUsdcNetworkDescriptor
> = {
  testnet: {
    network: "testnet",
    networkPassphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    assetCode: "USDC",
    trustedIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  },
  mainnet: {
    network: "mainnet",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
    assetCode: "USDC",
    trustedIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
};

export function validateClientUsdcPaymentConfig(input: {
  network: string;
  assetCode: string;
  assetIssuer: string;
}): {
  ready: boolean;
  descriptor: StellarUsdcNetworkDescriptor | null;
  errorMessage: string | null;
} {
  const net = input.network.trim().toLowerCase();
  if (net !== "testnet" && net !== "mainnet") {
    return {
      ready: false,
      descriptor: null,
      errorMessage: `Unsupported Stellar network "${input.network}". Select mainnet or testnet.`,
    };
  }
  const descriptor = STELLAR_USDC_CLIENT_REGISTRY[net];
  if (input.assetCode.trim().toUpperCase() !== "USDC") {
    return {
      ready: false,
      descriptor: null,
      errorMessage: "Only canonical Stellar USDC is supported for checkout.",
    };
  }
  if (input.assetIssuer.trim() !== descriptor.trustedIssuer) {
    return {
      ready: false,
      descriptor: null,
      errorMessage: `Untrusted USDC issuer for Stellar ${net}.`,
    };
  }
  return {
    ready: true,
    descriptor,
    errorMessage: null,
  };
}
