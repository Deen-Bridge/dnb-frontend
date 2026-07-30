import axios from "axios";
import { config } from "@/lib/config/env";

export async function POST(req) {
  try {
    const { message, chat_id, user_id } = await req.json();
    console.log("Sending message to AI:", message);
    console.log("Chat ID:", chat_id, "User ID:", user_id);

    const AI_API_URL = config.aiApiUrl;
    const endpoint = `${AI_API_URL}/chat`;

    console.log("Using AI API URL:", endpoint);

    const response = await axios.post(
      endpoint,
      {
        prompt: message,
        chat_id: chat_id,
        user_id: user_id,
        context: "Islamic knowledge and guidance",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("AI Response:", response.data);
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("AI Chat error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });

    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        message: "Failed to get AI response",
        details: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }),
      {
        status: error.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
