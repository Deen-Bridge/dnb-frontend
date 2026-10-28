/**
 * SignupForm — validation and submit behaviour
 * --------------------------------------------
 * Coverage for components/organisms/auth/signup-form.jsx, including the
 * regression guard that choosing "Educator" registers role 'mentor' (it must
 * not be downgraded to 'student') and that the post-signup branch keys off
 * 'mentor'.
 *
 * No network calls: `signup` is mocked and `sonner` toasts are stubbed.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { signupMock, toastErrorMock } = vi.hoisted(() => ({
  signupMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({ signup: signupMock }));

vi.mock("sonner", () => ({
  toast: { error: toastErrorMock, success: vi.fn() },
}));

import SignupForm from "@/components/organisms/auth/signup-form";

const VALID_PASSWORD = "Str0ng-Pass!42";

const VALID_DETAILS = {
  name: "Salem Alharthi",
  email: "learner@example.com",
  password: VALID_PASSWORD,
  confirmPassword: VALID_PASSWORD,
};

async function fillForm(user, overrides = {}) {
  const values = { ...VALID_DETAILS, ...overrides };
  await user.type(screen.getByLabelText("Full Name"), values.name);
  await user.type(screen.getByLabelText("Email"), values.email);
  await user.type(screen.getByLabelText("Password"), values.password);
  await user.type(screen.getByLabelText("Confirm Password"), values.confirmPassword);
}

async function chooseRole(user, label) {
  await user.click(screen.getByRole("combobox", { name: "Role" }));
  await user.click(await screen.findByRole("option", { name: label }));
}

async function submit(user) {
  await user.click(screen.getByRole("button", { name: "Sign Up" }));
}

beforeEach(() => {
  signupMock.mockReset();
  signupMock.mockResolvedValue({ success: true, message: "ok" });
  toastErrorMock.mockReset();
});

describe("SignupForm — validation", () => {
  it("shows required-field messages when submitted empty and does not call signup", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await submit(user);

    expect(await screen.findByText("Full name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password")).toBeInTheDocument();
    expect(screen.getByText("Please select a role")).toBeInTheDocument();
    expect(signupMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed email as the user types", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
  });

  it("rejects a password shorter than the minimum length", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("Password"), "abc");

    expect(await screen.findByText("Password must be at least 8 characters")).toBeInTheDocument();
  });

  it("rejects a confirmation that does not match the password", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillForm(user, { confirmPassword: "Different-Pass!9" });

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    await submit(user);
    expect(signupMock).not.toHaveBeenCalled();
  });
});

describe("SignupForm — submit", () => {
  it("registers an Educator as role 'mentor' (not downgraded to student) and shows the educator follow-up", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillForm(user);
    await chooseRole(user, "Educator");
    expect(screen.getByRole("combobox", { name: "Role" })).toHaveTextContent("Educator");

    await submit(user);

    await waitFor(() => expect(signupMock).toHaveBeenCalledTimes(1));
    expect(signupMock).toHaveBeenCalledWith(
      VALID_DETAILS.name,
      VALID_DETAILS.email,
      VALID_PASSWORD,
      "mentor"
    );
    expect(signupMock.mock.calls[0][3]).not.toBe("student");

    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    expect(screen.getByText(VALID_DETAILS.email, { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText(/As an educator, you will be guided/)).toBeInTheDocument();
  });

  it("registers a Student as role 'student' and omits the educator follow-up", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillForm(user);
    await chooseRole(user, "Student");

    await submit(user);

    await waitFor(() => expect(signupMock).toHaveBeenCalledTimes(1));
    expect(signupMock.mock.calls[0][3]).toBe("student");

    expect(await screen.findByRole("heading", { name: "Check your email" })).toBeInTheDocument();
    expect(screen.queryByText(/As an educator, you will be guided/)).not.toBeInTheDocument();
  });

  it("shows the server error message and a toast when signup rejects, and stays on the form", async () => {
    signupMock.mockRejectedValueOnce(new Error("Email already registered"));
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillForm(user);
    await chooseRole(user, "Student");
    await submit(user);

    expect(await screen.findByText("Email already registered")).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("Email already registered");
    expect(screen.queryByRole("heading", { name: "Check your email" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeEnabled();
  });

  it("falls back to a generic message when the rejection carries no message", async () => {
    signupMock.mockRejectedValueOnce({});
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillForm(user);
    await chooseRole(user, "Student");
    await submit(user);

    expect(await screen.findByText("Signup failed. Please try again.")).toBeInTheDocument();
    expect(toastErrorMock).toHaveBeenCalledWith("Signup failed. Please try again.");
  });
});
