import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value, size }) => (
    <div data-testid="mock-qrcode-svg" data-value={value} data-size={size} />
  ),
}));

import Sep7QrCode from "@/components/stellar/Sep7QrCode";

describe("Sep7QrCode Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        writable: true,
      });
    } else {
      vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    }
  });

  it("returns null when uri prop is not provided", () => {
    const { container } = render(<Sep7QrCode />);
    expect(container.firstChild).toBeNull();
  });

  it("renders QR code with default size and caption", () => {
    render(<Sep7QrCode uri="web+stellar:pay?destination=G123&amount=10" />);

    const qrElement = screen.getByTestId("mock-qrcode-svg");
    expect(qrElement).toBeInTheDocument();
    expect(qrElement).toHaveAttribute("data-value", "web+stellar:pay?destination=G123&amount=10");
    expect(qrElement).toHaveAttribute("data-size", "168");
    expect(screen.getByText("Scan with a Stellar mobile wallet")).toBeInTheDocument();
  });

  it("renders custom caption and size", () => {
    render(
      <Sep7QrCode
        uri="web+stellar:pay?destination=G123&amount=10"
        size={250}
        caption="Scan to deposit USDC"
      />
    );

    const qrElement = screen.getByTestId("mock-qrcode-svg");
    expect(qrElement).toHaveAttribute("data-size", "250");
    expect(screen.getByText("Scan to deposit USDC")).toBeInTheDocument();
  });

  it("copies payment URI to clipboard and shows toast feedback", async () => {
    const testUri = "web+stellar:tx?xdr=AAAA_TEST_XDR";
    render(<Sep7QrCode uri={testUri} />);

    const copyBtn = screen.getByRole("button", { name: /copy uri/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testUri);
      expect(toastMock.success).toHaveBeenCalledWith("Payment URI copied to clipboard");
    });
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });
});
