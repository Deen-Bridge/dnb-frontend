/**
 * ReelPosterDialog — frame-capture and custom-upload flows (#265).
 * -------------------------------------------------------------------------
 * Cloudinary upload and poster persistence are mocked at the hook boundary
 * (useCloudinaryUpload / useReelPoster) since those are already covered by
 * their own unit tests; this file drives the dialog's own logic: reading a
 * frame off the <video> via <canvas>, wiring the upload result into
 * setPoster, and the plain file-upload path.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mocks = vi.hoisted(() => ({
  setPoster: vi.fn(),
  uploadFrameFile: vi.fn(),
  uploadCustomFile: vi.fn(),
}));

vi.mock("@/hooks/useReelPoster", () => ({
  default: () => ({ poster: null, setPoster: mocks.setPoster, isPending: false, error: null }),
}));

// The dialog creates two independent useCloudinaryUpload instances (frame tab,
// upload tab). Distinguish them by the preset argument so each tab's upload
// can be asserted independently.
vi.mock("@/hooks/useCloudinaryUpload", () => ({
  useCloudinaryUpload: () => ({
    uploadFile: mocks.uploadFrameFile,
    uploading: false,
    progress: 0,
    uploadedUrl: null,
    error: null,
    reset: vi.fn(),
  }),
}));

import { toast } from "sonner";
import ReelPosterDialog, { captureVideoFrame } from "@/components/organisms/reels/ReelPosterDialog";

const reel = { id: "reel-1", video: "https://cdn/reel-1.mp4", poster: null };

beforeEach(() => {
  vi.clearAllMocks();
  global.URL.createObjectURL = vi.fn(() => "blob:mock-preview");

  // Radix Slider/Tabs need these in jsdom; same polyfill used elsewhere
  // (__tests__/admin/StepUpConfirmDialog.test.jsx, etc.).
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

/**
 * Mock document.createElement("canvas") for a single test while delegating
 * every other tag to the real implementation, so Radix's portal/dialog DOM
 * nodes still render normally.
 */
function mockCanvas(fakeCanvas) {
  const realCreateElement = document.createElement.bind(document);
  return vi
    .spyOn(document, "createElement")
    .mockImplementation((tag, options) =>
      tag === "canvas" ? fakeCanvas : realCreateElement(tag, options)
    );
}

describe("captureVideoFrame()", () => {
  it("rejects when the video has no dimensions yet", async () => {
    const video = { videoWidth: 0, videoHeight: 0 };
    await expect(captureVideoFrame(video)).rejects.toThrow(
      /isn't ready to capture/i
    );
  });

  it("draws the current video frame and resolves a Blob", async () => {
    const drawImage = vi.fn();
    const fakeBlob = new Blob(["fake"], { type: "image/jpeg" });
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toBlob: vi.fn((cb) => cb(fakeBlob)),
    };
    mockCanvas(fakeCanvas);

    const video = { videoWidth: 640, videoHeight: 1136 };
    const blob = await captureVideoFrame(video);

    expect(fakeCanvas.width).toBe(640);
    expect(fakeCanvas.height).toBe(1136);
    expect(drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 1136);
    expect(blob).toBe(fakeBlob);

    document.createElement.mockRestore();
  });

  it("rejects when toBlob yields nothing", async () => {
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() })),
      toBlob: vi.fn((cb) => cb(null)),
    };
    mockCanvas(fakeCanvas);

    const video = { videoWidth: 640, videoHeight: 1136 };
    await expect(captureVideoFrame(video)).rejects.toThrow(/couldn't capture/i);

    document.createElement.mockRestore();
  });
});

describe("<ReelPosterDialog /> — pick-a-frame tab", () => {
  it("captures the current frame, uploads it, and persists the poster", async () => {
    const user = userEvent.setup();
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() })),
      toBlob: vi.fn((cb) => cb(new Blob(["fake"], { type: "image/jpeg" }))),
    };
    mockCanvas(fakeCanvas);
    mocks.uploadFrameFile.mockResolvedValue(
      "https://res.cloudinary.com/demo/image/upload/frame.jpg"
    );
    mocks.setPoster.mockResolvedValue("https://res.cloudinary.com/demo/image/upload/frame.jpg");

    const onUpdated = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ReelPosterDialog
        open
        onOpenChange={onOpenChange}
        reel={reel}
        onUpdated={onUpdated}
      />
    );

    // Simulate the video reporting its duration/dimensions once metadata loads.
    const video = document.querySelector("video");
    Object.defineProperty(video, "videoWidth", { value: 640, configurable: true });
    Object.defineProperty(video, "videoHeight", { value: 1136, configurable: true });
    Object.defineProperty(video, "duration", { value: 12, configurable: true });
    fireEvent.loadedMetadata(video);

    const captureButton = await screen.findByRole("button", {
      name: /use this frame as poster/i,
    });
    await user.click(captureButton);

    await waitFor(() => expect(mocks.uploadFrameFile).toHaveBeenCalled());
    await waitFor(() =>
      expect(mocks.setPoster).toHaveBeenCalledWith(
        "https://res.cloudinary.com/demo/image/upload/frame.jpg"
      )
    );
    expect(onUpdated).toHaveBeenCalledWith(
      "https://res.cloudinary.com/demo/image/upload/frame.jpg"
    );
    expect(toast.success).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    document.createElement.mockRestore();
  });

  it("keeps the dialog open and toasts an error if the upload fails", async () => {
    const user = userEvent.setup();
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() })),
      toBlob: vi.fn((cb) => cb(new Blob(["fake"], { type: "image/jpeg" }))),
    };
    mockCanvas(fakeCanvas);
    mocks.uploadFrameFile.mockRejectedValue(new Error("Upload failed"));

    const onOpenChange = vi.fn();
    render(
      <ReelPosterDialog open onOpenChange={onOpenChange} reel={reel} onUpdated={vi.fn()} />
    );

    const video = document.querySelector("video");
    Object.defineProperty(video, "videoWidth", { value: 640, configurable: true });
    Object.defineProperty(video, "videoHeight", { value: 1136, configurable: true });
    Object.defineProperty(video, "duration", { value: 12, configurable: true });
    fireEvent.loadedMetadata(video);

    const captureButton = await screen.findByRole("button", {
      name: /use this frame as poster/i,
    });
    await user.click(captureButton);

    await waitFor(() => expect(mocks.uploadFrameFile).toHaveBeenCalled());
    expect(mocks.setPoster).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    document.createElement.mockRestore();
  });
});

describe("<ReelPosterDialog /> — upload-image tab", () => {
  it("uploads the chosen file and persists it as the poster", async () => {
    mocks.uploadFrameFile.mockResolvedValue(
      "https://res.cloudinary.com/demo/image/upload/custom.jpg"
    );
    mocks.setPoster.mockResolvedValue(
      "https://res.cloudinary.com/demo/image/upload/custom.jpg"
    );

    const onUpdated = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ReelPosterDialog
        open
        onOpenChange={onOpenChange}
        reel={reel}
        onUpdated={onUpdated}
      />
    );

    await userEvent.click(screen.getByRole("tab", { name: /upload image/i }));

    const file = new File(["fake"], "cover.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/custom cover image/i);
    await userEvent.upload(input, file);

    await waitFor(() => expect(mocks.uploadFrameFile).toHaveBeenCalledWith(file));
    await waitFor(() =>
      expect(mocks.setPoster).toHaveBeenCalledWith(
        "https://res.cloudinary.com/demo/image/upload/custom.jpg"
      )
    );
    expect(onUpdated).toHaveBeenCalledWith(
      "https://res.cloudinary.com/demo/image/upload/custom.jpg"
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
