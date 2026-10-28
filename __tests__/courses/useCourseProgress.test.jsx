/**
 * useCourseProgress — course progress hook tests (#527).
 * -----------------------------------------------------
 * Covers the GET /api/progress/courses load, the PUT /api/progress/course/:courseId
 * sync, and the empty / failure paths. All network access goes through a mocked
 * axiosInstance; nothing hits the real backend.
 *
 * The hook keeps a module-level `backendAvailable` flag, so each test re-imports
 * the module to start from a clean state.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

const auth = vi.hoisted(() => ({ user: { _id: "u1" } }));

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ user: auth.user, loading: false }),
  useAuth: () => ({ user: auth.user, loading: false }),
}));

vi.mock("@/lib/config/axios.config", () => ({
  default: { get: mocks.get, put: mocks.put },
}));

const COURSE_ID = "c1";
const STORAGE_KEY = "dnb:progress:u1:c1";

async function mountHook(courseId = COURSE_ID) {
  const { useCourseProgress } = await import("@/hooks/useCourseProgress");
  return renderHook(() => useCourseProgress(courseId));
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  localStorage.clear();
  auth.user = { _id: "u1" };
  mocks.get.mockReset();
  mocks.put.mockReset();
  mocks.put.mockResolvedValue({ data: { success: true } });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useCourseProgress", () => {
  it("loads this course's saved progress from GET /api/progress/courses and caches it locally", async () => {
    mocks.get.mockResolvedValue({
      data: {
        success: true,
        progress: [
          { courseId: "c1", positionSeconds: 300, durationSeconds: 600, completed: false },
          { courseId: "c2", positionSeconds: 10, durationSeconds: 100, completed: false },
        ],
      },
    });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mocks.get).toHaveBeenCalledWith("/api/progress/courses");
    expect(result.current.progress).toEqual({
      percent: 50,
      positionSeconds: 300,
      durationSeconds: 600,
      completed: false,
    });
    expect(result.current.resumeTime).toBe(300);
    expect(result.current.resumeLabel).toBe("Resume from 5:00");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({
      positionSeconds: 300,
      durationSeconds: 600,
      completed: false,
    });
  });

  it("sends reported progress to PUT /api/progress/course/:courseId on the first report", async () => {
    mocks.get.mockResolvedValue({ data: { success: true, progress: [] } });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.reportProgress(120, 600);
    });

    expect(result.current.progress).toEqual({
      percent: 20,
      positionSeconds: 120,
      durationSeconds: 600,
      completed: false,
    });
    expect(mocks.put).toHaveBeenCalledWith("/api/progress/course/c1", {
      positionSeconds: 120,
      durationSeconds: 600,
      completed: false,
      lessonId: null,
    });
  });

  it("marks progress completed at or above the 90% threshold and clears the resume prompt", async () => {
    mocks.get.mockResolvedValue({ data: { success: true, progress: [] } });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.reportProgress(560, 600);
    });

    expect(result.current.progress).toEqual({
      percent: 100,
      positionSeconds: 560,
      durationSeconds: 600,
      completed: true,
    });
    expect(result.current.resumeTime).toBeNull();
    expect(result.current.resumeLabel).toBeNull();
    expect(mocks.put).toHaveBeenCalledWith(
      "/api/progress/course/c1",
      expect.objectContaining({ completed: true })
    );
  });

  it("stays at zero and writes nothing when the API returns no entry for the course", async () => {
    mocks.get.mockResolvedValue({ data: { success: true, progress: [] } });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.progress).toEqual({
      percent: 0,
      positionSeconds: 0,
      durationSeconds: 0,
      completed: false,
    });
    expect(result.current.resumeTime).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("does not call the API when there is no signed-in user", async () => {
    auth.user = null;

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mocks.get).not.toHaveBeenCalled();
    expect(result.current.progress.percent).toBe(0);
  });

  it("logs a visible error and keeps default progress when the GET fails with a server error", async () => {
    mocks.get.mockRejectedValue({ response: { status: 500 } });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch course progress:",
      expect.objectContaining({ response: { status: 500 } })
    );
    expect(console.warn).not.toHaveBeenCalled();
    expect(result.current.progress.percent).toBe(0);
  });

  it("treats a 404 from the progress API as unavailable: warns, keeps saving locally, and stops calling the API", async () => {
    mocks.get.mockRejectedValue({ response: { status: 404 } });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(console.warn).toHaveBeenCalledWith(
      "Course progress API is unavailable; continuing with local progress.",
      expect.anything()
    );

    act(() => {
      result.current.reportProgress(200, 400);
    });

    expect(mocks.put).not.toHaveBeenCalled();
    expect(result.current.progress.percent).toBe(50);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({
      positionSeconds: 200,
      durationSeconds: 400,
      completed: false,
    });
  });

  it("logs a visible error when the PUT sync fails, while keeping the progress locally", async () => {
    mocks.get.mockResolvedValue({ data: { success: true, progress: [] } });
    mocks.put.mockRejectedValue({ response: { status: 500 } });

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.reportProgress(90, 600);
    });

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        "Failed to sync course progress:",
        expect.objectContaining({ response: { status: 500 } })
      )
    );
    expect(result.current.progress.positionSeconds).toBe(90);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).positionSeconds).toBe(90);
  });
});
