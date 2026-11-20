"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "./useAuth";
import axiosInstance from "@/lib/config/axios.config";
import { config } from "@/lib/config/env";

const STORAGE_PREFIX = "dnb:progress:";
const THROTTLE_MS = 15000;
const RETRY_MS = 1000;
const COMPLETION_THRESHOLD = 0.9;

export interface StoredProgressData { positionSeconds: number; durationSeconds: number; completed: boolean; updatedAt: number; version: number }
export interface CourseProgressState { percent: number; positionSeconds: number; durationSeconds: number; completed: boolean }
export type ProgressSyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";
export interface UseCourseProgressResult { progress: CourseProgressState; loading: boolean; syncStatus: ProgressSyncStatus; reportProgress: (positionSeconds: number, durationSeconds: number) => void; resetProgress: () => void; retrySync: () => Promise<void>; resumeTime: number | null; resumeLabel: string | null }

function scopeKey(userId: string): string { return `${config.apiUrl}:${userId}`; }
function getStorageKey(userId: string, courseId: string): string { return `${STORAGE_PREFIX}${userId}:${courseId}`; }
function readLocalProgress(userId: string, courseId: string): StoredProgressData | null { if (typeof window === "undefined") return null; try { const raw = localStorage.getItem(getStorageKey(userId, courseId)); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function writeLocalProgress(userId: string, courseId: string, data: StoredProgressData): void { if (typeof window === "undefined") return; try { localStorage.setItem(getStorageKey(userId, courseId), JSON.stringify(data)); } catch { /* storage is an optional cache */ } }
function removeLocalProgress(userId: string, courseId: string): void { if (typeof window !== "undefined") localStorage.removeItem(getStorageKey(userId, courseId)); }
function calcPercent(position: number, duration: number): number { return !duration || duration <= 0 ? 0 : Math.min(100, Math.round((position / duration) * 100)); }
function isCompleted(position: number, duration: number): boolean { return duration > 0 && position / duration >= COMPLETION_THRESHOLD; }
function formatTime(seconds: number): string { const m = Math.floor(seconds / 60); return `${m}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`; }
function toStored(entry: Partial<StoredProgressData> & { positionSeconds?: number; durationSeconds?: number; completed?: boolean }): StoredProgressData { return { positionSeconds: entry.positionSeconds ?? 0, durationSeconds: entry.durationSeconds ?? 0, completed: Boolean(entry.completed), updatedAt: Number(entry.updatedAt) || Date.now(), version: Number(entry.version) || 0 }; }
function toState(data: StoredProgressData): CourseProgressState { const completed = data.completed || isCompleted(data.positionSeconds, data.durationSeconds); return { positionSeconds: data.positionSeconds, durationSeconds: data.durationSeconds, completed, percent: completed ? 100 : calcPercent(data.positionSeconds, data.durationSeconds) }; }
function mergeProgress(local: StoredProgressData | null, remote: StoredProgressData | null): StoredProgressData | null {
  if (!local) return remote; if (!remote) return local;
  const newer = remote.updatedAt >= local.updatedAt ? remote : local;
  return { ...newer, completed: local.completed || remote.completed };
}
function unavailable(error: unknown): boolean { const status = (error as { response?: { status?: number } })?.response?.status; return status === 404 || status === 405; }

export function useCourseProgress(courseId: string): UseCourseProgressResult {
  const { user } = useAuth(); const userId = user?._id;
  const empty: CourseProgressState = { percent: 0, positionSeconds: 0, durationSeconds: 0, completed: false };
  const [progress, setProgress] = useState(empty); const [loading, setLoading] = useState(true); const [syncStatus, setSyncStatus] = useState<ProgressSyncStatus>("idle");
  const lastWriteRef = useRef(0); const currentRef = useRef<StoredProgressData | null>(null); const userScopeRef = useRef<string | null>(null); const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backendRef = useRef(new Map<string, boolean>());
  const key = userId && courseId ? `${scopeKey(userId)}:${courseId}` : null;

  const flushToBackend = useCallback(async (data: StoredProgressData) => {
    if (!userId || !courseId || !key || backendRef.current.get(scopeKey(userId)) === false) return;
    setSyncStatus("syncing");
    try {
      await axiosInstance.put(`/api/progress/course/${courseId}`, { positionSeconds: data.positionSeconds, durationSeconds: data.durationSeconds, completed: data.completed, lessonId: null });
      backendRef.current.set(scopeKey(userId), true); setSyncStatus("synced");
    } catch (error) {
      if (unavailable(error)) { console.warn("Course progress API is unavailable; progress remains saved locally.", error); backendRef.current.set(scopeKey(userId), false); setSyncStatus("offline"); }
      else { console.error("Failed to sync course progress:", error); setSyncStatus("error"); if (!retryTimerRef.current) retryTimerRef.current = setTimeout(() => { retryTimerRef.current = null; void flushToBackend(data); }, RETRY_MS); }
    }
  }, [courseId, key, userId]);

  const load = useCallback(async () => {
    if (!userId || !courseId) { setProgress(empty); setLoading(false); setSyncStatus("idle"); return; }
    const local = readLocalProgress(userId, courseId); if (local) { currentRef.current = local; setProgress(toState(local)); }
    setLoading(true); const apiScope = scopeKey(userId);
    if (backendRef.current.get(apiScope) === false) { setLoading(false); setSyncStatus("offline"); return; }
    try {
      const response = await axiosInstance.get("/api/progress/courses"); backendRef.current.set(apiScope, true);
      const entry = response.data?.progress?.find((item: { courseId?: unknown }) => item.courseId?.toString?.() === courseId.toString());
      const remote = entry ? toStored(entry) : null; const merged = mergeProgress(local, remote);
      if (merged) { currentRef.current = merged; writeLocalProgress(userId, courseId, merged); setProgress(toState(merged)); }
      setSyncStatus("synced");
    } catch (error) { if (unavailable(error)) console.warn("Course progress API is unavailable; continuing with local progress.", error); else console.error("Failed to fetch course progress:", error); setSyncStatus(unavailable(error) ? "offline" : "error"); }
    finally { setLoading(false); }
  }, [courseId, userId]);

  useEffect(() => { const nextScope = userId && courseId ? `${userId}:${courseId}` : null; if (userScopeRef.current !== nextScope) { userScopeRef.current = nextScope; currentRef.current = null; lastWriteRef.current = 0; setProgress(empty); } void load(); return () => { if (retryTimerRef.current) clearTimeout(retryTimerRef.current); }; }, [courseId, load, userId]);
  const retrySync = useCallback(async () => { if (!userId) return; backendRef.current.delete(scopeKey(userId)); const data = currentRef.current; if (data) await flushToBackend(data); else await load(); }, [flushToBackend, load, userId]);
  const reportProgress = useCallback((positionSeconds: number, durationSeconds: number) => { if (!userId || !courseId || !Number.isFinite(positionSeconds) || !Number.isFinite(durationSeconds)) return; const previous = currentRef.current; const completed = Boolean(previous?.completed) || isCompleted(positionSeconds, durationSeconds); const data: StoredProgressData = { positionSeconds, durationSeconds, completed, updatedAt: Date.now(), version: (previous?.version ?? 0) + 1 }; currentRef.current = data; writeLocalProgress(userId, courseId, data); setProgress(toState(data)); if (Date.now() - lastWriteRef.current >= THROTTLE_MS) { lastWriteRef.current = Date.now(); void flushToBackend(data); } }, [courseId, flushToBackend, userId]);
  const resetProgress = useCallback(() => { if (!userId || !courseId) return; const data: StoredProgressData = { positionSeconds: 0, durationSeconds: 0, completed: false, updatedAt: Date.now(), version: (currentRef.current?.version ?? 0) + 1 }; currentRef.current = data; removeLocalProgress(userId, courseId); setProgress(toState(data)); void flushToBackend(data); }, [courseId, flushToBackend, userId]);
  useEffect(() => { const flush = () => { if (document.visibilityState === "hidden" && currentRef.current) void flushToBackend(currentRef.current); }; document.addEventListener("visibilitychange", flush); return () => document.removeEventListener("visibilitychange", flush); }, [flushToBackend]);
  return { progress, loading, syncStatus, reportProgress, resetProgress, retrySync, resumeTime: !progress.completed && progress.positionSeconds > 30 && progress.percent < 90 ? progress.positionSeconds : null, resumeLabel: !progress.completed && progress.positionSeconds > 30 && progress.percent < 90 ? `Resume from ${formatTime(progress.positionSeconds)}` : null };
}

export function useAllCourseProgress(): { progressMap: Record<string, CourseProgressState>; loading: boolean; syncStatus: ProgressSyncStatus; retrySync: () => Promise<void> } {
  const { user } = useAuth(); const userId = user?._id; const [progressMap, setProgressMap] = useState<Record<string, CourseProgressState>>({}); const [loading, setLoading] = useState(true); const [syncStatus, setSyncStatus] = useState<ProgressSyncStatus>("idle"); const fetchedScope = useRef<string | null>(null);
  const load = useCallback(async () => {
    if (!userId) { setProgressMap({}); setLoading(false); return; }
    const apiScope = scopeKey(userId); setLoading(true);
    const loadLocal = () => {
      const map: Record<string, CourseProgressState> = {};
      if (typeof window !== "undefined") for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i); const prefix = `${STORAGE_PREFIX}${userId}:`;
        if (!key?.startsWith(prefix)) continue;
        const courseId = key.slice(prefix.length);
        try { const data = JSON.parse(localStorage.getItem(key) || "null"); if (data) map[courseId] = toState(toStored(data)); } catch { /* ignore a corrupt cache entry */ }
      }
      setProgressMap(map);
    };
    try {
      const response = await axiosInstance.get("/api/progress/courses"); const map: Record<string, CourseProgressState> = {};
      for (const entry of response.data?.progress ?? []) { const id = entry.courseId?.toString?.(); if (id) { const merged = mergeProgress(readLocalProgress(userId, id), toStored(entry))!; map[id] = toState(merged); writeLocalProgress(userId, id, merged); } }
      setProgressMap(map); setSyncStatus("synced"); fetchedScope.current = apiScope;
    } catch (error) { loadLocal(); setSyncStatus(unavailable(error) ? "offline" : "error"); }
    finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { if (fetchedScope.current !== (userId ? scopeKey(userId) : null)) { fetchedScope.current = null; setProgressMap({}); } void load(); }, [load, userId]);
  const retrySync = useCallback(async () => { fetchedScope.current = null; await load(); }, [load]);
  return { progressMap, loading, syncStatus, retrySync };
}

export { formatTime, calcPercent };
