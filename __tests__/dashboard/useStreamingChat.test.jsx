/**
 * useStreamingChat — behavior tests (#526).
 * ------------------------------------------------------------------
 * Locks in how the hook turns an SSE stream into chat state:
 *   - success path: metadata/content/done events accumulate into the
 *     assistant message and resolve the send result,
 *   - abort: `stopStreaming()` ends the stream without raising an error,
 *   - failures: HTTP and JSON error bodies surface in the error state and
 *     render the fallback assistant message,
 *   - malformed / mid-stream `error` events are logged, not fatal.
 *
 * The fetch/SSE source is fully mocked — no network.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  message: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

import { useStreamingChat } from "@/hooks/useStreamingChat";

const encoder = new TextEncoder();

const makeAbortError = () => {
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  return error;
};

/** A successful streaming response whose reader yields `chunks` then ends. */
function streamResponse(chunks, contentType = "text/event-stream") {
  let index = 0;
  return {
    ok: true,
    status: 200,
    // Used when the body is a JSON error envelope instead of a stream.
    json: async () => JSON.parse(chunks[0] ?? "{}"),
    headers: {
      get: (header) => (header.toLowerCase() === "content-type" ? contentType : null),
    },
    body: {
      getReader: () => ({
        read: async () =>
          index < chunks.length
            ? { done: false, value: encoder.encode(chunks[index++]) }
            : { done: true, value: undefined },
      }),
    },
  };
}

describe("useStreamingChat", () => {
  let fetchMock;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("parses SSE chunks into an accumulating assistant message", async () => {
    fetchMock.mockResolvedValue(
      streamResponse([
        'data: {"type":"metadata","chat_id":"chat_42"}\n\n',
        'data: {"type":"content","text":"As-salamu "}\n\n',
        'data: {"type":"content","text":"alaykum"}\n\n',
        'data: {"type":"done","chat_id":"chat_42","history":[{"role":"user","content":"salam"}]}\n\n',
      ])
    );

    const { result } = renderHook(() => useStreamingChat("user-1"));

    let sendResult;
    await act(async () => {
      sendResult = await result.current.sendMessage("salam");
    });

    // The stream was requested with the expected payload and abort signal.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/ai/stream");
    expect(init.method).toBe("POST");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      message: "salam",
      chat_id: null,
      user_id: "user-1",
      context: null,
    });

    // Messages accumulate: user turn, then the full assistant reply.
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({
      role: "user",
      content: "salam",
    });
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "As-salamu alaykum",
      isStreaming: false,
    });
    expect(result.current.messages[1].isError).toBeUndefined();

    expect(sendResult).toEqual({
      chatId: "chat_42",
      history: [{ role: "user", content: "salam" }],
      response: "As-salamu alaykum",
    });
    expect(result.current.chatId).toBe("chat_42");
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("stopStreaming aborts the stream without raising an error", async () => {
    // First read yields one content chunk; later reads hang until aborted.
    fetchMock.mockImplementation(async (_url, init) => {
      const signal = init?.signal;
      let delivered = 0;
      return {
        ok: true,
        status: 200,
        headers: { get: () => "text/event-stream" },
        body: {
          getReader: () => ({
            read: () => {
              if (delivered === 0) {
                delivered += 1;
                return Promise.resolve({
                  done: false,
                  value: encoder.encode('data: {"type":"content","text":"partial answer"}\n'),
                });
              }
              return new Promise((_resolve, reject) => {
                if (signal?.aborted) {
                  reject(makeAbortError());
                  return;
                }
                signal?.addEventListener("abort", () => reject(makeAbortError()));
              });
            },
          }),
        },
      };
    });

    const { result } = renderHook(() => useStreamingChat("user-1"));

    let sendPromise;
    act(() => {
      sendPromise = result.current.sendMessage("question");
    });

    // Wait until the first chunk has been applied and the stream is hanging.
    await waitFor(() => expect(result.current.messages[1]?.content).toBe("partial answer"));
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      result.current.stopStreaming();
    });

    let sendResult;
    await act(async () => {
      sendResult = await sendPromise;
    });

    expect(sendResult).toBeUndefined();
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    // No updates arrived after the abort.
    expect(result.current.messages[1].content).toBe("partial answer");
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it("surfaces an HTTP failure in the error state with the fallback message", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "text/plain" },
    });

    const { result } = renderHook(() => useStreamingChat("user-1"));

    let sendResult;
    await act(async () => {
      sendResult = await result.current.sendMessage("hello");
    });

    expect(sendResult).toBeUndefined();
    expect(result.current.error).toBe("HTTP error! status: 500");
    expect(toastMock.error).toHaveBeenCalledWith("HTTP error! status: 500");
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      isError: true,
    });
    expect(result.current.messages[1].content).toContain("trouble connecting");
    expect(result.current.isStreaming).toBe(false);
  });

  it("uses the JSON error body when the stream fails to start", async () => {
    fetchMock.mockResolvedValue(
      streamResponse(['{"message":"AI service overloaded"}'], "application/json")
    );

    const { result } = renderHook(() => useStreamingChat("user-1"));

    await act(async () => {
      await result.current.sendMessage("hello");
    });

    expect(result.current.error).toBe("AI service overloaded");
    expect(toastMock.error).toHaveBeenCalledWith("AI service overloaded");
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      isError: true,
    });
  });

  it("skips a malformed SSE line and keeps the rest of the stream", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockResolvedValue(
      streamResponse([
        "data: {not-valid-json\n",
        'data: {"type":"content","text":"recovered"}\n\n',
        'data: {"type":"done"}\n\n',
      ])
    );

    const { result } = renderHook(() => useStreamingChat("user-1"));

    let sendResult;
    await act(async () => {
      sendResult = await result.current.sendMessage("hello");
    });

    expect(consoleError).toHaveBeenCalledWith("Error parsing SSE data:", expect.anything());
    expect(sendResult.response).toBe("recovered");
    expect(result.current.messages[1].content).toBe("recovered");
    expect(result.current.error).toBeNull();
  });

  it("logs a mid-stream error event without failing the whole send", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchMock.mockResolvedValue(
      streamResponse([
        'data: {"type":"content","text":"before "}\n\n',
        'data: {"type":"error","message":"quota exceeded"}\n\n',
        'data: {"type":"done"}\n\n',
      ])
    );

    const { result } = renderHook(() => useStreamingChat("user-1"));

    let sendResult;
    await act(async () => {
      sendResult = await result.current.sendMessage("hello");
    });

    expect(consoleError).toHaveBeenCalledWith("Error parsing SSE data:", expect.anything());
    expect(sendResult.response).toBe("before ");
    expect(result.current.error).toBeNull();
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it("rejects an empty message before touching the network", async () => {
    const { result } = renderHook(() => useStreamingChat("user-1"));

    let sendResult;
    await act(async () => {
      sendResult = await result.current.sendMessage("   ");
    });

    expect(sendResult).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(toastMock.error).toHaveBeenCalledWith("Please enter a message");
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isStreaming).toBe(false);
  });

  it("newConversation clears messages, chat id and error", async () => {
    fetchMock.mockResolvedValue(streamResponse(['data: {"type":"done","chat_id":"chat_1"}\n\n']));

    const { result } = renderHook(() => useStreamingChat("user-1"));

    await act(async () => {
      await result.current.sendMessage("hello");
    });
    expect(result.current.chatId).toBe("chat_1");

    act(() => {
      result.current.newConversation();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.chatId).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
