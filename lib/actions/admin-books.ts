import axiosInstance from "@/lib/config/axios.config";

export const BOOK_TAKE_DOWN_REASONS = Object.freeze([
  { value: "content-violation", label: "Content Policy Violation" },
  { value: "dmca", label: "DMCA / Copyright Notice" },
  { value: "quality-issues", label: "Quality Issues" },
  { value: "other", label: "Other" },
] as const);

export type BookTakeDownReason =
  (typeof BOOK_TAKE_DOWN_REASONS)[number]["value"];

export interface AdminBook {
  _id: string;
  title: string;
  author?: {
    _id?: string;
    name?: string;
    avatar?: string | null;
  } | null;
  category?: string;
  price?: number;
  image?: string;
  readCount?: number;
  status?: "active" | "taken-down";
  takenDownReason?: BookTakeDownReason | null;
  takenDownNote?: string | null;
  takenDownAt?: string | null;
  purchaserAccessAllowed?: boolean;
}

export interface TakeDownBookParams {
  reason: BookTakeDownReason;
  note?: string;
  purchaserAccessAllowed?: boolean;
}

export async function fetchAdminBooks(): Promise<AdminBook[]> {
  const response = await axiosInstance.get("/api/books/admin");
  const books = response.data?.data;
  return Array.isArray(books) ? books : [];
}

export async function takeDownBook(
  bookId: string,
  { reason, note, purchaserAccessAllowed = true }: TakeDownBookParams
): Promise<AdminBook> {
  const response = await axiosInstance.patch(
    `/api/books/${bookId}/take-down`,
    {
      reason,
      note: note?.trim() || undefined,
      purchaserAccessAllowed,
    }
  );
  return response.data?.data;
}

export async function restoreBook(bookId: string): Promise<AdminBook> {
  const response = await axiosInstance.patch(`/api/books/${bookId}/restore`);
  return response.data?.data;
}
