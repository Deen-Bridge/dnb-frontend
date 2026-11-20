const PLACEHOLDER_HOSTS = new Set([
  "api.example.com",
  "example.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

const STELLAR_USDC_ISSUERS = {
  testnet: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  mainnet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

function isPlaceholderUrl(value) {
  try {
    const url = new URL(value);
    return PLACEHOLDER_HOSTS.has(url.hostname) || url.hostname.endsWith(".example.com");
  } catch {
    return true;
  }
}

export function validateReleaseConfig(env = process.env) {
  const profile = env.RELEASE_PROFILE ?? "unit";
  const errors = [];
  const apiUrl = env.NEXT_PUBLIC_API_URL?.trim();
  const network = env.NEXT_PUBLIC_STELLAR_NETWORK?.trim().toLowerCase();
  const issuer = env.NEXT_PUBLIC_USDC_ISSUER?.trim();

  if (!["unit", "integration", "production"].includes(profile)) {
    errors.push(`RELEASE_PROFILE must be unit, integration, or production (received ${profile}).`);
  }

  if (profile !== "unit") {
    if (!apiUrl) {
      errors.push("NEXT_PUBLIC_API_URL is required for release validation.");
    } else if (isPlaceholderUrl(apiUrl)) {
      errors.push("NEXT_PUBLIC_API_URL must be a deployed, non-placeholder URL.");
    } else if (!apiUrl.startsWith("https://")) {
      errors.push("NEXT_PUBLIC_API_URL must use https:// for release validation.");
    }

    if (!network || !STELLAR_USDC_ISSUERS[network]) {
      errors.push("NEXT_PUBLIC_STELLAR_NETWORK must be testnet or mainnet.");
    } else if (!issuer) {
      errors.push("NEXT_PUBLIC_USDC_ISSUER is required so the Stellar issuer is explicit.");
    } else if (issuer !== STELLAR_USDC_ISSUERS[network]) {
      errors.push(`NEXT_PUBLIC_USDC_ISSUER does not match the canonical ${network} USDC issuer.`);
    }
  }

  if (profile === "production" && network !== "mainnet") {
    errors.push("Production preflight requires NEXT_PUBLIC_STELLAR_NETWORK=mainnet.");
  }

  return { profile, errors };
}

const result = validateReleaseConfig();
if (result.errors.length > 0) {
  console.error(`Release configuration failed (${result.profile} profile):`);
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Release configuration passed (${result.profile} profile).`);
}
