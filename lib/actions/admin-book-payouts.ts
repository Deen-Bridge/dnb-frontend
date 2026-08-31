import axiosInstance from "@/lib/config/axios.config";

export interface PayoutSettlement {
  _id: string;
  txHash: string;
  amount: number;
  currency: string;
  status: string;
  buyerName?: string;
  createdAt: string;
}

export interface BookPayoutSummary {
  bookId: string;
  title: string;
  creatorName: string;
  creatorWallet: string;
  unitsSold: number;
  grossUsdc: number;
  settlements: PayoutSettlement[];
}

export interface FetchBookPayoutsParams {
  bookId: string;
  bookTitle?: string;
  creatorName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface FetchBookPayoutsResult {
  success: boolean;
  summary?: BookPayoutSummary;
  error?: string;
}

interface AdminTransactionRecord {
  itemType?: string;
  itemId?: string;
  itemTitle?: string;
  amount?: number;
  status?: string;
  txHash?: string;
  _id?: string;
  buyer?: { name?: string };
  creator?: { name?: string };
  creatorWallet?: string;
  createdAt?: string;
}

function isWithinRange(iso: string, dateFrom?: string, dateTo?: string): boolean {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return false;
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!isNaN(from.getTime()) && date < from) return false;
  }
  if (dateTo) {
    const to = new Date(dateTo);
    if (!isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      if (date > to) return false;
    }
  }
  return true;
}

function buildSummary(
  params: FetchBookPayoutsParams,
  settlements: PayoutSettlement[],
  creatorWallet: string,
  creatorName: string
): BookPayoutSummary {
  const confirmed = settlements.filter(
    (s) => s.status && s.status.toLowerCase() === "confirmed"
  );
  return {
    bookId: params.bookId,
    title: params.bookTitle || "Book",
    creatorName: creatorName || params.creatorName || "Unknown author",
    creatorWallet,
    unitsSold: confirmed.length,
    grossUsdc: Math.round(confirmed.reduce((sum, s) => sum + (Number(s.amount) || 0), 0) * 100) / 100,
    settlements,
  };
}

function toSettlement(tx: AdminTransactionRecord): PayoutSettlement {
  return {
    _id: tx._id || "",
    txHash: tx.txHash || "",
    amount: Number(tx.amount) || 0,
    currency: "USDC",
    status: tx.status || "unknown",
    buyerName: tx.buyer?.name,
    createdAt: tx.createdAt || "",
  };
}

export async function fetchBookPayouts(
  params: FetchBookPayoutsParams
): Promise<FetchBookPayoutsResult> {
  if (!params.bookId) {
    return { success: false, error: "Missing bookId" };
  }

  const queryParams: Record<string, number | string> = {
    itemType: "book",
    page: 1,
    limit: 200,
  };
  if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
  if (params.dateTo) queryParams.dateTo = params.dateTo;

  let res;
  try {
    res = await axiosInstance.get("/api/admin/transactions", {
      params: queryParams,
    });
  } catch (error: any) {
    console.error("Failed to fetch book payouts:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch payout summary",
    };
  }

  const txList: AdminTransactionRecord[] =
    (res.data && res.data.transactions) || [];

  const matched = txList.filter((tx) => {
    if (tx.itemType?.toLowerCase() !== "book") return false;
    return !!tx.itemId && tx.itemId === params.bookId;
  });

  if (matched.length === 0) {
    return {
      success: true,
      summary: buildSummary(params, [], "", ""),
    };
  }

  const settlements = matched
    .map(toSettlement)
    .filter((s) => isWithinRange(s.createdAt, params.dateFrom, params.dateTo))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    success: true,
    summary: buildSummary(
      params,
      settlements,
      matched[0].creatorWallet || "",
      matched[0].creator?.name || ""
    ),
  };
}
