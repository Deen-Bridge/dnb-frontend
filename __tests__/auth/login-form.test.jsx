/**
 * LoginForm — post-login redirect behaviour
 * -----------------------------------------
 * Regression coverage for the role-aware redirect that ships with the login
 * form (#533):
 *
 *   - an ADMIN lands on /admin,
 *   - every other role lands on /dashboard,
 *   - the same rule applies to the "Sign in with Stellar" path,
 *   - failed logins and unregistered Stellar accounts never redirect.
 *
 * No network calls: `login` and `loginWithStellar` are mocked.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { loginMock, loginWithStellarMock, stellarState } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  loginWithStellarMock: vi.fn(),
  stellarState: {
    isPending: false,
    stellarAuthAvailable: null,
    kitInitialized: true,
  },
}));

vi.mock("@/hooks/useAuth", () => ({ login: loginMock }));

vi.mock("@/hooks/useStellarAuth", () => ({
  useStellarAuth: () => ({
    loginWithStellar: loginWithStellarMock,
    isPending: stellarState.isPending,
    stellarAuthAvailable: stellarState.stellarAuthAvailable,
    kitInitialized: stellarState.kitInitialized,
  }),
}));

vi.mock("@/components/molecules/Modal", () => ({
  default: ({ isOpen, children }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));

vi.mock("@/components/organisms/auth/forget-password", () => ({
  default: () => <div data-testid="forget-password" />,
}));

import LoginForm from "@/components/organisms/auth/login-form";

// The component assigns `window.location.href` directly. jsdom refuses real
// navigation, so the location object is swapped for a plain stub we can read.
const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href: "", assign: vi.fn(), replace: vi.fn(), reload: vi.fn() },
  });
});

afterAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

beforeEach(() => {
  window.location.href = "";
  loginMock.mockReset();
  loginWithStellarMock.mockReset();
  stellarState.isPending = false;
  stellarState.stellarAuthAvailable = null;
  stellarState.kitInitialized = true;
});

/** The redirect is scheduled 500ms after a successful login. */
async function waitForRedirect(target) {
  await waitFor(() => expect(window.location.href).toBe(target), { timeout: 3000 });
}

async function submitCredentials(email = "user@example.com", password = "secret123") {
  const user = userEvent.setup();
  // react-hook-form updates its field state asynchronously on every keystroke,
  // so the typing and the submit are wrapped to keep those transitions inside
  // React's act scope.
  await act(async () => {
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: "Login" }));
  });
  return user;
}

async function clickStellarButton() {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.getByRole("button", { name: /sign in with stellar/i }));
  });
  return user;
}

describe("LoginForm", () => {
  it("sends an admin to /admin after a successful login", async () => {
    loginMock.mockResolvedValue({ role: "admin" });
    render(<LoginForm />);

    await submitCredentials("admin@example.com");

    expect(loginMock).toHaveBeenCalledWith("admin@example.com", "secret123");
    await waitForRedirect("/admin");
  });

  it("sends a normal user to /dashboard after a successful login", async () => {
    loginMock.mockResolvedValue({ role: "student" });
    render(<LoginForm />);

    await submitCredentials();

    await waitForRedirect("/dashboard");
  });

  it("sends an educator to /dashboard after a successful login", async () => {
    loginMock.mockResolvedValue({ role: "educator" });
    render(<LoginForm />);

    await submitCredentials();

    await waitForRedirect("/dashboard");
  });

  it("treats the backend 'mentor' role as a non-admin", async () => {
    loginMock.mockResolvedValue({ role: "mentor" });
    render(<LoginForm />);

    await submitCredentials();

    await waitForRedirect("/dashboard");
  });

  it("does not redirect when the login request fails", async () => {
    loginMock.mockRejectedValue(new Error("Invalid credentials"));
    render(<LoginForm />);

    await submitCredentials();

    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(window.location.href).toBe("");
  });

  it("validates the email before calling login", async () => {
    render(<LoginForm />);

    // "a@b" satisfies the browser's native `type="email"` constraint but is
    // rejected by the zod schema, so the schema error is the one surfaced.
    await submitCredentials("a@b");

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("does not submit a malformed email address", async () => {
    render(<LoginForm />);

    await submitCredentials("not-an-email");

    await waitFor(() => expect(screen.getByLabelText("Email")).toBeInTheDocument());
    expect(loginMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("sends an admin to /admin through the Stellar sign-in path", async () => {
    loginWithStellarMock.mockResolvedValue({ role: "admin" });
    render(<LoginForm />);

    await clickStellarButton();

    await waitForRedirect("/admin");
  });

  it("sends a normal Stellar user to /dashboard", async () => {
    loginWithStellarMock.mockResolvedValue({ role: "student" });
    render(<LoginForm />);

    await clickStellarButton();

    await waitForRedirect("/dashboard");
  });

  it("does not redirect when the Stellar account is unregistered", async () => {
    loginWithStellarMock.mockResolvedValue({ unregistered: true });
    render(<LoginForm />);

    await clickStellarButton();

    await waitFor(() => expect(loginWithStellarMock).toHaveBeenCalled());
    expect(window.location.href).toBe("");
  });

  it("does not redirect when the Stellar sign-in fails", async () => {
    loginWithStellarMock.mockRejectedValue(new Error("SEP-10 challenge failed"));
    render(<LoginForm />);

    await clickStellarButton();

    await waitFor(() => expect(loginWithStellarMock).toHaveBeenCalled());
    expect(window.location.href).toBe("");
  });

  it("disables the Stellar button when the SEP-10 endpoint is unavailable", () => {
    stellarState.stellarAuthAvailable = false;
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /sign in with stellar/i })).toBeDisabled();
  });

  it("disables the Stellar button until the wallet kit is ready", () => {
    stellarState.kitInitialized = false;
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /sign in with stellar/i })).toBeDisabled();
  });

  it("opens the forgot-password dialog", async () => {
    render(<LoginForm />);

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /forgot your password/i }));
    });

    expect(screen.getByTestId("forget-password")).toBeInTheDocument();
  });
});
