"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import useAuth from "./useAuth";
import axiosInstance from "@/lib/config/axios.config";

const STORAGE_PREFIX = "dnb:progress:";
const THROTTLE_MS = 15000;
const COMPLETION_THRESHOLD = 0.9;

let backendAvailable: boolean | null = null;

function getStorageKey(userId: string, courseId: string): string {
  return `${STORAGE_PREFIX}${userId}:${courseId}`;
}

export interface StoredProgressData {
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

function readLocalProgress(userId: string, courseId: string): StoredProgressData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey(userId, courseId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalProgress(userId: string, courseId: string, data: StoredProgressData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      getStorageKey(userId, courseId),
      JSON.stringify(data)
    );
  } catch {}
}

function removeLocalProgress(userId: string, courseId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getStorageKey(userId, courseId));
  } catch {}
}

function calcPercent(positionSeconds: number, durationSeconds: number): number {
  if (!durationSeconds || durationSeconds <= 0) return 0;
  return Math.min(100, Math.round((positionSeconds / durationSeconds) * 100));
}

function isCompleted(positionSeconds: number, durationSeconds: number): boolean {
  if (!durationSeconds || durationSeconds <= 0) return false;
  return positionSeconds / durationSeconds >= COMPLETION_THRESHOLD;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface CourseProgressState {
  percent: number;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

export interface UseCourseProgressResult {
  progress: CourseProgressState;
  loading: boolean;
  reportProgress: (positionSeconds: number, durationSeconds: number) => void;
  resetProgress: () => void;
  resumeTime: number | null;
  resumeLabel: string | null;
}

export function useCourseProgress(courseId: string): UseCourseProgressResult {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgressState>({
    percent: 0,
    positionSeconds: 0,
    durationSeconds: 0,
    completed: false,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const lastWriteRef = useRef<number>(0);
  const currentDataRef = useRef<StoredProgressData | null>(null);
  const completedRef = useRef<boolean>(false);
  const apiCheckedRef = useRef<boolean>(false);

  const userId = user?._id;

  useEffect(() => {
    if (!userId || !courseId) {
      setLoading(false);
      return;
    }

    const local = readLocalProgress(userId, courseId);
    if (local) {
      const pct = calcPercent(local.positionSeconds, local.durationSeconds);
      const done = local.completed || isCompleted(local.positionSeconds, local.durationSeconds);
      const restored: CourseProgressState = {
        percent: done ? 100 : pct,
        positionSeconds: local.positionSeconds,
        durationSeconds: local.durationSeconds,
        completed: done,
      };
      setProgress(restored);
      currentDataRef.current = local;
      completedRef.current = done;
    }

    async function fetchFromApi() {
      if (backendAvailable === false) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get("/api/progress/courses");
        if (res.data?.success && Array.isArray(res.data.progress)) {
          backendAvailable = true;
          const entry = res.data.progress.find(
            (p: any) => p.courseId?.toString?.() === courseId.toString() // TODO(types): Progress entry
          );
          if (entry) {
            const pct = calcPercent(entry.positionSeconds, entry.durationSeconds);
            const done = entry.completed || isCompleted(entry.positionSeconds, entry.durationSeconds);
            const fromApi: CourseProgressState = {
              percent: done ? 100 : pct,
              positionSeconds: entry.positionSeconds,
              durationSeconds: entry.durationSeconds,
              completed: done,
            };
            setProgress(fromApi);
            currentDataRef.current = {
              positionSeconds: entry.positionSeconds,
              durationSeconds: entry.durationSeconds,
              completed: done,
            };
            completedRef.current = done;
            writeLocalProgress(userId!, courseId, currentDataRef.current);
          }
        }
      } catch (err: any) { // TODO(types): Axios error from progress fetch
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          backendAvailable = false;
        }
      } finally {
        setLoading(false);
        apiCheckedRef.current = true;
      }
    }

    fetchFromApi();
  }, [userId, courseId]);

  const flushToBackend = useCallback(
    async (data: StoredProgressData) => {
      if (backendAvailable === false) return;
      try {
        await axiosInstance.put(`/api/progress/course/${courseId}`, {
          positionSeconds: data.positionSeconds,
          durationSeconds: data.durationSeconds,
          completed: data.completed,
          lessonId: null,
        });
        backendAvailable = true;
      } catch (err: any) { // TODO(types): Axios error from progress update
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          backendAvailable = false;
        }
      }
    },
    [courseId]
  );

  const reportProgress = useCallback(
    (positionSeconds: number, durationSeconds: number) => {
      if (!userId || !courseId) return;
      if (typeof positionSeconds !== "number" || typeof durationSeconds !== "number") return;

      const done = completedRef.current || isCompleted(positionSeconds, durationSeconds);
      if (done) completedRef.current = true;

      const pct = done ? 100 : calcPercent(positionSeconds, durationSeconds);

      const data: StoredProgressData = {
        positionSeconds,
        durationSeconds,
        completed: done,
      };

      currentDataRef.current = data;

      setProgress({
        percent: pct,
        positionSeconds,
        durationSeconds,
        completed: done,
      });

      writeLocalProgress(userId, courseId, data);

      const now = Date.now();
      if (now - lastWriteRef.current >= THROTTLE_MS) {
        lastWriteRef.current = now;
        flushToBackend(data);
      }
    },
    [userId, courseId, flushToBackend]
  );

  const flushNow = useCallback(() => {
    if (currentDataRef.current && userId && courseId) {
      lastWriteRef.current = Date.now();
      flushToBackend(currentDataRef.current);
    }
  }, [userId, courseId, flushToBackend]);

  const resetProgress = useCallback(() => {
    if (!userId || !courseId) return;
    completedRef.current = false;
    currentDataRef.current = null;
    lastWriteRef.current = 0;
    const empty: CourseProgressState = {
      percent: 0,
      positionSeconds: 0,
      durationSeconds: 0,
      completed: false,
    };
    setProgress(empty);
    removeLocalProgress(userId, courseId);
    flushToBackend({
      positionSeconds: 0,
      durationSeconds: 0,
      completed: false,
    }).catch(() => {});
  }, [userId, courseId, flushToBackend]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushNow();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      flushNow();
    };
  }, [flushNow]);

  return {
    progress,
    loading,
    reportProgress,
    resetProgress,
    resumeTime:
      !progress.completed && progress.positionSeconds > 30 && progress.percent < 90
        ? progress.positionSeconds
        : null,
    resumeLabel:
      !progress.completed && progress.positionSeconds > 30 && progress.percent < 90
        ? `Resume from ${formatTime(progress.positionSeconds)}`
        : null,
  };
}

export function useAllCourseProgress(): {
  progressMap: Record<string, CourseProgressState>;
  loading: boolean;
} {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgressState>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const fetchedRef = useRef<boolean>(false);

  const userId = user?._id;

  useEffect(() => {
    if (!userId || fetchedRef.current) {
      if (!userId) setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      if (backendAvailable === false) {
        loadAllFromLocal();
        return;
      }

      try {
        const res = await axiosInstance.get("/api/progress/courses");
        if (cancelled) return;
        if (res.data?.success && Array.isArray(res.data.progress)) {
          backendAvailable = true;
          const map: Record<string, CourseProgressState> = {};
          for (const entry of res.data.progress) {
            const cid = entry.courseId?.toString?.();
            if (!cid) continue;
            const pct = calcPercent(entry.positionSeconds, entry.durationSeconds);
            const done = entry.completed || isCompleted(entry.positionSeconds, entry.durationSeconds);
            map[cid] = {
              percent: done ? 100 : pct,
              completed: done,
              positionSeconds: entry.positionSeconds,
              durationSeconds: entry.durationSeconds,
            };
            writeLocalProgress(userId!, cid, {
              positionSeconds: entry.positionSeconds,
              durationSeconds: entry.durationSeconds,
              completed: done,
            });
          }
          setProgressMap(map);
        } else {
          loadAllFromLocal();
        }
      } catch (err: any) { // TODO(types): Axios error from all progress fetch
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          backendAvailable = false;
        }
        loadAllFromLocal();
      } finally {
        fetchedRef.current = true;
        if (!cancelled) setLoading(false);
      }
    }

    function loadAllFromLocal() {
      const map: Record<string, CourseProgressState> = {};
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_PREFIX)) {
            const suffix = key.slice(STORAGE_PREFIX.length);
            const parts = suffix.split(":");
            if (parts.length === 2 && parts[0] === userId) {
              const cid = parts[1];
              try {
                const data = JSON.parse(localStorage.getItem(key) || "");
                if (data) {
                  const pct = calcPercent(data.positionSeconds, data.durationSeconds);
                  const done = data.completed || isCompleted(data.positionSeconds, data.durationSeconds);
                  map[cid] = {
                    percent: done ? 100 : pct,
                    completed: done,
                    positionSeconds: data.positionSeconds,
                    durationSeconds: data.durationSeconds,
                  };
                }
              } catch {}
            }
          }
        }
      }
      setProgressMap(map);
    }

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { progressMap, loading };
}

export { formatTime, calcPercent };
