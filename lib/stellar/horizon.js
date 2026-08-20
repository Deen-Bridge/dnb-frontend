import { config } from "@/lib/config/env";

/**
 * Horizon helpers for the public Sadaqah transparency page.
 *
 * The page reads incoming USDC donations straight from Horizon so a logged-out
 * visitor can verify every contribution on-chain, without proxying through the
 * backend. These helpers are shared by the server-rendered first paint (REST)
 * and the client live feed (SSE), so the filtering rules match in both places.
 */

/**
 * Derive the Horizon REST/SSE base URL for the configured Stellar network.
 * @param {"testnet"|"mainnet"} [network]
 */
export function getHorizonBaseUrl(network = config.stellarNetwork) {
  return network === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

/**
 * Accept a Horizon operation record only when it is a genuine incoming USDC
 * payment to the donation wallet. Outgoing ops, path payments, non-USDC assets
 * and failed transactions are excluded so the feed cannot be padded with
 * unrelated account activity.
 * @param {Record<string, any>} record - A Horizon payments operation record.
 * @param {string} wallet - The donation wallet (destination).
 */
export function isIncomingUsdcPayment(record, wallet) {
  if (!record || !wallet) return false;
  if (record.type !== "payment") return false;
  if (record.asset_code !== "USDC") return false;
  if (record.to !== wallet) return false;
  // Horizon can include failed transactions; a failed payment never reached
  // the fund, so it is not a donation.
  if (record.transaction_successful === false) return false;
  return true;
}

/**
 * Map a Horizon operation record to the small shape the UI renders. Never
 * throws for malformed records.
 */
export function normalizeDonation(record) {
  const transaction = record?.transaction || {};
  const from = record?.from || null;
  const to = record?.to || null;
  return {
    id: record?.paging_token || record?.id || record?.transaction_hash || `${to}-${Date.now()}`,
    hash: record?.transaction_hash || transaction.hash || record?.transaction_id || null,
    from,
    to,
    amount: Number.parseFloat(record?.amount || "0") || 0,
    assetCode: record?.asset_code || "USDC",
    assetIssuer: record?.asset_issuer || null,
    createdAt: record?.created_at || null,
    pagingToken: record?.paging_token || null,
  };
}

/**
 * Fetch the donation wallet / all-time totals from the backend stats endpoint.
 * Returns a normalized object and never throws. `success: false` with
 * `unconfigured: true` mirrors the 503 "no pool" signal the dashboard already
 * relies on.
 */
export async function fetchDonationStats() {
  try {
    const res = await fetch(`${config.apiUrl}/api/stellar/donation/stats`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        success: false,
        unconfigured: res.status === 503,
        status: res.status,
      };
    }

    const body = await res.json();
    return { success: true, ...body };
  } catch (error) {
    return {
      success: false,
      unconfigured: false,
      message: error?.message || "Failed to fetch donation stats",
    };
  }
}

/**
 * Pull a Stellar address out of a stats response. The backend response shape
 * is not pinned, so we scan the plausible public fields defensively.
 */
export function extractWalletFromStats(stats) {
  const candidates = [
    stats?.pool,
    stats?.poolAddress,
    stats?.donationWallet,
    stats?.donationAccount,
    stats?.wallet,
    stats?.account,
    stats?.publicKey,
    stats?.pool?.address,
    stats?.wallet?.address,
    stats?.data?.pool,
    stats?.data?.poolAddress,
    stats?.data?.donationWallet,
    stats?.data?.donationAccount,
    stats?.data?.wallet,
    stats?.data?.account,
    stats?.data?.publicKey,
  ];

  for (const candidate of candidates) {
    if (isStellarAddress(candidate)) return candidate;
  }
  return null;
}

/**
 * Resolution order for the donation wallet:
 *  1. NEXT_PUBLIC_DONATION_WALLET (explicit, most reliable)
 *  2. The pool address from the backend donation stats endpoint
 *  3. null → caller renders the "not configured" empty state
 */
export function resolveDonationWallet(stats) {
  const envWallet = config.donationWallet;
  if (envWallet) return envWallet;
  return extractWalletFromStats(stats);
}

/**
 * Fetch the donation account's recent payments from Horizon REST and return
 * only the records that qualify as incoming USDC donations.
 *
 * Horizon paginates at 200 records max; we request the latest 50 per page.
 * `join=transactions` attaches the full transaction so we always have a hash.
 * Cached server-side for 60s via Next's fetch cache.
 */
export async function fetchRecentDonations({ wallet, network, limit = 50 }) {
  const horizon = getHorizonBaseUrl(network);
  const url = `${horizon}/accounts/${encodeURIComponent(wallet)}/payments?order=desc&limit=${limit}&join=transactions`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Horizon responded with ${res.status}`);

    const body = await res.json();
    const records = Array.isArray(body?._embedded?.records)
      ? body._embedded.records
      : [];

    return records.filter((record) => isIncomingUsdcPayment(record, wallet));
  } catch (error) {
    console.error("Failed to fetch Horizon donations:", error);
    return [];
  }
}

function isStellarAddress(value) {
  return typeof value === "string" && /^[G][A-Z2-7]{55}$/.test(value);
}