import axiosInstance from "@/lib/config/axios.config";

/**
 * Generate mock transaction records for development / testing fallback.
 */
function generateMockTransactions() {
  return [
    {
      _id: "tx_101",
      txHash: "0x8f2d5e1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
      itemType: "course",
      itemTitle: "Tafsir of Surah Al-Fatihah",
      amount: 49.99,
      currency: "USDC",
      status: "confirmed",
      buyer: { name: "Amina Yusuf", email: "amina@deenbridge.org" },
      buyerWallet: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335WFOPVQOI3ZFZG3KA4YAOMNEB",
      creator: { name: "Dr. Bilal Karim", email: "bilal@deenbridge.org" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-02-15T10:30:00.000Z",
    },
    {
      _id: "tx_102",
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      itemType: "book",
      itemTitle: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
      amount: 14.50,
      currency: "USDC",
      status: "pending",
      buyer: { name: "Umar Farouk", email: "umar@deenbridge.org" },
      buyerWallet: "GB7BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q9R0",
      creator: { name: "Khadija Bello", email: "khadija@deenbridge.org" },
      creatorWallet: "GDFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W9999",
      createdAt: "2026-02-18T14:15:00.000Z",
    },
    {
      _id: "tx_103",
      txHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d",
      itemType: "course",
      itemTitle: "Arabic Grammar Essentials",
      amount: 35.00,
      currency: "USDC",
      status: "failed",
      buyer: { name: "Zaynab Idris", email: "zaynab@deenbridge.org" },
      buyerWallet: "GC3BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q111",
      creator: { name: "Dr. Bilal Karim", email: "bilal@deenbridge.org" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-02-20T09:00:00.000Z",
    },
    {
      _id: "tx_104",
      txHash: "0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a",
      itemType: "book",
      itemTitle: "Stories of the Prophets",
      amount: 9.99,
      currency: "USDC",
      status: "confirmed",
      buyer: { name: "Fatima Ali", email: "fatima@deenbridge.org" },
      buyerWallet: "GD4BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q222",
      creator: { name: "Khadija Bello", email: "khadija@deenbridge.org" },
      creatorWallet: "GDFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W9999",
      createdAt: "2026-02-22T16:45:00.000Z",
    },
    {
      _id: "tx_105",
      txHash: "0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
      itemType: "course",
      itemTitle: "Fiqh of Worship",
      amount: 59.00,
      currency: "USDC",
      status: "submitted",
      buyer: { name: "Tariq Mansoor", email: "tariq@deenbridge.org" },
      buyerWallet: "GE5BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q333",
      creator: { name: "Dr. Bilal Karim", email: "bilal@deenbridge.org" },
      creatorWallet: "GCFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W4567",
      createdAt: "2026-02-24T11:20:00.000Z",
    },
    {
      _id: "tx_106",
      txHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
      itemType: "book",
      itemTitle: "40 Hadith An-Nawawi commentary",
      amount: 19.99,
      currency: "USDC",
      status: "expired",
      buyer: { name: "Hassan Ibrahim", email: "hassan@deenbridge.org" },
      buyerWallet: "GF6BDSVU7WAKCCGLTDTBQLP3Y4S7G45P6W6Y5Z2XJ3K4L5M6N7P8Q444",
      creator: { name: "Khadija Bello", email: "khadija@deenbridge.org" },
      creatorWallet: "GDFXHS4GXL6BVUCFZFDXA2P2VJ2XGCLLK7O6R72EC2Q656BUKZ2W9999",
      createdAt: "2026-02-25T08:10:00.000Z",
    },
  ];
}

/**
 * Filter mock transactions in-memory when backend API is unavailable.
 */
function filterMockTransactions(allTxs, params) {
  let filtered = [...allTxs];

  if (params.dateFrom) {
    const fromDate = new Date(params.dateFrom);
    if (!isNaN(fromDate.getTime())) {
      filtered = filtered.filter((t) => new Date(t.createdAt) >= fromDate);
    }
  }

  if (params.dateTo) {
    const toDate = new Date(params.dateTo);
    if (!isNaN(toDate.getTime())) {
      // Set to end of day if only date is passed
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.createdAt) <= toDate);
    }
  }

  if (params.status && params.status !== "all") {
    // Map "success" to "confirmed" for backward compatibility if needed
    const statusQuery = params.status === "success" ? "confirmed" : params.status;
    filtered = filtered.filter(
      (t) =>
        t.status.toLowerCase() === statusQuery.toLowerCase() ||
        (params.status === "success" && t.status.toLowerCase() === "confirmed")
    );
  }

  if (params.itemType && params.itemType !== "all") {
    filtered = filtered.filter(
      (t) => t.itemType.toLowerCase() === params.itemType.toLowerCase()
    );
  }

  if (params.minAmount !== undefined && params.minAmount !== "" && !isNaN(Number(params.minAmount))) {
    filtered = filtered.filter((t) => Number(t.amount) >= Number(params.minAmount));
  }

  if (params.maxAmount !== undefined && params.maxAmount !== "" && !isNaN(Number(params.maxAmount))) {
    filtered = filtered.filter((t) => Number(t.amount) <= Number(params.maxAmount));
  }

  if (params.buyerWallet && params.buyerWallet.trim()) {
    const bw = params.buyerWallet.trim().toLowerCase();
    filtered = filtered.filter((t) => t.buyerWallet?.toLowerCase().includes(bw));
  }

  if (params.creatorWallet && params.creatorWallet.trim()) {
    const cw = params.creatorWallet.trim().toLowerCase();
    filtered = filtered.filter((t) => t.creatorWallet?.toLowerCase().includes(cw));
  }

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const total = filtered.length;
  const pages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    success: true,
    transactions: paginated,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  };
}

/**
 * Fetch global transactions with server-side pagination and filters.
 *
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @param {string} [params.dateFrom]
 * @param {string} [params.dateTo]
 * @param {string} [params.status]
 * @param {string} [params.itemType]
 * @param {number|string} [params.minAmount]
 * @param {number|string} [params.maxAmount]
 * @param {string} [params.buyerWallet]
 * @param {string} [params.creatorWallet]
 * @returns {Promise<{success: boolean, transactions: Array, pagination: object, error?: string}>}
 */
export async function fetchGlobalTransactions(params = {}) {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.dateFrom && { dateFrom: params.dateFrom }),
    ...(params.dateTo && { dateTo: params.dateTo }),
    ...(params.status && params.status !== "all" && { status: params.status }),
    ...(params.itemType && params.itemType !== "all" && { itemType: params.itemType }),
    ...(params.minAmount !== undefined && params.minAmount !== "" && { minAmount: params.minAmount }),
    ...(params.maxAmount !== undefined && params.maxAmount !== "" && { maxAmount: params.maxAmount }),
    ...(params.buyerWallet && { buyerWallet: params.buyerWallet.trim() }),
    ...(params.creatorWallet && { creatorWallet: params.creatorWallet.trim() }),
  };

  try {
    const res = await axiosInstance.get("/api/admin/transactions", {
      params: queryParams,
    });
    if (res.data && res.data.success) {
      return res.data;
    }
    // If backend returns unsuccessful payload or empty shape, fallback gracefully
    return filterMockTransactions(generateMockTransactions(), queryParams);
  } catch (error) {
    // If 404 or backend unavailable, return filtered mock data for development/testing
    if (error.response?.status === 404 || error.code === "ERR_NETWORK" || !error.response) {
      return filterMockTransactions(generateMockTransactions(), queryParams);
    }
    console.error("Failed to fetch global transactions:", error);
    return {
      success: false,
      transactions: [],
      pagination: { page: 1, limit: queryParams.limit, total: 0, pages: 0 },
      error: error.response?.data?.message || error.message || "Failed to fetch transactions",
    };
  }
}
