import { AUTH_EVENTS, broadcastAuthEvent, listenForAuthEvents } from "@/lib/auth/authSync";

describe("auth tab synchronization", () => {
  it("broadcasts login state without putting credentials in the event", () => {
    const setItem = vi.spyOn(window.localStorage, "setItem");
    broadcastAuthEvent(AUTH_EVENTS.LOGIN, "user-42");
    const payload = JSON.parse(setItem.mock.calls[0][1]);
    expect(payload).toMatchObject({ type: "login", userId: "user-42" });
    expect(payload).not.toHaveProperty("token");
    expect(payload).not.toHaveProperty("password");
  });

  it("accepts storage events and removes the listener", () => {
    const received = vi.fn();
    const stop = listenForAuthEvents(received);
    window.dispatchEvent(new StorageEvent("storage", {
      newValue: JSON.stringify({ type: AUTH_EVENTS.LOGOUT, at: Date.now() }),
    }));
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ type: "logout" }));
    stop();
  });
});
