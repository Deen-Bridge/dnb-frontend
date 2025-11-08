

export async function POST(req) {
  try {
    const { message, chat_id, user_id, context } = await req.json();

    console.log("Starting streaming chat:", {
      message: message?.substring(0, 50),
      chat_id,
      user_id,
    });

    // Use environment variable or fallback to localhost
    const AI_API_URL =
      process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";
    const endpoint = `${AI_API_URL}/chat/stream`;

    // Make request to AI backend
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        prompt: message,
        chat_id: chat_id || null,
        user_id: user_id || null,
        context: context || "Islamic knowledge and guidance",
      }),
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
