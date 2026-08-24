/**
 * StepUpConfirmDialog — step-up confirm flow interaction tests (#340).
 * --------------------------------------------------------------------
 * The destructive-action confirmation dialog from #311: the confirm button
 * stays locked until the actor types the exact challenge phrase, then runs the
 * async `onConfirm`. These tests drive the real Radix dialog and assert the
 * gating + confirm/cancel behaviour that protects every sensitive admin action.
 */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
  ibmPlexArabic: { className: "", variable: "" },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import StepUpConfirmDialog from "@/components/auth/StepUpConfirmDialog";

// jsdom lacks the layout/pointer APIs Radix's dialog touches on mount.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn();
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const PHRASE = "bilal@deenbridge.org";

function renderDialog(overrides = {}) {
  const onConfirm = overrides.onConfirm || vi.fn().mockResolvedValue(undefined);
  const onOpenChange = overrides.onOpenChange || vi.fn();
  render(
    <StepUpConfirmDialog
      open
      onOpenChange={onOpenChange}
      title="Revoke admin access"
      description="Bilal's admin access will be removed."
      confirmPhrase={PHRASE}
      confirmLabel="Revoke"
      onConfirm={onConfirm}
    />
  );
  return { onConfirm, onOpenChange };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.clearAllMocks());

describe("StepUpConfirmDialog", () => {
  it("renders the title and challenge input while open", () => {
    renderDialog();
    expect(screen.getByText("Revoke admin access")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("keeps the confirm button disabled until the phrase matches", () => {
    renderDialog();
    const confirm = screen.getByRole("button", { name: /revoke/i });
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "wrong" } });
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: PHRASE } });
    expect(confirm).toBeEnabled();
  });

  it("matches the phrase case-insensitively and trims whitespace", () => {
    renderDialog();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: `  ${PHRASE.toUpperCase()} ` },
    });
    expect(screen.getByRole("button", { name: /revoke/i })).toBeEnabled();
  });

  it("runs onConfirm with the typed confirmation and closes on success", async () => {
    const { onConfirm, onOpenChange } = renderDialog();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: PHRASE } });
    fireEvent.click(screen.getByRole("button", { name: /revoke/i }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({ confirmation: PHRASE })
    );
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("cancel closes without running onConfirm", () => {
    const { onConfirm, onOpenChange } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("does not run onConfirm when the phrase is wrong", () => {
    const { onConfirm } = renderDialog();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "nope" } });
    fireEvent.click(screen.getByRole("button", { name: /revoke/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
