import axios from "axios";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { Book, Course, User } from "@/types";

export const CATALOG_PAGE_SIZE = 12;

export type CatalogQuery = {
  page: number;
  search?: string;
  category?: string;
  sort?: "newest" | "popular" | "price-low" | "price-high";
  signal?: AbortSignal;
};

export type CatalogPage<T> = {
  items: T[];
  page: number;
  hasNextPage: boolean;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const text = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value : fallback;

const number = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const userAdapter = (value: unknown): User => {
  const raw = asRecord(value);
  return {
    id: text(raw.id ?? raw._id),
    email: text(raw.email),
    name: text(raw.name ?? raw.displayName, "Unknown educator"),
    displayName: text(raw.displayName),
    avatar: text(raw.avatar ?? raw.profileImage ?? raw.image),
    role: raw.role === "admin" || raw.role === "mentor" ? raw.role : "mentor",
    isVerified: Boolean(raw.isVerified),
    createdAt: text(raw.createdAt),
    updatedAt: text(raw.updatedAt),
  };
};

export function adaptCourse(value: unknown): Course | null {
  const raw = asRecord(value);
  const id = text(raw.id ?? raw._id);
  if (!id || !text(raw.title ?? raw.name)) return null;
  const reviews = Array.isArray(raw.reviews) ? raw.reviews : [];
  return {
    id,
    title: text(raw.title ?? raw.name),
    description: text(raw.description),
    thumbnail: text(raw.thumbnail ?? raw.image ?? raw.coverImage),
    educator: userAdapter(raw.educator ?? raw.instructor ?? raw.createdBy),
    category: text(raw.category, "General"),
    level: raw.level === "advanced" || raw.level === "intermediate" ? raw.level : "beginner",
    price: number(raw.price),
    currency: text(raw.currency, "USD"),
    enrolledCount: number(raw.enrolledCount ?? raw.studentsCount),
    rating: number(raw.rating ?? raw.averageRating ?? raw.averageRatingValue),
    reviewCount: number(raw.reviewCount ?? reviews.length),
    isEnrolled: Boolean(raw.isEnrolled),
    progress: number(raw.progress),
    createdAt: text(raw.createdAt),
  };
}

export function adaptBook(value: unknown): Book | null {
  const raw = asRecord(value);
  const id = text(raw.id ?? raw._id);
  if (!id || !text(raw.title ?? raw.name)) return null;
  const author = raw.author;
  return {
    id,
    title: text(raw.title ?? raw.name),
    author: text(typeof author === "object" ? asRecord(author).name : author, "Unknown author"),
    description: text(raw.description),
    coverImage: text(raw.coverImage ?? raw.cover ?? raw.image ?? raw.thumbnail),
    category: text(raw.category, "General"),
    price: number(raw.price),
    currency: text(raw.currency, "USD"),
    pageCount: number(raw.pageCount ?? raw.pages),
    isPurchased: Boolean(raw.isPurchased ?? raw.purchased ?? raw.entitled),
    createdAt: text(raw.createdAt),
  };
}

function collection<T>(payload: unknown, key: string, adapt: (value: unknown) => T | null) {
  const root = asRecord(payload);
  const pagination = asRecord(root.pagination);
  const candidates = [root[key], root.items, root.data, payload];
  const rawItems = candidates.find(Array.isArray) as unknown[] | undefined;
  const items = (rawItems ?? []).map(adapt).filter((item): item is T => item !== null);
  const page = number(root.page ?? pagination.page, 1);
  const totalPages = number(root.totalPages ?? pagination.totalPages ?? pagination.pages);
  const hasNext =
    typeof root.hasNextPage === "boolean" ? root.hasNextPage :
    typeof pagination.hasNextPage === "boolean" ? pagination.hasNextPage :
    totalPages > 0 ? page < totalPages : items.length >= CATALOG_PAGE_SIZE;
  return { items, page, hasNextPage: hasNext };
}

async function fetchPage<T>(
  endpoint: string,
  key: string,
  query: CatalogQuery,
  adapt: (value: unknown) => T | null,
): Promise<CatalogPage<T>> {
  const { data } = await apiClient.get(endpoint, {
    params: {
      page: Math.max(1, query.page),
      limit: CATALOG_PAGE_SIZE,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.category && query.category !== "all" ? { category: query.category } : {}),
      ...(query.sort ? { sort: query.sort } : {}),
    },
    signal: query.signal,
  });
  return collection(data, key, adapt);
}

export const fetchCoursesPage = (query: CatalogQuery) =>
  fetchPage(API_ENDPOINTS.courses.list, "courses", query, adaptCourse);

export const fetchBooksPage = (query: CatalogQuery) =>
  fetchPage(API_ENDPOINTS.books.list, "books", query, adaptBook);

export const isCatalogOfflineError = (error: unknown) =>
  axios.isAxiosError(error) && !error.response;
