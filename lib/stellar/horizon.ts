import { config } from "@/lib/config/env";

export interface HorizonDonation {
  id: string;
  hash: string | null;
  from: string | null;
  to: string | null;
  amount: number;
  assetCode: string;
  assetIssuer: string | null;
  createdAt: string | null;
  pagingToken: string | null;
}

export interface DonationStatsResponse {
  success: boolean;
  unconfigured?: boolean;
  status?: number;
  message?: string;
  pool?: string | { address?: string };
  poolAddress?: string;
  donationWallet?: string;
  donationAccount?: string;
  wallet?: string | { address?: string };
  account?: string;
  publicKey?: string;
  totalDonations?: number;
  totalAmount?: number;
  causesCount?: number;
  data?: any; // TODO(types): Raw backend stats data payload
  [key: string]: any; // TODO(types): Dynamic fallback fields on stats response
}

export function getHorizonBaseUrl(network: string = config.stellarNetwork): string {
  return network === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}

export function isIncomingUsdcPayment(record?: any, wallet?: string): boolean { // TODO(types): Horizon raw payment record
  if (!record || !wallet) return false;
  if (record.type !== "payment") return false;
  if (record.asset_code !== "USDC") return false;
  if (record.to !== wallet) return false;
  if (record.transaction_successful === false) return false;
  return true;
}

export function normalizeDonation(record?: any): HorizonDonation { // TODO(types): Horizon raw operation record
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

export async function fetchDonationStats(): Promise<DonationStatsResponse> {
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
  } catch (error: any) { // TODO(types): Network fetch error
    return {
      success: false,
      unconfigured: false,
      message: error?.message || "Failed to fetch donation stats",
    };
  }
}

export function extractWalletFromStats(stats?: DonationStatsResponse | null): string | null {
  const candidates = [
    stats?.pool,
    stats?.poolAddress,
    stats?.donationWallet,
    stats?.donationAccount,
    stats?.wallet,
    stats?.account,
    stats?.publicKey,
    typeof stats?.pool === "object" ? stats.pool?.address : undefined,
    typeof stats?.wallet === "object" ? stats.wallet?.address : undefined,
    stats?.data?.pool,
    stats?.data?.poolAddress,
    stats?.data?.donationWallet,
    stats?.data?.donationAccount,
    stats?.data?.wallet,
    stats?.data?.account,
    stats?.data?.publicKey,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && isStellarAddress(candidate)) return candidate;
  }
  return null;
}

export function resolveDonationWallet(stats?: DonationStatsResponse | null): string | null {
  const envWallet = config.donationWallet;
  if (envWallet) return envWallet;
  return extractWalletFromStats(stats);
}

export async function fetchRecentDonations({
  wallet,
  network,
  limit = 50,
}: {
  wallet: string;
  network?: string;
  limit?: number;
}): Promise<any[]> { // TODO(types): Raw Horizon operation payment records
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

    return records.filter((record: any) => isIncomingUsdcPayment(record, wallet)); // TODO(types): Horizon payment operation record
  } catch (error) {
    console.error("Failed to fetch Horizon donations:", error);
    return [];
  }
}

function isStellarAddress(value: unknown): value is string {
  return typeof value === "string" && /^[G][A-Z2-7]{55}$/.test(value);
}
