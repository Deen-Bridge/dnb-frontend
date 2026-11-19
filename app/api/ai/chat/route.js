import axios from "axios";
import { config } from "@/lib/config/env";
import { getAuthenticatedAiRequest, policyError } from "@/lib/ai/request-policy";

export async function POST(req) {
  try {
    const request = await getAuthenticatedAiRequest(await req.json());
    if (request.error) return policyError(request);

    const AI_API_URL = config.aiApiUrl;
    const endpoint = `${AI_API_URL}/chat`;

    console.log("Using AI API URL:", endpoint);

    const response = await axios.post(
      endpoint,
      request.payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${request.token}`,
          ...(process.env.AI_SERVICE_API_KEY
            ? { "X-API-Key": process.env.AI_SERVICE_API_KEY }
            : {}),
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
