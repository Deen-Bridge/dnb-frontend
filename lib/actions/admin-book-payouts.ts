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

interface MockPayoutSeed {
  creatorWallet: string;
  creatorName: string;
  settlements: Array<{
    _id: string;
    txHash: string;
    amount: number;
    status: string;
    buyerName: string;
    createdAt: string;
  }>;
}

const MOCK_PAYOUT_SEEDS: Record<string, MockPayoutSeed> = {
  bk_002: {
    creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
    creatorName: "Dr. Fatima",
    settlements: [
      {
        _id: "pt_201",
        txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
        amount: 12.99,
        status: "confirmed",
        buyerName: "Amina Yusuf",
        createdAt: "2026-08-05T10:00:00.000Z",
      },
      {
        _id: "pt_202",
        txHash: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c",
        amount: 12.99,
        status: "confirmed",
        buyerName: "Umar Farouk",
        createdAt: "2026-07-19T14:30:00.000Z",
      },
      {
        _id: "pt_203",
        txHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
        amount: 12.99,
        status: "pending",
        buyerName: "Zaynab Idris",
        createdAt: "2026-07-02T08:15:00.000Z",
      },
      {
        _id: "pt_204",
        txHash: "7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
        amount: 12.99,
        status: "confirmed",
        buyerName: "Fatima Ali",
        createdAt: "2026-06-21T09:45:00.000Z",
      },
    ],
  },
  bk_003: {
    creatorWallet: "GDFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W9999",
    creatorName: "Sheikh Omar",
    settlements: [
      {
        _id: "pt_301",
        txHash: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
        amount: 9.99,
        status: "confirmed",
        buyerName: "Hassan Ibrahim",
        createdAt: "2026-08-12T11:20:00.000Z",
      },
      {
        _id: "pt_302",
        txHash: "5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
        amount: 9.99,
        status: "confirmed",
        buyerName: "Tariq Mansoor",
        createdAt: "2026-07-28T16:40:00.000Z",
      },
      {
        _id: "pt_303",
        txHash: "6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
        amount: 9.99,
        status: "expired",
        buyerName: "Khadija Bello",
        createdAt: "2026-06-09T13:05:00.000Z",
      },
    ],
  },
  bk_004: {
    creatorWallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
    creatorName: "Ustadh Ibrahim",
    settlements: [
      {
        _id: "pt_401",
        txHash: "7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
        amount: 5.0,
        status: "confirmed",
        buyerName: "Umar Farouk",
        createdAt: "2026-08-03T09:10:00.000Z",
      },
      {
        _id: "pt_402",
        txHash: "8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
        amount: 5.0,
        status: "confirmed",
        buyerName: "Amina Yusuf",
        createdAt: "2026-07-11T15:25:00.000Z",
      },
    ],
  },
  bk_006: {
    creatorWallet: "GC3BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q111",
    creatorName: "Sister Maryam",
    settlements: [
      {
        _id: "pt_601",
        txHash: "9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
        amount: 7.5,
        status: "confirmed",
        buyerName: "Zaynab Idris",
        createdAt: "2026-08-15T12:00:00.000Z",
      },
      {
        _id: "pt_602",
        txHash: "0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        amount: 7.5,
        status: "confirmed",
        buyerName: "Fatima Ali",
        createdAt: "2026-07-22T10:35:00.000Z",
      },
      {
        _id: "pt_603",
        txHash: "1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
        amount: 7.5,
        status: "submitted",
        buyerName: "Tariq Mansoor",
        createdAt: "2026-06-27T18:50:00.000Z",
      },
    ],
  },
};

const FREE_BOOKS_WITHOUT_SALES = new Set(["bk_001", "bk_005"]);

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

function filterMockSettlements(seed: MockPayoutSeed, params: FetchBookPayoutsParams): PayoutSettlement[] {
  return seed.settlements
    .filter((s) => isWithinRange(s.createdAt, params.dateFrom, params.dateTo))
    .map((s) => ({ ...s, currency: "USDC" }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function buildSummary(
  params: FetchBookPayoutsParams,
  settlements: PayoutSettlement[],
  creatorWallet: string,
  creatorName: string
): BookPayoutSummary {
  const confirmed = settlements.filter((s) => s.status.toLowerCase() === "confirmed");
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

function buildMockSummary(params: FetchBookPayoutsParams): FetchBookPayoutsResult {
  const seed =
    FREE_BOOKS_WITHOUT_SALES.has(params.bookId) ||
    !Object.prototype.hasOwnProperty.call(MOCK_PAYOUT_SEEDS, params.bookId)
      ? {
          creatorWallet: "",
          creatorName: params.creatorName || "Unknown author",
          settlements: [] as MockPayoutSeed["settlements"],
        }
      : MOCK_PAYOUT_SEEDS[params.bookId];

  const settlements = filterMockSettlements(seed, params);
  return {
    success: true,
    summary: buildSummary(params, settlements, seed.creatorWallet, seed.creatorName),
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

  try {
    const res = await axiosInstance.get("/api/admin/transactions", {
      params: queryParams,
    });

    if (res.data && res.data.success) {
      const txList: Array<{
        itemType?: string;
        itemTitle?: string;
        amount?: number;
        status?: string;
        txHash?: string;
        _id?: string;
        buyer?: { name?: string };
        creator?: { name?: string };
        creatorWallet?: string;
        createdAt?: string;
      }> = res.data.transactions || [];

      const bookTitle = params.bookTitle?.toLowerCase();
      const matched = txList.filter(
        (tx) =>
          tx.itemType?.toLowerCase() === "book" &&
          (!bookTitle || !tx.itemTitle || tx.itemTitle.toLowerCase() === bookTitle)
      );

      if (matched.length > 0) {
        const settlements: PayoutSettlement[] = matched
          .map((tx) => ({
            _id: tx._id || "",
            txHash: tx.txHash || "",
            amount: Number(tx.amount) || 0,
            currency: "USDC",
            status: tx.status || "unknown",
            buyerName: tx.buyer?.name,
            createdAt: tx.createdAt || "",
          }))
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
    }

    return buildMockSummary(params);
  } catch (error: any) { // TODO(types): Axios error on admin book payouts
    if (error.response?.status === 404 || error.code === "ERR_NETWORK" || !error.response) {
      return buildMockSummary(params);
    }
    console.error("Failed to fetch book payouts:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch payout summary",
    };
  }
}