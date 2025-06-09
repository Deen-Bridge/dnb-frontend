import axios from "axios";

export async function POST(req) {
  try {
    const { message } = await req.json();
    console.log("Sending message to AI:", message);

    // Always use localhost for now
    const AI_API_URL = "https://dnb-ai.onrender.com/chat";

    console.log("Using AI API URL:", AI_API_URL);

    const response = await axios.post(
      AI_API_URL,
      {
        prompt: message,
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
