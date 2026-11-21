import axios from "axios";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import type { Book, Course, Space } from "@/types";

export const HOME_PAGE_SIZE = 6;
const HOME_REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRIES = 1;

export interface HomeData {
  continueLearning: Course[];
  courses: Course[];
  books: Book[];
  spaces: Space[];
}

export type HomeSection = keyof HomeData;
export type HomeSectionState = { status: "loading" | "ready" | "empty" | "error"; error?: unknown };

export const EMPTY_HOME_DATA: HomeData = { continueLearning: [], courses: [], books: [], spaces: [] };

function list<T>(data: unknown): T[] {
  const values = Array.isArray(data) ? data : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items) ? (data as { items: T[] }).items : data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data) ? (data as { data: T[] }).data : data && typeof data === "object" && Array.isArray((data as { courses?: unknown }).courses) ? (data as { courses: T[] }).courses : [];
  return values.map((item) => item && typeof item === "object" && "_id" in item && !("id" in item) ? { ...item, id: String((item as { _id: string })._id) } as T : item);
}

async function request<T>(url: string, signal: AbortSignal, params: Record<string, string | number>): Promise<T[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await apiClient.get(url, { params, signal, timeout: HOME_REQUEST_TIMEOUT_MS });
      return list<T>(response.data).slice(0, HOME_PAGE_SIZE);
    } catch (error) {
      if (signal.aborted || !axios.isAxiosError(error) || !error.response || error.response.status < 500 || attempt === MAX_RETRIES) throw error;
    }
  }
  return [];
}

export async function fetchHomeData(isAuthenticated: boolean, signal: AbortSignal): Promise<{ data: HomeData; failures: HomeSection[] }> {
  const requests: Array<[HomeSection, Promise<unknown>]> = [
    ["courses", request<Course>(API_ENDPOINTS.courses.list, signal, { limit: HOME_PAGE_SIZE, sort: "featured" })],
    ["books", request<Book>(API_ENDPOINTS.books.list, signal, { limit: HOME_PAGE_SIZE, sort: "featured" })],
    ["spaces", request<Space>(API_ENDPOINTS.spaces.list, signal, { limit: HOME_PAGE_SIZE, isLive: "true" })],
  ];
  if (isAuthenticated) requests.unshift(["continueLearning", request<Course>(API_ENDPOINTS.users.learning, signal, { status: "in-progress", limit: HOME_PAGE_SIZE })]);

  const settled = await Promise.allSettled(requests.map(([, promise]) => promise));
  const data = { ...EMPTY_HOME_DATA };
  const failures: HomeSection[] = [];
  settled.forEach((result, index) => {
    const section = requests[index][0];
    if (result.status === "fulfilled") data[section] = result.value as never;
    else if (!signal.aborted) failures.push(section);
  });
  return { data, failures };
}
