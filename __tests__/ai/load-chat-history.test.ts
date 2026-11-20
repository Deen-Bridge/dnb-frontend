import { describe, expect, it, vi } from "vitest";

describe("AI chat history authorization boundary", () => {
  it("does not make an unauthenticated history request", async () => {
    vi.resetModules();
    vi.stubGlobal("document", { cookie: "" });
    const { loadChatHistory } = await import("@/lib/actions/ai/load-chat-history");

    await expect(loadChatHistory("user-1")).resolves.toEqual({ chats: [] });
  });
});
