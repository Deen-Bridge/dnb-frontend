import axiosInstance from "@/lib/config/axios.config";

export interface EducatorsMeta {
  educators: number;
  courses: number;
  books: number;
  spaces: number;
  [key: string]: number;
}

export interface FetchEducatorsResult {
  educators: any[]; // TODO(types): Educator record array
  meta: EducatorsMeta;
}

export async function fetchEducators(): Promise<FetchEducatorsResult> {
  const res = await axiosInstance.get("/api/educators");
  const { data, meta } = res.data ?? {};

  return {
    educators: Array.isArray(data) ? data : [],
    meta: meta ?? { educators: 0, courses: 0, books: 0, spaces: 0 },
  };
}
