import axiosInstance from "@/lib/config/axios.config";

export async function POST(req) {
  const { email } = await req.json();
}
