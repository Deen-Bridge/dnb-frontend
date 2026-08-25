/**
 * Branding settings page — alert() removal (#333).
 * ---------------------------------------------------
 * The admin branding page previously used blocking `alert()` dialogs for logo
 * upload validation failures. These tests assert that invalid uploads now
 * surface as consistent toasts and that `alert()` is never called.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

vi.mock("@/lib/config/font.config", () => ({
  poppins_400: { className: "" },
  poppins_500: { className: "" },
  poppins_600: { className: "" },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { toast } from "sonner";

beforeEach(() => {
  vi.clearAllMocks();
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

let BrandingSettingsPage;
beforeEach(async () => {
  if (!BrandingSettingsPage) {
    const mod = await import("@/app/[locale]/admin/settings/branding/page");
    BrandingSettingsPage = mod.default;
  }
});

describe("BrandingSettingsPage — upload validation feedback", () => {
  it("shows a toast (not alert) when a non-image file is selected", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { container } = render(<BrandingSettingsPage />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    const textFile = new File(["hello"], "notes.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [textFile] } });

    expect(toast.error).toHaveBeenCalledWith(
      "Please upload an image file",
      expect.any(Object)
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("shows a toast (not alert) when an oversized image is selected", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { container } = render(<BrandingSettingsPage />);

    const fileInput = container.querySelector('input[type="file"]');
    const bigImage = new File([new Uint8Array(3 * 1024 * 1024)], "big.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [bigImage] } });

    expect(toast.error).toHaveBeenCalledWith(
      "File size must be less than 2MB",
      expect.any(Object)
    );
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
