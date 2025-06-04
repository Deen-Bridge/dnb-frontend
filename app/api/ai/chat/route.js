import axiosInstance from "@/lib/config/axios.config";

export async function POST(req) {
  try {
    const { message } = await req.json();
    console.log("Sending message to AI:", message);

    const response = await axiosInstance.post(
      "https://dnb-backend-api.onrender.com/api/ai/chat",
      { message }
    );

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("AI Chat error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify(
        error.response?.data || { message: "Failed to get AI response" }
      ),
      {
        status: error.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
