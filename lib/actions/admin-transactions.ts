import axiosInstance from "@/lib/config/axios.config";

export interface TransactionUser { name: string; email: string; }
export interface AdminTransactionRecord { _id: string; txHash: string; itemType: string; itemTitle: string; amount: number; currency: string; status: string; buyer: TransactionUser; buyerWallet: string; creator: TransactionUser; creatorWallet: string; createdAt: string; }
export interface FetchTransactionsParams { page?: number; limit?: number; dateFrom?: string; dateTo?: string; status?: string; itemType?: string; minAmount?: number | string; maxAmount?: number | string; buyerWallet?: string; creatorWallet?: string; }
export interface PaginationMeta { page: number; limit: number; total: number; pages: number; }
export interface FetchTransactionsResult { success: boolean; transactions: AdminTransactionRecord[]; pagination: PaginationMeta; error?: string; }

export async function fetchGlobalTransactions(params: FetchTransactionsParams = {}): Promise<FetchTransactionsResult> {
  const query = { page: params.page || 1, limit: params.limit || 10, ...params };
  try {
    const response = await axiosInstance.get("/api/admin/transactions", { params: query });
    if (!response.data?.success) throw new Error(response.data?.message || "The transactions API returned no data.");
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "Failed to fetch transactions";
    return { success: false, transactions: [], pagination: { page: query.page, limit: query.limit, total: 0, pages: 0 }, error: message };
  }
}
