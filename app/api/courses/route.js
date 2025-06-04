import axiosInstance from "@/lib/config/axios.config";

export async function GET(req, res) {
  const response = await axiosInstance.get(
    "https://dnb-backend-api.onrender.com/api/courses"
  );
  return new Response(JSON.stringify(response.data), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
