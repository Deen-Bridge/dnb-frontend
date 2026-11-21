
import { config } from "@/lib/config/env";
import { getAuthenticatedAiRequest, policyError } from "@/lib/ai/request-policy";

export async function POST(req) {
  try {
    const request = await getAuthenticatedAiRequest(await req.json());
    if (request.error) return policyError(request);

    const AI_API_URL = config.aiApiUrl;
    const endpoint = `${AI_API_URL}/chat/stream`;
    const serviceApiKey = process.env.AI_SERVICE_API_KEY;

    if (!serviceApiKey) return policyError({ error: "AI service is not configured", status: 503 });

    // Make request to AI backend
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "X-API-Key": serviceApiKey,
        Authorization: `Bearer ${request.token}`,
      },
      body: JSON.stringify(request.payload),
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

  
    const reader = response.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            // Forward the chunk to the client
            controller.enqueue(value);
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },

      cancel() {
        reader.cancel();
      },
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Streaming AI Chat error:", error.message);

    // Return error as JSON
    return new Response(
      JSON.stringify({
        error: true,
        message: "Failed to start AI streaming",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
